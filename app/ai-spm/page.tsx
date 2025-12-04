import { AppHeader } from "@/components/app-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { aiSpmMetrics, aiSpmAssets, securityIncidents } from "@/lib/mock-data"
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AISPMPage() {
  // Get top risk assets
  const topRiskAssets = [...aiSpmAssets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8)

  // Get recent incidents
  const recentIncidents = [...securityIncidents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  // Traffic light indicators
  const dataGovernanceStatus =
    aiSpmMetrics.complianceScore > 70 ? "green" : aiSpmMetrics.complianceScore > 40 ? "amber" : "red"
  const modelIntegrityStatus =
    aiSpmAssets.filter((a) => a.highRiskVulnerabilities === 0).length / aiSpmAssets.length > 0.7 ? "green" : "amber"
  const runtimeSecurityStatus =
    aiSpmMetrics.securityIncidentsYTD < 5 ? "green" : aiSpmMetrics.securityIncidentsYTD < 10 ? "amber" : "red"

  // Compliance breakdown
  const gdprCompliant = aiSpmAssets.filter((a) => a.gdprStatus === "Compliant").length
  const euAiActCompliant = aiSpmAssets.filter((a) => a.euAiActStatus === "Compliant").length
  const nistCompliant = aiSpmAssets.filter((a) => a.nistAiRmfStatus === "Compliant").length

  const severityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive"
      case "High":
        return "destructive"
      case "Medium":
        return "warning"
      case "Low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "success"
      case "In progress":
        return "warning"
      case "Open":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-8 py-10 space-y-10 max-w-[1600px]">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            AI Security Posture Management
          </h1>
          <p className="text-muted-foreground">Security and compliance-focused view for CISOs and security teams.</p>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Overall AI Risk Score"
            value={aiSpmMetrics.overallRiskScore}
            subtitle="Lower is better"
            icon={Shield}
            variant={aiSpmMetrics.overallRiskScore > 50 ? "warning" : "success"}
            trend={aiSpmMetrics.riskTrendVsLastQuarter}
          />
          <KpiCard
            title="Compliance Score"
            value={`${aiSpmMetrics.complianceScore}%`}
            subtitle="Regulatory alignment"
            icon={CheckCircle}
            variant={aiSpmMetrics.complianceScore > 70 ? "success" : "warning"}
          />
          <KpiCard
            title="Security Incidents YTD"
            value={aiSpmMetrics.securityIncidentsYTD}
            subtitle="Across all AI assets"
            icon={AlertTriangle}
            variant={aiSpmMetrics.securityIncidentsYTD > 5 ? "danger" : "success"}
          />
          <KpiCard
            title="Shadow AI Count"
            value={aiSpmMetrics.shadowAICount}
            subtitle="Unsanctioned or unknown"
            icon={XCircle}
            variant={aiSpmMetrics.shadowAICount > 0 ? "danger" : "success"}
          />
        </div>

        {/* Traffic Light Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Security Status Indicators</CardTitle>
            <CardDescription>Real-time security posture across key domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    dataGovernanceStatus === "green"
                      ? "bg-success/20"
                      : dataGovernanceStatus === "amber"
                        ? "bg-warning/20"
                        : "bg-destructive/20"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      dataGovernanceStatus === "green"
                        ? "bg-success"
                        : dataGovernanceStatus === "amber"
                          ? "bg-warning"
                          : "bg-destructive"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Data Governance</h3>
                  <p className="text-sm text-muted-foreground">
                    {dataGovernanceStatus === "green"
                      ? "Strong"
                      : dataGovernanceStatus === "amber"
                        ? "Moderate"
                        : "Weak"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    modelIntegrityStatus === "green"
                      ? "bg-success/20"
                      : modelIntegrityStatus === "amber"
                        ? "bg-warning/20"
                        : "bg-destructive/20"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      modelIntegrityStatus === "green"
                        ? "bg-success"
                        : modelIntegrityStatus === "amber"
                          ? "bg-warning"
                          : "bg-destructive"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Model Integrity</h3>
                  <p className="text-sm text-muted-foreground">
                    {modelIntegrityStatus === "green" ? "Secure" : "At risk"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    runtimeSecurityStatus === "green"
                      ? "bg-success/20"
                      : runtimeSecurityStatus === "amber"
                        ? "bg-warning/20"
                        : "bg-destructive/20"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      runtimeSecurityStatus === "green"
                        ? "bg-success"
                        : runtimeSecurityStatus === "amber"
                          ? "bg-warning"
                          : "bg-destructive"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Runtime Security</h3>
                  <p className="text-sm text-muted-foreground">
                    {runtimeSecurityStatus === "green"
                      ? "Protected"
                      : runtimeSecurityStatus === "amber"
                        ? "Monitoring"
                        : "Critical"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incident Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Incidents</CardTitle>
              <CardDescription>Latest incidents ordered by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div key={incident.incidentId} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
                      {new Date(incident.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{incident.type}</span>
                        <Badge variant={severityColor(incident.severity) as any}>{incident.severity}</Badge>
                        <Badge variant={statusColor(incident.status) as any}>{incident.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{incident.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Asset: {aiSpmAssets.find((a) => a.assetId === incident.assetId)?.modelName || incident.assetId}
                        {incident.status === "Resolved" && ` • MTTR: ${incident.mttrHours}h`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Compliance Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance</CardTitle>
              <CardDescription>Status across major frameworks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">GDPR Compliance</span>
                    <span className="text-sm font-semibold">
                      {gdprCompliant}/{aiSpmAssets.length}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(gdprCompliant / aiSpmAssets.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">EU AI Act Compliance</span>
                    <span className="text-sm font-semibold">
                      {euAiActCompliant}/{aiSpmAssets.length}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(euAiActCompliant / aiSpmAssets.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">NIST AI RMF Compliance</span>
                    <span className="text-sm font-semibold">
                      {nistCompliant}/{aiSpmAssets.length}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(nistCompliant / aiSpmAssets.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <h4 className="font-semibold text-sm">Business Impact Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Financial Risk</p>
                    <p className="text-lg font-semibold">
                      £{(aiSpmMetrics.estimatedFinancialRisk / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mean Time to Detect</p>
                    <p className="text-lg font-semibold">{aiSpmMetrics.mttdHours}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mean Time to Resolve</p>
                    <p className="text-lg font-semibold">{aiSpmMetrics.mttrHours.toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Trend</p>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-success" />
                      Improving
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Risk Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Risk Assets</CardTitle>
            <CardDescription>Assets ranked by combined risk score</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Vulnerabilities</TableHead>
                  <TableHead>Sensitive Data</TableHead>
                  <TableHead>Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRiskAssets.map((asset) => (
                  <TableRow key={asset.assetId}>
                    <TableCell className="font-medium">{asset.modelName}</TableCell>
                    <TableCell>{asset.owner}</TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell>
                      <Badge variant={asset.highRiskVulnerabilities > 0 ? "destructive" : "secondary"}>
                        {asset.highRiskVulnerabilities} high
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {asset.sensitiveDataTypes.slice(0, 2).map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {asset.sensitiveDataTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{asset.sensitiveDataTypes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-bold ${
                          asset.riskScore > 70
                            ? "text-destructive"
                            : asset.riskScore > 40
                              ? "text-warning"
                              : "text-success"
                        }`}
                      >
                        {asset.riskScore}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
