// TechnologyService CRUD store. Cloud infrastructure that hosts AI
// applications: Azure OpenAI, AWS Bedrock, internal API gateways, etc.
// Manual today; future cloud-IAM/CMDB sync (Azure ARM, AWS Config)
// replaces the manual path.

import type { TechnologyService } from "./types"
import { createMemoryStore } from "./store-base"

export const technologyServicesStore = createMemoryStore<TechnologyService>("technology-services")
