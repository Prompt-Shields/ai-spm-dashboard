'use client'
import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Download, ShieldAlert } from 'lucide-react'
import { SAAS_VENDORS } from '@/lib/vendor-data'
import type { SaaSVendor, VendorCategory } from '@/lib/vendor-types'
import type { ComplianceLevel, Mitigation } from '@/lib/aimaps-types'
import { RiskChip } from '@/components/risk-chip'
import { useT } from '@/lib/i18n/provider'

const CATEGORY_STYLE: Record<VendorCategory, string> = {
  'llm-provider': 'bg-blue-100 text-blue-700',
  'productivity-suite': 'bg-violet-100 text-violet-700',
  'developer-tool': 'bg-emerald-100 text-emerald-700',
  'crm-support': 'bg-amber-100 text-amber-700',
  'data-analytics': 'bg-cyan-100 text-cyan-700',
}

const CATEGORY_KEY: Record<VendorCategory, string> = {
  'llm-provider': 'catLlmProvider',
  'productivity-suite': 'catProductivitySuite',
  'developer-tool': 'catDeveloperTool',
  'crm-support': 'catCrmSupport',
  'data-analytics': 'catDataAnalytics',
}

const COMPLIANCE_STYLE: Record<ComplianceLevel, string> = {
  covered: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  gap: 'bg-red-100 text-red-700',
}

const MITIGATION_STYLE: Record<Mitigation['status'], string> = {
  applied: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  'not-applied': 'bg-red-100 text-red-700',
}

const MITIGATION_KEY: Record<Mitigation['status'], string> = {
  applied: 'statusApplied',
  pending: 'statusPending',
  'not-applied': 'statusNotApplied',
}

function riskColor(score: number): string {
  if (score >= 60) return 'text-red-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-green-600'
}

function toCsv(vendors: SaaSVendor[]): string {
  const header = ['Vendor', 'AI feature', 'Category', 'Risk score', 'EU AI Act', 'DPA', 'Sub-processors']
  const rows = vendors.map((v) => [
    v.name,
    v.aiFeature,
    v.category,
    String(v.riskScore),
    v.complianceStatus.euAiAct,
    v.dpa ? 'yes' : 'no',
    v.subProcessors.join('; '),
  ])
  return [header, ...rows]
    .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

export default function SaaSVendorAIPage() {
  const t = useT()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set(SAAS_VENDORS.map((v) => v.category)))]

  const filtered = SAAS_VENDORS.filter(
    (v) =>
      (filterCategory === 'all' || v.category === filterCategory) &&
      (!search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.aiFeature.toLowerCase().includes(search.toLowerCase())),
  )

  const kpis = [
    { label: t('vendor.kpiVendors'), value: SAAS_VENDORS.length, color: 'text-slate-700' },
    {
      label: t('vendor.kpiHighRisk'),
      value: SAAS_VENDORS.filter((v) => v.riskScore >= 60).length,
      color: 'text-red-600',
    },
    {
      label: t('vendor.kpiTrainsOnData'),
      value: SAAS_VENDORS.filter((v) => v.dataFlows.some((f) => f.trainsOnData)).length,
      color: 'text-amber-600',
    },
    {
      label: t('vendor.kpiNoDpa'),
      value: SAAS_VENDORS.filter((v) => !v.dpa).length,
      color: 'text-red-600',
    },
  ]

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'saas-vendor-ai.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('vendor.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('vendor.subtitle', { count: SAAS_VENDORS.length })}
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg"
        >
          <Download size={14} />
          {t('vendor.exportCsv')}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('vendor.searchPlaceholder')}
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? t('vendor.allCategories') : t(`vendor.${CATEGORY_KEY[c as VendorCategory]}`)}
            </option>
          ))}
        </select>
        <div className="ml-auto text-xs text-slate-400">
          {t('vendor.vendorsCount', { count: filtered.length })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {[
                t('vendor.colVendor'),
                t('vendor.colCategory'),
                t('vendor.colRisk'),
                t('vendor.colData'),
                t('vendor.colCompliance'),
                t('vendor.colDpa'),
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const isOpen = expanded === v.id
              const trains = v.dataFlows.some((f) => f.trainsOnData)
              return (
                <React.Fragment key={v.id}>
                  <tr
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(isOpen ? null : v.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-500">{v.aiFeature}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_STYLE[v.category]}`}
                      >
                        {t(`vendor.${CATEGORY_KEY[v.category]}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${riskColor(v.riskScore)}`}>{v.riskScore}</span>
                    </td>
                    <td className="px-4 py-3">
                      {trains ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                          <ShieldAlert size={13} />
                          {t('vendor.trainsOnData')}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{t('vendor.dataSafe')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${COMPLIANCE_STYLE[v.complianceStatus.euAiAct]}`}
                      >
                        {v.complianceStatus.euAiAct}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.dpa ? (
                        <span className="text-xs text-green-700">{t('vendor.dpaSigned')}</span>
                      ) : (
                        <span className="text-xs font-medium text-red-700">{t('vendor.dpaMissing')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Left: supply chain */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                {t('vendor.secModels')}
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {v.models.map((m) => (
                                  <span
                                    key={m}
                                    className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                {t('vendor.secSubProcessors')}
                              </h4>
                              <p className="text-xs text-slate-600">
                                {v.subProcessors.length
                                  ? v.subProcessors.join(' · ')
                                  : t('vendor.noneDeclared')}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                {t('vendor.secDataFlows')}
                              </h4>
                              <ul className="space-y-1">
                                {v.dataFlows.map((f) => (
                                  <li key={f.id} className="text-xs text-slate-600 flex items-center gap-2">
                                    <span className="font-mono text-[10px] uppercase text-slate-400">
                                      {f.classification}
                                    </span>
                                    <span>{f.description}</span>
                                    {f.trainsOnData && (
                                      <span className="text-red-600 font-medium">· {t('vendor.trainsOnData')}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Right: risks + mitigations */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                {t('vendor.secRisks')}
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {v.risks.map((r) => (
                                  <RiskChip key={r.id} risk={r} />
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                {t('vendor.secMitigations')}
                              </h4>
                              <ul className="space-y-2">
                                {v.mitigations.map((m) => (
                                  <li key={m.id} className="flex items-start gap-2">
                                    <span
                                      className={`shrink-0 mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${MITIGATION_STYLE[m.status]}`}
                                    >
                                      {t(`vendor.${MITIGATION_KEY[m.status]}`)}
                                    </span>
                                    <div>
                                      <div className="text-xs font-medium text-slate-800">{m.name}</div>
                                      <div className="text-xs text-slate-500">{m.description}</div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {t('vendor.reviewed', { date: v.lastReviewedAt })}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
