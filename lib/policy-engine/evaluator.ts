// Policy evaluator — runs a Policy Instance against a sample input
// for the Test Console UI. Pure function, no side effects.
//
// This is a *simulator*: in production, real PEP tools (Portkey, Prompt
// Security, etc.) do the heavy lifting. Here we run lightweight detectors
// so users can preview what a policy WOULD do before activating it.

import type {
  PolicyInstance,
  PolicyTemplate,
  PolicyTestInput,
  PolicyTestResult,
  Detector,
  ActionType
} from "../policy-templates/types"
import { getTemplateById } from "../policy-templates/templates"

// ─── Public API ──────────────────────────────────────────────────────

export function evaluatePolicy(instance: PolicyInstance, input: PolicyTestInput): PolicyTestResult {
  const start = performance.now()
  const template = getTemplateById(instance.templateId)
  if (!template) {
    return {
      matched: false,
      triggeredDetectors: [],
      actionThatWouldFire: "none",
      evaluationTimeMs: 0
    }
  }

  const triggered: PolicyTestResult["triggeredDetectors"] = []

  for (const detector of template.detectors) {
    const result = runDetector(detector, instance, template, input)
    if (result.matched) {
      triggered.push({
        detectorId: detector.id,
        confidence: result.confidence,
        matchedSubstring: result.matchedSubstring,
        explanation: result.explanation
      })
    }
  }

  const matched = triggered.length > 0
  const actionThatWouldFire: ActionType | "none" = matched
    ? mapEnforcementToAction(instance.enforcementMode)
    : "none"

  return {
    matched,
    triggeredDetectors: triggered,
    actionThatWouldFire,
    evaluationTimeMs: Math.round(performance.now() - start)
  }
}

// ─── Detector implementations ────────────────────────────────────────

interface DetectorResult {
  matched: boolean
  confidence: number
  matchedSubstring?: string
  explanation: string
}

function runDetector(
  detector: Detector,
  instance: PolicyInstance,
  template: PolicyTemplate,
  input: PolicyTestInput
): DetectorResult {
  const config = instance.parameterValues[detector.configRef]
  const text = pickTextForStage(template, input)

  switch (detector.type) {
    case "regex":
      return runRegexDetector(text, config)
    case "keyword_list":
      return runKeywordDetector(text, config)
    case "pii_detector":
      return runPiiDetector(text, instance.parameterValues)
    case "secrets_scanner":
      return runSecretsScanner(text)
    case "rate_counter":
      // Rate counters need historical state, not a single prompt.
      // For test mode we just report "would-not-fire" with explanation.
      return {
        matched: false,
        confidence: 0,
        explanation: "Rate-based detector — only fires on sustained traffic, not test inputs."
      }
    case "classifier":
      return runHeuristicClassifier(text, config, detector.id)
    case "llm_judge":
      return runHeuristicJudge(text, config, detector.id)
    case "entropy":
      return runEntropyDetector(text)
    default:
      return { matched: false, confidence: 0, explanation: "Unknown detector type" }
  }
}

// ─── Detector primitives ─────────────────────────────────────────────

function runRegexDetector(text: string, patterns: unknown): DetectorResult {
  if (!Array.isArray(patterns)) {
    return { matched: false, confidence: 0, explanation: "No patterns configured" }
  }
  for (const raw of patterns) {
    if (typeof raw !== "string" || !raw) continue
    try {
      const re = new RegExp(raw)
      const match = text.match(re)
      if (match) {
        return {
          matched: true,
          confidence: 1.0,
          matchedSubstring: match[0],
          explanation: `Matched regex pattern: ${raw}`
        }
      }
    } catch {
      // skip invalid regex
    }
  }
  return { matched: false, confidence: 0, explanation: "No regex patterns matched" }
}

function runKeywordDetector(text: string, keywords: unknown): DetectorResult {
  if (!Array.isArray(keywords)) {
    return { matched: false, confidence: 0, explanation: "No keywords configured" }
  }
  const lower = text.toLowerCase()
  for (const kw of keywords) {
    if (typeof kw !== "string" || !kw) continue
    if (lower.includes(kw.toLowerCase())) {
      return {
        matched: true,
        confidence: 0.95,
        matchedSubstring: kw,
        explanation: `Matched keyword: "${kw}"`
      }
    }
  }
  return { matched: false, confidence: 0, explanation: "No keywords matched" }
}

function runPiiDetector(text: string, params: Record<string, unknown>): DetectorResult {
  // Simple PII heuristics — production would use a proper NER model.
  const patterns: Array<{ name: string; re: RegExp }> = [
    { name: "EMAIL", re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
    { name: "PHONE", re: /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/ },
    { name: "NATIONAL_ID", re: /\b\d{3}-\d{2}-\d{4}\b/ }, // SSN-shaped
    { name: "CREDIT_CARD", re: /\b(?:\d[ -]*?){13,19}\b/ },
    { name: "IBAN", re: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/ }
  ]

  const allowedCategories = (params.redact_categories as string[]) ?? [
    "EMAIL",
    "PHONE",
    "NATIONAL_ID",
    "CREDIT_CARD"
  ]

  for (const { name, re } of patterns) {
    if (!allowedCategories.includes(name)) continue
    const match = text.match(re)
    if (match) {
      return {
        matched: true,
        confidence: 0.9,
        matchedSubstring: match[0],
        explanation: `Detected ${name}`
      }
    }
  }

  // Person-name heuristic: capitalised first/last looking sequence
  const personMatch = text.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/)
  if (personMatch && allowedCategories.includes("PERSON")) {
    return {
      matched: true,
      confidence: 0.65,
      matchedSubstring: personMatch[0],
      explanation: "Detected possible person name (heuristic — production uses NER)"
    }
  }

  return { matched: false, confidence: 0, explanation: "No PII detected" }
}

