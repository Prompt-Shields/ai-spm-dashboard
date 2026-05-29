export const ardoq = {
  header: {
    title: 'Ardoq-eksport',
    description:
      'Last ned en pakke med 9 CSV-filer som følger Ardoq AI Lens-importskjemaet. Slipp ZIP-filen inn i Ardoqs importveiviser — entiteter, eiere, datalagre, referanser og samsvarsvurderinger følger alle med i én operasjon.', // TODO(i18n): native review
  },
  apiKey: {
    label: 'Admin-API-nøkkel',
    hintBefore: 'Angi ',
    hintAfter:
      ' i distribusjonsmiljøet, og lim inn den samme verdien her. Lagres i sessionStorage — tømmes når fanen lukkes.', // TODO(i18n): native review
  },
  actions: {
    loading: 'Laster…',
    refreshPreview: 'Oppdater forhåndsvisning',
    previewExport: 'Forhåndsvis eksport',
    downloading: 'Laster ned…',
    downloadZip: 'Last ned ZIP',
  },
  manifest: {
    meta: 'Generert {date} · leietaker {tenant}',
    colFile: 'Fil',
    colRows: 'Rader',
    colSize: 'Størrelse',
  },
  errors: {
    pasteKeyFirst: 'Lim inn admin-API-nøkkelen din først.',
    fetchManifestHttp: 'Kunne ikke hente manifestet (HTTP {status})',
    fetchManifest: 'Kunne ikke hente manifestet.',
    downloadZipHttp: 'Kunne ikke laste ned ZIP (HTTP {status})',
    downloadZip: 'Kunne ikke laste ned ZIP.',
  },
}
