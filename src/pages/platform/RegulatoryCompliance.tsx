import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle, AlertTriangle, Clock, Shield, Download, ExternalLink,
  FlaskConical, Tag, Microscope, Globe, Loader2, XCircle, Lightbulb,
} from "lucide-react";
import { useFormulationAnalysis, type AnalysisResult, type ParsedIngredient, type Suggestion } from "@/hooks/useFormulationAnalysis";

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "Low": case "compliant": case "Approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "Moderate": case "warnings": case "Restricted": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "High": case "non_compliant": case "Banned": return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getSeverityColor(severity: string) {
  if (severity === "critical") return "border-red-200 bg-red-50";
  if (severity === "warning") return "border-yellow-200 bg-yellow-50";
  return "border-blue-200 bg-blue-50";
}

function AnalysisResults({ result }: { result: AnalysisResult }) {
  const { compliance_results: cr } = result;
  return (
    <Tabs defaultValue="ingredients" className="space-y-4">
      <TabsList>
        <TabsTrigger value="ingredients">Ingredients ({result.parsed_ingredients.length})</TabsTrigger>
        <TabsTrigger value="markets">Market Readiness</TabsTrigger>
        <TabsTrigger value="suggestions">Suggestions ({result.suggestions.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="ingredients" className="space-y-2">
        {result.parsed_ingredients.map((ing, i) => (
          <Card key={i}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={ing.safety_rating} />
                  <div>
                    <p className="text-sm font-semibold">{ing.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{ing.inci_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {ing.category && <Badge variant="secondary" className="text-xs">{ing.category}</Badge>}
                  <Badge className={`text-xs ${ing.safety_rating === "Low" ? "bg-green-100 text-green-700" : ing.safety_rating === "Moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {ing.safety_rating}
                  </Badge>
                </div>
              </div>
              {ing.detected_concentration && <p className="text-xs text-muted-foreground mt-1">Detected: {ing.detected_concentration}</p>}
              <div className="flex gap-4 mt-2">
                {Object.entries(ing.regulatory_status).map(([market, status]) => (
                  <div key={market} className="flex items-center gap-1">
                    <StatusIcon status={status} />
                    <span className="text-xs font-medium">{market}</span>
                  </div>
                ))}
              </div>
              {ing.flags && ing.flags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {ing.flags.map((flag, fi) => <Badge key={fi} variant="destructive" className="text-xs">{flag}</Badge>)}
                </div>
              )}
              {ing.alternatives && ing.alternatives.length > 0 && (
                <div className="mt-2"><span className="text-xs text-muted-foreground">Alternatives: </span>{ing.alternatives.map((a, ai) => <Badge key={ai} variant="outline" className="text-xs mr-1">{a}</Badge>)}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="markets" className="space-y-3">
        {cr.market_readiness && Object.entries(cr.market_readiness).map(([market, data]) => (
          <Card key={market}>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> {market}</CardTitle>
              <StatusIcon status={data.status} />
            </CardHeader>
            {data.issues && data.issues.length > 0 && (
              <CardContent className="pt-0">
                <ul className="space-y-1">{data.issues.map((issue, i) => <li key={i} className="text-sm text-muted-foreground">• {issue}</li>)}</ul>
              </CardContent>
            )}
          </Card>
        ))}
        {cr.banned_ingredients.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="py-3"><CardTitle className="text-sm text-red-700 flex items-center gap-2"><XCircle className="h-4 w-4" /> Banned Ingredients</CardTitle></CardHeader>
            <CardContent className="pt-0"><div className="flex flex-wrap gap-1">{cr.banned_ingredients.map(b => <Badge key={b} variant="destructive">{b}</Badge>)}</div></CardContent>
          </Card>
        )}
        {cr.restricted_ingredients.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader className="py-3"><CardTitle className="text-sm text-yellow-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Restricted Ingredients</CardTitle></CardHeader>
            <CardContent className="pt-0"><div className="flex flex-wrap gap-1">{cr.restricted_ingredients.map(r => <Badge key={r} variant="outline" className="border-yellow-300">{r}</Badge>)}</div></CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="suggestions" className="space-y-2">
        {result.suggestions.map((s, i) => (
          <Card key={i} className={getSeverityColor(s.severity)}>
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-3">
                <Lightbulb className={`h-4 w-4 mt-0.5 ${s.severity === "critical" ? "text-red-500" : s.severity === "warning" ? "text-yellow-500" : "text-blue-500"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{s.type}</Badge>
                    {s.ingredient && <span className="text-xs font-medium">{s.ingredient}</span>}
                  </div>
                  <p className="text-sm mt-1">{s.message}</p>
                  {s.suggested_alternative && <p className="text-xs text-muted-foreground mt-1">→ Consider: <strong>{s.suggested_alternative}</strong></p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {result.suggestions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No suggestions — formulation looks good!</p>}
      </TabsContent>
    </Tabs>
  );
}

export default function RegulatoryCompliance() {
  const { analyze, analyzing, result } = useFormulationAnalysis();
  const [formulationText, setFormulationText] = useState("");
  const [productName, setProductName] = useState("");
  const [markets, setMarkets] = useState<string[]>(["FDA", "EU", "Korea"]);

  const toggleMarket = (market: string) => {
    setMarkets(prev => prev.includes(market) ? prev.filter(m => m !== market) : [...prev, market]);
  };

  const handleAnalyze = () => {
    if (!formulationText.trim()) return;
    analyze(formulationText, markets, productName);
  };

  const overallStatus = result?.compliance_results?.overall_status;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-primary text-primary-foreground rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="h-6 w-6" /> Regulatory Compliance Checker
            </h2>
            <p className="text-primary-foreground/70 text-sm mt-1">
              AI-powered formulation analysis against FDA, EU, and Korean cosmetic regulations
            </p>
          </div>
          <Shield className="absolute right-4 bottom-0 h-40 w-40 text-primary-foreground/5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Formulation Input</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Product Name</label>
                  <Input placeholder="e.g. Glow Serum v3" value={productName} onChange={(e) => setProductName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Ingredient List / INCI</label>
                  <Textarea
                    placeholder={"Paste your ingredient list here...\n\ne.g. Water, Glycerin, Niacinamide 5%, Hyaluronic Acid, Retinol 0.3%, Phenoxyethanol, Fragrance"}
                    className="min-h-[160px] font-mono text-xs"
                    value={formulationText}
                    onChange={(e) => setFormulationText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Target Markets</label>
                  <div className="space-y-2">
                    {["FDA", "EU", "Korea"].map((m) => (
                      <div key={m} className="flex items-center gap-2">
                        <Checkbox checked={markets.includes(m)} onCheckedChange={() => toggleMarket(m)} />
                        <span className="text-sm">{m === "FDA" ? "🇺🇸 FDA (USA)" : m === "EU" ? "🇪🇺 EC 1223/2009 (EU)" : "🇰🇷 MFDS (Korea)"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={handleAnalyze} disabled={analyzing || !formulationText.trim()}>
                  {analyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</> : <><FlaskConical className="h-4 w-4 mr-2" /> Analyze Formulation</>}
                </Button>
              </CardContent>
            </Card>

            {overallStatus && (
              <Card className={overallStatus === "compliant" ? "border-green-200" : overallStatus === "warnings" ? "border-yellow-200" : "border-red-200"}>
                <CardContent className="py-4 flex items-center gap-3">
                  <StatusIcon status={overallStatus} />
                  <div>
                    <p className="text-sm font-bold capitalize">{overallStatus.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {result?.compliance_results?.banned_ingredients?.length || 0} banned · {result?.compliance_results?.restricted_ingredients?.length || 0} restricted · {result?.suggestions?.length || 0} suggestions
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!result && !analyzing && (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Paste Your Formulation</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">Enter an ingredient list or INCI declaration and select target markets to get an instant AI-powered compliance analysis.</p>
                </CardContent>
              </Card>
            )}
            {analyzing && (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Analyzing Formulation...</h3>
                  <p className="text-sm text-muted-foreground mt-1">Checking against {markets.join(", ")} regulations</p>
                </CardContent>
              </Card>
            )}
            {result && !analyzing && <AnalysisResults result={result} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
