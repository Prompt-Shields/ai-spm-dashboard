export const aiVisibility = {
  title: 'KI-synlighet',
  subtitle:
    'Helhetlig synlighet på tvers av modeller, data, ledetekster, infrastruktur og leverandører', // TODO(i18n): native review
  summary: {
    models: 'Modeller',
    dataSources: 'Datakilder',
    prompts: 'Ledetekster',
    infrastructure: 'Infrastruktur',
    vendors: 'Leverandører',
  },
  tabs: {
    models: 'Modeller',
    data: 'Data',
    prompts: 'Ledetekster',
    infrastructure: 'Infrastruktur',
    vendors: 'Leverandører',
  },
  model: {
    inferences: '{count} inferenser/mnd',
    p95: 'P95: {value}',
  },
  data: {
    owner: 'Eier: {owner}',
  },
  infra: {
    uptime: 'Oppetid: {uptime} %',
  },
  vendor: {
    annualSpend: '{amount}/år',
    sla: 'SLA: {uptime} %',
    expires: 'Utløper: {date}',
    pending: 'Venter',
  },
}
