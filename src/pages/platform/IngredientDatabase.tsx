import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Beaker, Shield, Leaf, AlertTriangle, CheckCircle, Info, Filter, Globe, FlaskConical } from "lucide-react";
import { useIngredients, Ingredient } from "@/hooks/useIngredients";
import { useState } from "react";

const getSafetyColor = (safety: string) => {
  switch (safety) {
    case "Low": return "bg-green-100 text-green-700 border-green-200";
    case "Moderate": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "High": return "bg-red-100 text-red-700 border-red-200";
    default: return "";
  }
};

const getStatusColor = (status: string) => {
  if (status === "Approved") return "text-green-600";
  if (status === "Restricted" || status.includes("Restricted")) return "text-yellow-600";
  if (status === "Banned") return "text-red-600";
  return "text-muted-foreground";
};

function IngredientDetailDialog({ ingredient, open, onClose }: { ingredient: Ingredient | null; open: boolean; onClose: () => void }) {
  if (!ingredient) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-primary" />
            {ingredient.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">INCI Name</p><p className="text-sm font-mono">{ingredient.inci_name}</p></div>
            <div><p className="text-xs text-muted-foreground">CAS Number</p><p className="text-sm font-mono">{ingredient.cas_number || "N/A"}</p></div>
            <div><p className="text-xs text-muted-foreground">Category</p><Badge variant="secondary">{ingredient.category}</Badge></div>
            <div><p className="text-xs text-muted-foreground">Safety Rating</p><Badge className={getSafetyColor(ingredient.safety_rating)}>{ingredient.safety_rating} (EWG: {ingredient.ewg_score})</Badge></div>
          </div>

          {ingredient.description && <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm">{ingredient.description}</p></div>}

          <div><p className="text-xs text-muted-foreground mb-1">Functions</p><div className="flex flex-wrap gap-1">{ingredient.functions.map(f => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}</div></div>

          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> Regulatory Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(ingredient.regulatory_status).map(([market, status]) => (
                <div key={market} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{market}</span>
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(status as string)}>{status as string}</span>
                    {ingredient.max_concentration[market] && <span className="text-xs text-muted-foreground">Max: {ingredient.max_concentration[market]}</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {ingredient.restrictions.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Restrictions</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{ingredient.restrictions.map((r, i) => <li key={i} className="text-sm text-yellow-700">• {r}</li>)}</ul></CardContent>
            </Card>
          )}

          {ingredient.alternatives.length > 0 && (
            <div><p className="text-xs text-muted-foreground mb-1">Suggested Alternatives</p><div className="flex flex-wrap gap-1">{ingredient.alternatives.map(a => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}</div></div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function IngredientDatabase() {
  const { ingredients, loading, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, categories } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Beaker className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ingredient Database</h1>
              <p className="text-sm text-muted-foreground">Global cosmetic ingredient reference with regulatory data</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1"><Leaf className="h-3 w-3" />{ingredients.length} Ingredients</Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, INCI, or function..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
                <Badge key={cat} variant={cat === categoryFilter ? "default" : "outline"} className="cursor-pointer" onClick={() => setCategoryFilter(cat)}>{cat}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Safety Rating:</span>
          <div className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> Low Risk</div>
          <div className="flex items-center gap-1"><Info className="h-3.5 w-3.5 text-yellow-500" /> Moderate</div>
          <div className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /> High</div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">Loading ingredients...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ingredient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">INCI Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Function</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Safety</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">EWG</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ingredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => setSelectedIngredient(ing)}>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{ing.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">{ing.inci_name}</td>
                        <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{ing.category}</Badge></td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{ing.functions.join(", ")}</td>
                        <td className="px-4 py-3"><Badge className={`text-xs ${getSafetyColor(ing.safety_rating)}`}>{ing.safety_rating}</Badge></td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{ing.ewg_score}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {Object.entries(ing.regulatory_status).map(([m, s]) => (
                              <span key={m} className={`text-[10px] font-bold ${getStatusColor(s as string)}`} title={`${m}: ${s}`}>{m === "FDA" ? "🇺🇸" : m === "EU" ? "🇪🇺" : "🇰🇷"}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <IngredientDetailDialog ingredient={selectedIngredient} open={!!selectedIngredient} onClose={() => setSelectedIngredient(null)} />
    </DashboardLayout>
  );
}
