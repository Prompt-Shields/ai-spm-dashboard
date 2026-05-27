export const ardoq = {
  header: {
    title: 'Ardoq export',
    description:
      'Download a 9-CSV bundle matching Ardoq AI Lens import schema. Drop the ZIP into the Ardoq import wizard — entities, owners, data stores, references, compliance assessments all flow through in one round-trip.',
  },
  apiKey: {
    label: 'Admin API key',
    hintBefore: 'Set ',
    hintAfter:
      ' in the deployment environment, paste the same value here. Lives in sessionStorage — cleared when the tab closes.',
  },
  actions: {
    loading: 'Loading…',
    refreshPreview: 'Refresh preview',
    previewExport: 'Preview export',
    downloading: 'Downloading…',
    downloadZip: 'Download ZIP',
  },
  manifest: {
    meta: 'Generated {date} · tenant {tenant}',
    colFile: 'File',
    colRows: 'Rows',
    colSize: 'Size',
  },
  errors: {
    pasteKeyFirst: 'Paste your admin API key first.',
    fetchManifestHttp: 'Failed to fetch manifest (HTTP {status})',
    fetchManifest: 'Failed to fetch manifest.',
    downloadZipHttp: 'Failed to download ZIP (HTTP {status})',
    downloadZip: 'Failed to download ZIP.',
  },
}
