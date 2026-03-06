import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign, Lock, CheckCircle, Download, Gavel, Factory, FileText, AlertTriangle, Plus, Loader2,
} from "lucide-react";
import { useEscrowMilestones } from "@/hooks/useEscrowMilestones";
import { useToast } from "@/hooks/use-toast";

const DEMO_CONTRACT_ID = "demo-contract-001";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Lock className="h-4 w-4" />, color: "bg-secondary text-muted-foreground", label: "Pending" },
  funded: { icon: <DollarSign className="h-4 w-4" />, color: "bg-blue-100 text-blue-600", label: "Funded" },
  completed: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-amber-100 text-amber-600", label: "Completed" },
  approved: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-600", label: "Approved" },
  released: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-600", label: "Released" },
};

export default function EscrowPayment() {
  const { milestones, isLoading, updateMilestoneStatus, createMilestones } = useEscrowMilestones(DEMO_CONTRACT_ID);
  const { toast } = useToast();
  const [confirmChecked, setConfirmChecked] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMilestones, setNewMilestones] = useState([
    { title: "Sampling", description: "Initial deposit & raw material sourcing", amount: "2500" },
    { title: "Formulation Approval", description: "Lab sample verification & approval", amount: "5000" },
    { title: "Mass Production", description: "Manufacturing of bulk units", amount: "5000" },
    { title: "Shipment", description: "Shipping and final delivery acceptance", amount: "2500" },
  ]);

  const totalValue = milestones.reduce((s, m) => s + Number(m.amount), 0);
  const lockedAmount = milestones.filter(m => m.status === "funded").reduce((s, m) => s + Number(m.amount), 0);
  const releasedAmount = milestones.filter(m => m.status === "released" || m.status === "approved").reduce((s, m) => s + Number(m.amount), 0);

  const activeIndex = milestones.findIndex(m => m.status === "funded" || m.status === "pending");

  const handleApproveRelease = async (milestoneId: string) => {
    try {
      await updateMilestoneStatus.mutateAsync({ milestoneId, status: "released" });
      toast({ title: "Funds Released", description: "Milestone approved and funds released to manufacturer." });
      setConfirmChecked(null);
    } catch {
      toast({ title: "Error", description: "Failed to release funds.", variant: "destructive" });
    }
  };

  const handleFundMilestone = async (milestoneId: string) => {
    try {
      await updateMilestoneStatus.mutateAsync({ milestoneId, status: "funded" });
      toast({ title: "Milestone Funded", description: "Funds locked in escrow for this milestone." });
    } catch {
      toast({ title: "Error", description: "Failed to fund milestone.", variant: "destructive" });
    }
  };

  const handleCreateMilestones = async () => {
    try {
      await createMilestones.mutateAsync(
        newMilestones.map((m, i) => ({
          contract_id: DEMO_CONTRACT_ID,
          title: m.title,
          description: m.description,
          amount: Number(m.amount),
          milestone_order: i + 1,
          brand_id: "demo-brand",
          manufacturer_id: "demo-manufacturer",
        }))
      );
      toast({ title: "Milestones Created", description: `${newMilestones.length} milestones set up.` });
      setShowCreateDialog(false);
    } catch {
      toast({ title: "Error", description: "Failed to create milestones.", variant: "destructive" });
    }
  };

  const progressPercent = milestones.length > 0
    ? (milestones.filter(m => m.status === "released" || m.status === "approved").length / milestones.length) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Escrow Management</h1>
            <div className="flex items-center gap-3 text-muted-foreground mt-1">
              <div className="flex items-center gap-2 text-sm">
                <Factory className="h-4 w-4" />
                <span>Contract: <span className="text-foreground font-medium">{DEMO_CONTRACT_ID}</span></span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" /> Create Milestones
            </Button>
            <Button variant="outline" className="gap-2"><Gavel className="h-4 w-4" /> Dispute Center</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download Invoice</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Contract Value</p>
                <div className="p-2 bg-secondary rounded-lg"><DollarSign className="h-5 w-5 text-muted-foreground" /></div>
              </div>
              <p className="text-3xl font-bold tracking-tight">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">{milestones.length} milestones</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-primary">Locked in Escrow</p>
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div className="p-2 bg-background/50 rounded-lg"><Lock className="h-5 w-5 text-primary" /></div>
              </div>
              <p className="text-3xl font-bold tracking-tight">${lockedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-primary/80 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Released Funds</p>
                <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              </div>
              <p className="text-3xl font-bold tracking-tight">${releasedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">{milestones.filter(m => m.status === "released").length} milestones completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Stepper */}
        {milestones.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-6">Development Progress</h3>
              <div className="relative flex items-center justify-between w-full">
                <div className="absolute top-4 left-0 w-full h-1 bg-secondary rounded-full z-0" />
                <div className="absolute top-4 left-0 h-1 bg-primary rounded-full z-0" style={{ width: `${progressPercent}%` }} />
                {milestones.map((m, i) => {
                  const isComplete = m.status === "released" || m.status === "approved";
                  const isActive = i === activeIndex;
                  return (
                    <div key={m.id} className={`relative z-10 flex flex-col items-center gap-2 ${!isComplete && !isActive ? "opacity-50" : ""}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-background ${
                        isComplete ? "bg-primary text-primary-foreground" :
                        isActive ? "bg-background border-2 border-primary text-primary shadow-lg" :
                        "bg-secondary text-muted-foreground border-2 border-muted"
                      }`}>
                        {isComplete ? "✓" : i + 1}
                      </div>
                      <span className={`text-xs font-medium text-center max-w-[80px] ${isActive ? "text-primary font-bold" : ""}`}>{m.title}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : milestones.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="font-bold text-lg mb-2">No Milestones Yet</h3>
              <p className="text-muted-foreground mb-4">Create milestones to set up your escrow payment workflow.</p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create Milestones
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {milestones.map((m, i) => {
                const isActive = m.status === "funded";
                const cfg = statusConfig[m.status] || statusConfig.pending;
                return (
                  <Card key={m.id} className={`${isActive ? "border-2 border-primary shadow-lg ring-4 ring-primary/5" : ""} ${m.status === "pending" ? "opacity-60 hover:opacity-100 transition-all" : ""}`}>
                    {isActive && (
                      <div className="bg-primary/5 px-4 py-2 border-b border-primary/20 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">● Awaiting Approval</span>
                        <Badge variant="outline" className="text-xs">Milestone {m.milestone_order}</Badge>
                      </div>
                    )}
                    <CardContent className={`p-4 ${isActive ? "p-6" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${cfg.color}`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold">{m.title}</h4>
                            <Badge variant="outline" className="text-xs">{cfg.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{m.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${Number(m.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {/* Pending → Fund button */}
                      {m.status === "pending" && (
                        <div className="mt-4 flex gap-3">
                          <Button size="sm" onClick={() => handleFundMilestone(m.id)} disabled={updateMilestoneStatus.isPending} className="gap-2">
                            <DollarSign className="h-4 w-4" /> Fund Escrow
                          </Button>
                        </div>
                      )}

                      {/* Funded → Approve & Release */}
                      {isActive && (
                        <div className="bg-secondary/50 rounded-lg p-5 border mt-4">
                          <label className="flex items-start gap-3 cursor-pointer mb-4">
                            <Checkbox
                              className="mt-1"
                              checked={confirmChecked === m.id}
                              onCheckedChange={(checked) => setConfirmChecked(checked ? m.id : null)}
                            />
                            <div className="text-sm">
                              <span className="font-bold block">I confirm receipt and quality approval</span>
                              <span className="text-muted-foreground">I have verified deliverables and authorize release of funds.</span>
                            </div>
                          </label>
                          <div className="flex gap-3">
                            <Button
                              className="gap-2"
                              disabled={confirmChecked !== m.id || updateMilestoneStatus.isPending}
                              onClick={() => handleApproveRelease(m.id)}
                            >
                              {updateMilestoneStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                              Approve & Release Funds
                            </Button>
                            <Button variant="outline" className="gap-2"><AlertTriangle className="h-4 w-4" /> Report Issue</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Ledger sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest">Escrow Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="text-sm font-mono font-medium">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Locked</span>
                    <span className="text-sm font-mono font-medium text-blue-600">${lockedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Released</span>
                    <span className="text-sm font-mono font-medium text-green-600">${releasedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="text-sm font-mono font-medium">${(totalValue - lockedAmount - releasedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest">Escrow States</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-3 p-2 rounded-lg border">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <span className="text-sm font-medium capitalize">{cfg.label}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {milestones.filter(m => m.status === key).length}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Create Milestones Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Milestone Payment Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {newMilestones.map((m, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">Step {i + 1}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={m.title}
                          onChange={(e) => {
                            const updated = [...newMilestones];
                            updated[i].title = e.target.value;
                            setNewMilestones(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Amount ($)</Label>
                        <Input
                          type="number"
                          value={m.amount}
                          onChange={(e) => {
                            const updated = [...newMilestones];
                            updated[i].amount = e.target.value;
                            setNewMilestones(updated);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={m.description}
                        onChange={(e) => {
                          const updated = [...newMilestones];
                          updated[i].description = e.target.value;
                          setNewMilestones(updated);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm font-medium text-right">
              Total: ${newMilestones.reduce((s, m) => s + (Number(m.amount) || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateMilestones} disabled={createMilestones.isPending} className="gap-2">
                {createMilestones.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create {newMilestones.length} Milestones
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
