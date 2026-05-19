// GET /api/ardoq/export
//   Default: JSON manifest with totals + file list (no CSV bodies — keeps
//            the response cheap). The dashboard's "Generate" button calls
//            this to render row counts before download.
//   ?file=<name>: stream a single CSV (e.g. ?file=02_applications.csv)
//                 with Content-Disposition for download.
//   ?bundle=1:   return JSON with every CSV inlined as a `csv` string,
//                ready for a client-side ZIP build. Kept for clients
//                that want to assemble the ZIP themselves.
//   ?zip=1:      stream the whole bundle as a single ZIP attachment
//                (`atlas-ardoq-export-YYYY-MM-DD.zip`). The 80% admin
//                path now: one click, one download.
//
// All responses are tenant-scoped. We use DEFAULT_TENANT_ID until the
// auth layer is wired up; the boundary is centralised in
// `lib/entities/types.ts` so cursor's atlas.ai port flips this in one place.

import { NextResponse, type NextRequest } from "next/server"
import { zipSync, strToU8 } from "fflate"
import { exportArdoqBundle } from "@/lib/entities/ardoq-export"
import { DEFAULT_TENANT_ID } from "@/lib/entities/types"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const fileParam = url.searchParams.get("file")
  const bundleParam = url.searchParams.get("bundle")
  const zipParam = url.searchParams.get("zip")

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

  // Mode 2: streamed ZIP of all 9 CSVs (one-click admin download)
  if (zipParam === "1") {
    // fflate's `zipSync` takes a record of { filename: Uint8Array } and
    // returns a single Uint8Array — fine for the 9-file Ardoq bundle
    // even on big tenants (everything stays in memory; the synchronous
    // path is cheaper than the async one for sub-MB payloads).
    const filesForZip: Record<string, Uint8Array> = {}
    for (const file of bundle.files) {
      filesForZip[file.name] = strToU8(file.csv)
    }
    const zipBytes = zipSync(filesForZip, {
      // Mid-range compression. CSVs deflate well; level 6 trades a bit
      // of CPU for ~70% size reduction on typical tenant data.
      level: 6,
    })

    // Date-stamped filename — admins downloading repeatedly during a
    // tenant onboarding cycle want them sorted by date in Downloads.
    const ymd = new Date().toISOString().slice(0, 10)
    const zipName = `atlas-ardoq-export-${ymd}.zip`

    return new NextResponse(zipBytes as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
        "Content-Length": String(zipBytes.byteLength),
        "Cache-Control": "no-store",
      },
    })
  }

  // Mode 3: full bundle as JSON (for client-side ZIP / preview)
  if (bundleParam === "1") {
    return NextResponse.json(bundle, {
      headers: { "Cache-Control": "no-store" },
    })
  }

  // Mode 4 (default): manifest only — totals + file list, no CSV bodies
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
      // Promote the one-click download URL up to the manifest so the
      // dashboard doesn't need to know the URL shape.
      zipUrl: "/api/ardoq/export?zip=1",
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
