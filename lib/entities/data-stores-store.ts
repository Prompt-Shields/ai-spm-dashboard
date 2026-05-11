// DataStore CRUD store. The "data" entity in the Ardoq Logical
// Information workspace — CRMs, claims databases, document repositories,
// etc. Manual entry today; future Atlan/Collibra sync replaces the
// admin path without changing this interface.

import type { DataStore } from "./types"
import { createMemoryStore } from "./store-base"

export const dataStoresStore = createMemoryStore<DataStore>("data-stores")