function runSecretsScanner(text: string): DetectorResult {
  const patterns: Array<{ name: string; re: RegExp }> = [
    { name: "AWS_KEY", re: /AKIA[0-9A-Z]{16}/ },
    { name: "GH_TOKEN", re: /ghp_[A-Za-z0-9]{36,}/ },
    { name: "PRIVATE_KEY", re: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/ },
    { name: "SLACK_TOKEN", re: /xox[baprs]-[A-Za-z0-9-]{10,}/ }
  ]
  for (const { name, re } of patterns) {
    const m = text.match(re)
    if (m) {
      return { matched: true, confidence: 1.0, matchedSubstring: m[0], explanation: `Detected ${name}` }
    }
  }
  return { matched: false, confidence: 0, explanation: "No secrets detected" }
}

/**
 * Heuristic classifier stand-in. In production this would call a real ML
 * model. For test mode we approximate based on suspicious vocabulary.
 */
function runHeuristicClassifier(
  text: string,
  threshold: unknown,
  detectorId: string
): DetectorResult {
  const t = typeof threshold === "number" ? threshold : 0.75
  const lower = text.toLowerCase()

  // Different vocabularies for different detectors
  const vocab: Record<string, string[]> = {
    "ml-classifier": [
      "ignore previous",
      "disregard",
      "system prompt",
      "you are now",
      "developer mode",
      "jailbreak",
      "DAN",
      "reveal your instructions"
    ],
    "toxicity-classifier": ["hate", "kill", "stupid", "racist", "harassment"],
    "similarity-check": ["you are a", "your guidelines", "never discuss", "always respond"]
  }

  const words = vocab[detectorId] ?? vocab["ml-classifier"]
  let hits = 0
  let strongest = ""
  for (const w of words) {
    if (lower.includes(w.toLowerCase())) {
      hits++
      if (w.length > strongest.length) strongest = w
    }
  }

  // Confidence scales with hit count, capped at 0.99
  const confidence = Math.min(0.4 + hits * 0.2, 0.99)
  if (confidence >= t) {
    return {
      matched: true,
      confidence,
      matchedSubstring: strongest,
      explanation: `Classifier confidence ${confidence.toFixed(2)} ≥ threshold ${t}`
    }
  }
  return {
    matched: false,
    confidence,
    explanation: `Classifier confidence ${confidence.toFixed(2)} < threshold ${t}`
  }
}

function runHeuristicJudge(
  text: string,
  threshold: unknown,
  detectorId: string
): DetectorResult {
  // LLM-judge stand-in: looks for signal phrases for proportionality / privilege.
  const t = typeof threshold === "number" ? threshold : 0.7
  const lower = text.toLowerCase()
  const signals: Record<string, string[]> = {
    "broad-query-detector": ["all customer", "everyone", "complete list", "every record", "dump"],
    "litigation-context": ["litigation", "vs ", "v. ", "settlement", "outside counsel", "privileged"]
  }
  const words = signals[detectorId] ?? []
  const hits = words.filter((w) => lower.includes(w)).length
  const confidence = Math.min(0.5 + hits * 0.15, 0.99)
  return {
    matched: confidence >= t,
    confidence,
    explanation: `Judge confidence ${confidence.toFixed(2)} (threshold ${t})`
  }
}

function runEntropyDetector(text: string): DetectorResult {
  // Shannon entropy heuristic for high-entropy strings (potential secrets)
  const words = text.split(/\s+/).filter((w) => w.length >= 20)
  for (const w of words) {
    const e = shannonEntropy(w)
    if (e > 4.5) {
      return {
        matched: true,
        confidence: Math.min(e / 6, 0.99),
        matchedSubstring: w,
        explanation: `High-entropy string detected (entropy=${e.toFixed(2)})`
      }
    }
  }
  return { matched: false, confidence: 0, explanation: "No high-entropy strings" }
}

function shannonEntropy(s: string): number {
  const freq: Record<string, number> = {}
  for (const ch of s) freq[ch] = (freq[ch] ?? 0) + 1
  const len = s.length
  let entropy = 0
  for (const k in freq) {
    const p = freq[k] / len
    entropy -= p * Math.log2(p)
  }
  return entropy
}

// ─── Helpers ─────────────────────────────────────────────────────────

function pickTextForStage(template: PolicyTemplate, input: PolicyTestInput): string {
  // For test mode, prefer the prompt; if template only triggers on output,
  // use the expectedOutput when provided.
  const stages = template.triggers.map((t) => t.stage)
  if (stages.includes("input")) return input.prompt
  if (stages.includes("output") && input.expectedOutput) return input.expectedOutput
  if (stages.includes("output")) return input.prompt // fall back
  return input.prompt
}

function mapEnforcementToAction(mode: PolicyInstance["enforcementMode"]): ActionType {
  switch (mode) {
    case "block":
      return "block"
    case "redact":
      return "redact"
    case "flag":
      return "flag"
    case "log":
      return "log"
    default:
      return "log"
  }
}
