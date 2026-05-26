import type { Messages } from '../types'
import { en } from './en'

// French. Starts as a deep copy of en; namespaces are translated per-page in
// Phase B. Use a deep clone so editing one namespace never leaks into en/nb
// through a shared reference.
export const fr: Messages = structuredClone(en)
