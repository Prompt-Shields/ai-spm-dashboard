import type { Messages } from '../types'
import { en } from './en'

// Norwegian Bokmål. Starts as a deep copy of en; namespaces are translated
// per-page in Phase B. Use a deep clone so editing one namespace never leaks
// into en/fr through a shared reference.
export const nb: Messages = structuredClone(en)
