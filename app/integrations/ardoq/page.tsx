'use client'

// Ardoq integration admin page.
//
// What lives here today:
//   - Status preview: row counts by entity (calls /api/ardoq/export
//     with the saved admin key → renders the manifest).
//   - One-click "Download ZIP" button (calls /api/ardoq/export?zip=1).
//
// What lives here later:
//   - Per-file CSV download links (re-uses ?file=<name>).
//   - Push-to-Ardoq mode once Ardoq's API token lives in our settings.
//   - Last-export timestamp + history.
//
// Auth note: this page is API-key-gated (see lib/auth/admin-gate.ts).
// The admin pastes their ATLAS_ADMIN_API_KEY into the field below; it
// lives in sessionStorage so it survives reloads within the session
// but doesn't persist across browser restarts — a deliberate
// short-lived shape until the atlas.ai session-based auth port lands.

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n/provider'

interface ExportManifestFile {
  name: string
  bytes: number
  downloadUrl: string
}

interface ExportManifest {
  generatedAt: string
  tenantId: string
  totals: Record<string, number>
  files: ExportManifestFile[]
  zipUrl: string
}

const KEY_STORAGE = 'atlas.adminApiKey'

export default function ArdoqIntegrationPage() {
  const t = useT()
  const [adminKey, setAdminKey] = useState('')
  const [manifest, setManifest] = useState<ExportManifest | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hydrate the key from sessionStorage on mount so the manifest can
  // refresh without re-pasting. Empty when no key has been entered yet
  // — the input renders blank in that case.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.sessionStorage.getItem(KEY_STORAGE) || ''
    setAdminKey(saved)
  }, [])

  function persistKey(value: string) {
    setAdminKey(value)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(KEY_STORAGE, value)
    }
  }

  async function fetchManifest() {
    if (!adminKey.trim()) {
      setError(t('ardoq.errors.pasteKeyFirst'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ardoq/export', {
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
        cache: 'no-store',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          body?.message ||
            t('ardoq.errors.fetchManifestHttp', { status: res.status }),
        )
      }
      const data: ExportManifest = await res.json()
      setManifest(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('ardoq.errors.fetchManifest'))
    } finally {
      setLoading(false)
    }
  }

  async function downloadZip() {
    if (!adminKey.trim()) {
      setError(t('ardoq.errors.pasteKeyFirst'))
      return
    }
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch('/api/ardoq/export?zip=1', {
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          body?.message ||
            t('ardoq.errors.downloadZipHttp', { status: res.status }),
        )
      }
      // Pull the filename out of Content-Disposition so the download
      // matches what the server stamped (date-stamped).
      const dispositionRaw = res.headers.get('Content-Disposition') || ''
      const match = dispositionRaw.match(/filename="?([^"]+)"?/)
      const filename = match?.[1] || 'atlas-ardoq-export.zip'

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('ardoq.errors.downloadZip'))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">{t('ardoq.header.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('ardoq.header.description')}
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
          {t('ardoq.apiKey.label')}
        </label>
        <p className="text-xs text-slate-500 mb-2">
          {t('ardoq.apiKey.hintBefore')}
          <code className="rounded bg-slate-100 px-1">ATLAS_ADMIN_API_KEY</code>
          {t('ardoq.apiKey.hintAfter')}
        </p>
        <input
          type="password"
          value={adminKey}
          onChange={(e) => persistKey(e.target.value)}
          placeholder="atlas_admin_…"
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm font-mono"
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchManifest}
            disabled={loading || !adminKey.trim()}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? t('ardoq.actions.loading')
              : manifest
                ? t('ardoq.actions.refreshPreview')
                : t('ardoq.actions.previewExport')}
          </button>
          <button
            type="button"
            onClick={downloadZip}
            disabled={downloading || !adminKey.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? t('ardoq.actions.downloading') : t('ardoq.actions.downloadZip')}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded bg-red-50 px-3 py-2 text-xs text-red-800">
            {error}
          </p>
        )}

        {manifest && (
          <div className="mt-4">
            <div className="mb-2 text-xs text-slate-500">
              {t('ardoq.manifest.meta', {
                date: new Date(manifest.generatedAt).toLocaleString(),
                tenant: manifest.tenantId,
              })}
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-1.5 pr-3 font-medium">{t('ardoq.manifest.colFile')}</th>
                  <th className="py-1.5 pr-3 font-medium text-right">{t('ardoq.manifest.colRows')}</th>
                  <th className="py-1.5 pr-3 font-medium text-right">{t('ardoq.manifest.colSize')}</th>
                </tr>
              </thead>
              <tbody>
                {manifest.files.map((file) => {
                  const totalKey = file.name
                    .replace(/^\d+_/, '')
                    .replace(/\.csv$/, '')
                  const rows = manifest.totals[totalKey] ?? '—'
                  return (
                    <tr key={file.name} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3 font-mono text-xs text-slate-700">
                        {file.name}
                      </td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">
                        {rows}
                      </td>
                      <td className="py-1.5 pr-3 text-right tabular-nums text-slate-500">
                        {formatBytes(file.bytes)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
