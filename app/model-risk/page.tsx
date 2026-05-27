"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { modelRiskProfiles } from "@/lib/model-risk-data"
import { sampleAppsData, publicAppsData, modelPricing } from "@/lib/model-risk-page-data"
import { useT } from "@/lib/i18n/provider"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  ExternalLink,
  Building2,
  DollarSign,
  Globe,
  Info,
} from "lucide-react"

export default function ModelRiskContextPage() {
  const t = useT()
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRiskProfiles[0].modelId)
  const selectedModel = modelRiskProfiles.find((m) => m.modelId === selectedModelId) || modelRiskProfiles[0]

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 65) return "destructive"
    if (score >= 40) return "warning"
    return "success"
  }

  const getRiskBarColor = (score: number) => {
    if (score >= 65) return "bg-destructive"
    if (score >= 40) return "bg-warning"
    return "bg-success"
  }

  const getRiskLabel = (score: number) => {
    if (score >= 65) return t("modelRisk.riskLevel.high")
    if (score >= 40) return t("modelRisk.riskLevel.medium")
    return t("modelRisk.riskLevel.low")
  }

  const overallRisk = Math.round(
    (selectedModel.hallucinationRisk +
      selectedModel.biasRisk +
      selectedModel.toxicityRisk +
      selectedModel.privacyRisk) /
      4,
  )

  const internalApps = sampleAppsData[selectedModelId] || []
  const externalApps = publicAppsData[selectedModelId] || []
  const pricing = modelPricing[selectedModelId]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8 max-w-[1400px] space-y-8">
        {/* Header with Model Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("modelRisk.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("modelRisk.subtitle")}</p>
          </div>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelRiskProfiles.map((model) => (
                <SelectItem key={model.modelId} value={model.modelId}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overall Risk Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getRiskBarColor(overallRisk)}`}
                >
                  {overallRisk}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedModel.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedModel.provider}</p>
                  <Badge variant={getRiskBadgeVariant(overallRisk)} className="mt-2">
                    {t("modelRisk.riskLevelBadge", { level: getRiskLabel(overallRisk) })}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t("modelRisk.dimensions.hallucination"), score: selectedModel.hallucinationRisk },
                  { label: t("modelRisk.dimensions.bias"), score: selectedModel.biasRisk },
                  { label: t("modelRisk.dimensions.toxicity"), score: selectedModel.toxicityRisk },
                  { label: t("modelRisk.dimensions.privacy"), score: selectedModel.privacyRisk },
                ].map((dim) => (
                  <div key={dim.label} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium">{dim.label}</span>
                      <span className="text-xs font-bold">{dim.score}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${getRiskBarColor(dim.score)}`} style={{ width: `${dim.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Use Cases */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              {t("modelRisk.approvedUseCases")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(selectedModel.approvedUseCases || []).map((useCase, i) => (
                <Badge key={i} variant="outline" className="bg-success/10 text-success border-success/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {useCase}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">{t("modelRisk.tabs.details")}</TabsTrigger>
            <TabsTrigger value="risk">{t("modelRisk.tabs.risk")}</TabsTrigger>
            <TabsTrigger value="apps">{t("modelRisk.tabs.apps")}</TabsTrigger>
            <TabsTrigger value="pricing">{t("modelRisk.tabs.pricing")}</TabsTrigger>
            <TabsTrigger value="mitigations">{t("modelRisk.tabs.mitigations")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("modelRisk.modelInfo.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("modelRisk.modelInfo.provider")}</span>
                    <span className="font-medium">{selectedModel.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("modelRisk.modelInfo.version")}</span>
                    <span className="font-medium">{selectedModel.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("modelRisk.modelInfo.type")}</span>
                    <span className="font-medium">{selectedModel.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("modelRisk.modelInfo.parameters")}</span>
                    <span className="font-medium">{selectedModel.parameters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("modelRisk.modelInfo.status")}</span>
                    <Badge variant={selectedModel.status === "Production" ? "success" : "secondary"}>
                      {selectedModel.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("modelRisk.strengthsWeaknesses.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-success mb-2">{t("modelRisk.strengthsWeaknesses.strengths")}</p>
                    <ul className="space-y-1">
                      {(selectedModel.strengths || []).slice(0, 3).map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive mb-2">{t("modelRisk.strengthsWeaknesses.weaknesses")}</p>
                    <ul className="space-y-1">
                      {(selectedModel.weaknesses || []).slice(0, 3).map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  label: t("modelRisk.riskAssessment.hallucinationLabel"),
                  score: selectedModel.hallucinationRisk,
                  desc: t("modelRisk.riskAssessment.hallucinationDesc"),
                },
                {
                  label: t("modelRisk.riskAssessment.biasLabel"),
                  score: selectedModel.biasRisk,
                  desc: t("modelRisk.riskAssessment.biasDesc"),
                },
                {
                  label: t("modelRisk.riskAssessment.toxicityLabel"),
                  score: selectedModel.toxicityRisk,
                  desc: t("modelRisk.riskAssessment.toxicityDesc"),
                },
                {
                  label: t("modelRisk.riskAssessment.privacyLabel"),
                  score: selectedModel.privacyRisk,
                  desc: t("modelRisk.riskAssessment.privacyDesc"),
                },
              ].map((risk) => (
                <Card key={risk.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{risk.label}</h4>
                        <p className="text-xs text-muted-foreground">{risk.desc}</p>
                      </div>
                      <Badge variant={getRiskBadgeVariant(risk.score)}>{t("modelRisk.riskAssessment.scoreOutOf", { score: risk.score })}</Badge>
                    </div>
                    <Progress value={risk.score} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  {t("modelRisk.activeAlerts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(selectedModel.riskAlerts || []).slice(0, 3).map((alert, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-warning">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                      </div>
                      <Badge variant={alert.severity === "High" ? "destructive" : "warning"} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {t("modelRisk.apps.internalTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {internalApps.length > 0 ? (
                    internalApps.map((app, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{app.name}</h4>
                            <p className="text-xs text-muted-foreground">{app.description}</p>
                          </div>
                          <Badge variant={app.status === "Active" ? "success" : "secondary"} className="text-xs">
                            {app.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{app.department}</span>
                          <span>{t("modelRisk.apps.queriesPerMonth", { count: app.monthlyQueries.toLocaleString() })}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("modelRisk.apps.noInternal")}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    {t("modelRisk.apps.publicTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {externalApps.length > 0 ? (
                    externalApps.map((app, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{app.name}</h4>
                            <p className="text-xs text-muted-foreground">{app.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {t("modelRisk.apps.users", { count: app.users })}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{app.category}</span>
                          <a
                            href={`https://${app.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {app.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("modelRisk.apps.noPublic")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {t("modelRisk.pricing.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("modelRisk.pricing.inputCost")}</p>
                        <p className="text-lg font-bold">{pricing.inputCost}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("modelRisk.pricing.outputCost")}</p>
                        <p className="text-lg font-bold">{pricing.outputCost}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("modelRisk.pricing.contextWindow")}</p>
                        <p className="text-lg font-bold">{pricing.contextWindow}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("modelRisk.pricing.estMonthly")}</p>
                        <p className="text-lg font-bold text-primary">{pricing.monthlyEstimate}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary mt-0.5" />
                        <p className="text-sm text-muted-foreground">{pricing.notes}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("modelRisk.pricing.notAvailable")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitigations">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t("modelRisk.mitigations.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {(selectedModel.mitigations || []).map((mitigation, i) => (
                    <div key={i} className="p-3 border rounded-lg flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span className="text-sm">{mitigation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
