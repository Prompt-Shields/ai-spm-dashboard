// GET /api/ardoq/export
//   Default: JSON manifest with totals + file list (no CSV bodies — keeps
//            the response cheap). The dashboard's "Generate" button calls
//            this to render row counts before download.
//   ?file=<name>: stream a single CSV (e.g. ?file=02_applications.csv)
//                 with Content-Disposition for download.
//   ?bundle=1:   return JSON with every CSV inlined as a `csv` string,
//                ready for a client-side ZIP build (no server-side ZIP
//                dependency yet — keeps this PR dep-free).
//
// All responses are tenant-scoped. We use DEFAULT_TENANT_ID until the
// auth layer is wired up; the boundary is centralised in
// `lib/entities/types.ts` so cursor's atlas.ai port flips this in one place.

import { NextResponse, type NextRequest } from "next/server"
import { exportArdoqBundle } from "@/lib/entities/ardoq-export"
import { DEFAULT_TENANT_ID } from "@/lib/entities/types"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const fileParam = url.searchParams.get("file")
  const bundleParam = url.searchParams.get("bundle")

  // Until auth lands, every request operates against the demo tenant.
  // Atlas.ai port will replace this with `currentUser.tenantId`.
  const tenantId = DEFAULT_TENANT_ID
  const bundle = exportArdoqBundle(tenantId)

  // Mode 1: stream a single CSV
  if (fileParam) {
    const file = bundle.files.find((f) => f.name === fileParam)
    if (!file) {
      return NextResponse.json(
        {
          error: "unknown_file",
          available: bundle.files.map((f) => f.name),
        },
        { status: 404 },
      )
    }
    return new NextResponse(file.csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Cache-Control": "no-store",
      },
    })
  }

  // Mode 2: full bundle as JSON (for client-side ZIP)
  if (bundleParam === "1") {
    return NextResponse.json(bundle, {
      headers: { "Cache-Control": "no-store" },
    })
  }

  // Mode 3 (default): manifest only — totals + file list, no CSV bodies
  return NextResponse.json(
    {
      generatedAt: bundle.generatedAt,
      tenantId: bundle.tenantId,
      totals: bundle.totals,
      files: bundle.files.map((f) => ({
        name: f.name,
        bytes: Buffer.byteLength(f.csv, "utf-8"),
        downloadUrl: `/api/ardoq/export?file=${encodeURIComponent(f.name)}`,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
