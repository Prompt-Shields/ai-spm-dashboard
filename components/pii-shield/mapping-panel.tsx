'use client'
import type { MappingEntry } from '@/lib/pii/types'
import { PII_TYPE_LABEL } from './highlighted-text'

export function MappingPanel({ mapping }: { mapping: MappingEntry[] }) {
  if (mapping.length === 0) {
    return <p className="text-sm text-slate-400">No PII detected.</p>
  }
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-slate-400">
          <th className="pb-2 font-medium">Placeholder</th>
          <th className="pb-2 font-medium">Type</th>
          <th className="pb-2 font-medium">Original</th>
        </tr>
      </thead>
      <tbody className="align-top">
        {mapping.map((e) => (
          <tr key={e.placeholder} className="border-t border-slate-100">
            <td className="whitespace-nowrap py-1.5 pr-2 font-mono text-indigo-600">{e.placeholder}</td>
            <td className="py-1.5 pr-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">{PII_TYPE_LABEL[e.type]}</span>
            </td>
            <td className="break-all py-1.5 font-mono text-slate-700">{e.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
