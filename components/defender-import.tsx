'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  FileImage,
  ImageUp,
  Loader2,
  ScanText,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { useT } from '@/lib/i18n/provider'
import {
  DEFENDER_EXTRACTED_APPS,
  DEFENDER_ENRICHMENTS,
  extractedAppToApplication,
} from '@/lib/defender-import-data'

type Step = 'upload' | 'scanning' | 'review' | 'done'
type RowStatus = 'idle' | 'pending' | 'added' | 'failed'

const SCAN_STAGE_MS = 1200
const ENRICH_ROW_MS = 350
const SAMPLE_SRC = '/samples/defender-shadow-apps.svg'
const SCAN_STAGES = ['stage1', 'stage2', 'stage3'] as const

function riskTone(score: number): string {
  if (score >= 75) return 'bg-red-50 text-red-600'
  if (score >= 55) return 'bg-amber-50 text-amber-600'
  return 'bg-emerald-50 text-emerald-600'
}

export function DefenderImport() {
  const t = useT()
  const [step, setStep] = useState<Step>('upload')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [scanStage, setScanStage] = useState(0)
  const [enrichedCount, setEnrichedCount] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEFENDER_EXTRACTED_APPS.map(a => a.slug))
  )
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({})
  const [committing, setCommitting] = useState(false)
  const [addedCount, setAddedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Revoke the preview object URL on unmount.
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    []
  )

  const startScan = useCallback((src: string) => {
    setImageSrc(src)
    setUploadError(false)
    setScanStage(0)
    setStep('scanning')
  }, [])

  const acceptFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        setUploadError(true)
        return
      }
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      startScan(url)
    },
    [startScan]
  )

  // Route the bundled sample through the same validation path as a real
  // upload (spec decision #2); fall back to loading it directly if the
  // fetch fails (e.g. offline dev server edge cases).
  const useSample = useCallback(async () => {
    try {
      const res = await fetch(SAMPLE_SRC)
      const blob = await res.blob()
      acceptFile(
        new File([blob], 'defender-shadow-apps.svg', { type: blob.type || 'image/svg+xml' })
      )
    } catch {
      startScan(SAMPLE_SRC)
    }
  }, [acceptFile, startScan])

  // Scanning: advance through the staged status lines, then move to review.
  useEffect(() => {
    if (step !== 'scanning') return
    if (scanStage >= SCAN_STAGES.length) {
      setEnrichedCount(0)
      setStep('review')
      return
    }
    const id = setTimeout(() => setScanStage(s => s + 1), SCAN_STAGE_MS)
    return () => clearTimeout(id)
  }, [step, scanStage])

  // Review: reveal enrichment row by row.
  useEffect(() => {
    if (step !== 'review' || enrichedCount >= DEFENDER_EXTRACTED_APPS.length) return
    const id = setTimeout(() => setEnrichedCount(c => c + 1), ENRICH_ROW_MS)
    return () => clearTimeout(id)
  }, [step, enrichedCount])

  const toggleRow = (slug: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })

  const commit = useCallback(
    async (onlyFailed: boolean) => {
      setCommitting(true)
      const targets = DEFENDER_EXTRACTED_APPS.filter(
        a =>
          selected.has(a.slug) &&
          rowStatus[a.slug] !== 'added' &&
          (!onlyFailed || rowStatus[a.slug] === 'failed')
      )
      const statuses: Record<string, RowStatus> = { ...rowStatus }
      for (const app of targets) {
        statuses[app.slug] = 'pending'
        setRowStatus({ ...statuses })
        try {
          const record = extractedAppToApplication(
            app,
            DEFENDER_ENRICHMENTS[app.slug],
            new Date().toISOString()
          )
          const res = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          })
          statuses[app.slug] = res.ok ? 'added' : 'failed'
        } catch {
          statuses[app.slug] = 'failed'
        }
        setRowStatus({ ...statuses })
      }
      setCommitting(false)
      const added = DEFENDER_EXTRACTED_APPS.filter(
        a => selected.has(a.slug) && statuses[a.slug] === 'added'
      ).length
      setAddedCount(added)
      const failed = DEFENDER_EXTRACTED_APPS.some(
        a => selected.has(a.slug) && statuses[a.slug] === 'failed'
      )
      if (!failed) setStep('done')
    },
    [selected, rowStatus]
  )

  const restart = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setImageSrc(null)
    setRowStatus({})
    setSelected(new Set(DEFENDER_EXTRACTED_APPS.map(a => a.slug)))
    setAddedCount(0)
    setStep('upload')
  }

  const anyFailed = DEFENDER_EXTRACTED_APPS.some(
    a => selected.has(a.slug) && rowStatus[a.slug] === 'failed'
  )
  const enrichmentDone = enrichedCount >= DEFENDER_EXTRACTED_APPS.length
  // Rows the Add button would actually send — mirrors commit()'s filter.
  const pendingCount = DEFENDER_EXTRACTED_APPS.filter(
    a => selected.has(a.slug) && rowStatus[a.slug] !== 'added'
  ).length

  // If the user deselects every failed row after a partial commit, nothing
  // is left to send — advance to done rather than stranding the review step.
  useEffect(() => {
    if (step !== 'review' || committing) return
    const added = DEFENDER_EXTRACTED_APPS.filter(a => rowStatus[a.slug] === 'added').length
    if (added > 0 && pendingCount === 0) {
      setAddedCount(added)
      setStep('done')
    }
  }, [step, committing, rowStatus, pendingCount])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-3"
        >
          <ArrowLeft size={14} />
          {t('defenderImport.backToDiscover')}
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">{t('defenderImport.title')}</h1>
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
            {t('defenderImport.badge')}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">{t('defenderImport.subtitle')}</p>
      </div>

      {/* Step: upload */}
      {step === 'upload' && (
        <div className="max-w-2xl">
          <div
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              acceptFile(e.dataTransfer.files?.[0])
            }}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              dragOver ? 'border-sky-400 bg-sky-50' : 'border-slate-300 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
              <ImageUp size={22} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              {t('defenderImport.upload.dropTitle')}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{t('defenderImport.upload.dropHint')}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
              >
                {t('defenderImport.upload.browse')}
              </button>
              <span className="text-xs text-slate-400">{t('defenderImport.upload.or')}</span>
              <button
                onClick={useSample}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 transition-colors inline-flex items-center gap-1.5"
              >
                <FileImage size={14} />
                {t('defenderImport.upload.sample')}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => acceptFile(e.target.files?.[0])}
            />
          </div>
          {uploadError && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 mt-3">
              <ShieldAlert size={14} />
              {t('defenderImport.upload.invalidType')}
            </p>
          )}
        </div>
      )}

      {/* Step: scanning */}
      {step === 'scanning' && imageSrc && (
        <div className="max-w-2xl">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied blob/object URL preview */}
            <img src={imageSrc} alt="" className="w-full opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/20 to-transparent animate-pulse" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <ScanText size={16} className="text-sky-600" />
              {t('defenderImport.scanning.title')}
            </div>
            <ul className="space-y-2">
              {SCAN_STAGES.map((key, i) => (
                <li key={key} className="flex items-center gap-2 text-xs">
                  {i < scanStage ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : i === scanStage ? (
                    <Loader2 size={14} className="text-sky-500 animate-spin" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                  )}
                  <span className={i <= scanStage ? 'text-slate-700' : 'text-slate-400'}>
                    {t(`defenderImport.scanning.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step: review */}
      {step === 'review' && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {t('defenderImport.review.title')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('defenderImport.review.subtitle', { count: DEFENDER_EXTRACTED_APPS.length })}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-400">
                  <th className="p-3 w-8" aria-hidden="true" />
                  <th className="p-3 font-medium">{t('defenderImport.table.app')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.defenderScore')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.users')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.traffic')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.lastSeen')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.vendor')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.capability')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.models')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.trains')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.classification')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.risk')}</th>
                  <th className="p-3 w-20" aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {DEFENDER_EXTRACTED_APPS.map((app, i) => {
                  const enriched = i < enrichedCount
                  const e = DEFENDER_ENRICHMENTS[app.slug]
                  const status = rowStatus[app.slug] ?? 'idle'
                  return (
                    <tr key={app.slug} className="border-b border-slate-100 last:border-0">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          aria-label={app.name}
                          checked={selected.has(app.slug)}
                          disabled={committing || status === 'added'}
                          onChange={() => toggleRow(app.slug)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{app.name}</div>
                        <div className="text-slate-400">{app.category}</div>
                      </td>
                      <td className="p-3 text-slate-600">{app.defenderScore}/10</td>
                      <td className="p-3 text-slate-600">{app.users}</td>
                      <td className="p-3 text-slate-600">{app.trafficUploaded}</td>
                      <td className="p-3 text-slate-600">{app.lastSeen}</td>
                      {enriched ? (
                        <>
                          <td className="p-3 text-slate-600">
                            <div>{e.vendor}</div>
                            {e.certifications.length > 0 && (
                              <div className="text-slate-400">{e.certifications.join(', ')}</div>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 max-w-[160px]" title={e.note}>
                            {e.aiCapability}
                          </td>
                          <td className="p-3 text-slate-600">{e.models.join(', ')}</td>
                          <td className="p-3">
                            <span className={e.trainsOnData ? 'text-red-600 font-semibold' : 'text-emerald-600'}>
                              {t(e.trainsOnData ? 'defenderImport.table.trainsYes' : 'defenderImport.table.trainsNo')}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 capitalize">{e.dataClassification}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${riskTone(e.riskScore)}`}>
                              {e.riskScore}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td colSpan={6} className="p-3 text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" />
                            {t('defenderImport.review.enriching')}
                          </span>
                        </td>
                      )}
                      <td className="p-3">
                        {status === 'pending' && <Loader2 size={14} className="animate-spin text-sky-500" />}
                        {status === 'added' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 size={13} />
                            {t('defenderImport.rowStatus.added')}
                          </span>
                        )}
                        {status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <XCircle size={13} />
                            {t('defenderImport.rowStatus.failed')}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => commit(false)}
              disabled={committing || !enrichmentDone || pendingCount === 0}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {committing && <Loader2 size={13} className="animate-spin" />}
              {t(committing ? 'defenderImport.review.adding' : 'defenderImport.review.addButton', {
                count: pendingCount,
              })}
            </button>
            {anyFailed && !committing && (
              <button
                onClick={() => commit(true)}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              >
                {t('defenderImport.review.retryButton')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div className="max-w-xl bg-white border border-emerald-200 rounded-xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            {t('defenderImport.done.title', { count: addedCount })}
          </h2>
          <p className="text-xs text-slate-500 mb-6">{t('defenderImport.done.body')}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/discover"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
              {t('defenderImport.backToDiscover')}
            </Link>
            <button
              onClick={restart}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {t('defenderImport.done.importAnother')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
