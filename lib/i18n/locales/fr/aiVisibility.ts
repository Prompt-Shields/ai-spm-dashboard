export const aiVisibility = {
  title: 'Visibilité de l’IA',
  subtitle:
    'Visibilité de bout en bout sur les modèles, les données, les invites, l’infrastructure et les fournisseurs', // TODO(i18n): native review
  summary: {
    models: 'Modèles',
    dataSources: 'Sources de données',
    prompts: 'Invites',
    infrastructure: 'Infrastructure',
    vendors: 'Fournisseurs',
  },
  tabs: {
    models: 'Modèles',
    data: 'Données',
    prompts: 'Invites',
    infrastructure: 'Infrastructure',
    vendors: 'Fournisseurs',
  },
  model: {
    inferences: '{count} inférences/mois',
    p95: 'P95 : {value}',
  },
  data: {
    owner: 'Responsable : {owner}',
  },
  infra: {
    uptime: 'Disponibilité : {uptime} %',
  },
  vendor: {
    annualSpend: '{amount}/an',
    sla: 'SLA : {uptime} %',
    expires: 'Expire : {date}',
    pending: 'En attente',
  },
}
