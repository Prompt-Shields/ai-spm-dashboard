export type PiiType =
  | 'EMAIL' | 'PHONE' | 'SSN' | 'CREDIT_CARD' | 'IP' | 'API_KEY' | 'PERSON' | 'ADDRESS'

export interface PiiMatch {
  type: PiiType
  value: string
  start: number
  end: number
}

export interface MappingEntry {
  placeholder: string
  value: string
  type: PiiType
}

export interface AnonymizeResult {
  masked: string
  mapping: MappingEntry[]
}
