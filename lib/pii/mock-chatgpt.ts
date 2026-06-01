const PH = /\[[A-Z_]+_\d+\]/g

export function simulateReply(maskedPrompt: string): string {
  const placeholders = [...maskedPrompt.matchAll(PH)].map((m) => m[0])
  if (placeholders.length === 0) {
    return "Here's a concise, helpful answer to your question. (This is a simulated ChatGPT response for the demo.)"
  }
  const wantsEmail = /\b(email|draft|write|message)\b/i.test(maskedPrompt)
  const list = placeholders.join(', ')
  if (wantsEmail) {
    const person = placeholders.find((p) => p.startsWith('[PERSON')) ?? 'there'
    return `Sure — here's a draft you can send:\n\nHi ${person},\n\nI'm following up regarding the details you shared (${list}). Please let me know if anything needs updating.\n\nBest regards`
  }
  return `Thanks for the details. Based on what you provided (${list}), here are the next steps you can take. (Simulated ChatGPT response — it only ever saw the anonymized placeholders above.)`
}
