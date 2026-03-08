import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users, TrendingUp, DollarSign, Shield, Sparkles, Search,
  AlertTriangle, CheckCircle, Loader2, BarChart3,
  Building2, Factory, User, FileText, FlaskConical, Ban, UserCheck,
} from "lucide-react";
import { useAdminCheck, useAdminDashboard, useAdminUserActions } from "@/hooks/useAdmin";
import { format } from "date-fns";

function StatCard({ title, value, icon: Icon, description, color = "text-primary" }: {
  title: string; value: string | number; icon: any; description?: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`h-12 w-12 rounded-xl bg-secondary flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserStatusBadge({ status }: { status: string }) {
  if (status === "suspended") return <Badge className="bg-destructive/10 text-destructive text-xs"><Ban className="h-3 w-3 mr-1" />Suspended</Badge>;
  if (status === "pending_approval") return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>;
  return <Badge className="bg-green-100 text-green-700 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
}

function UsersTab({ users, search, onAction }: {
  users: any[]; search: string;
  onAction: (userId: string, action: "suspend" | "approve" | "reactivate", email: string) => void;
}) {
  const filtered = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Profile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 text-sm font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {u.role === "manufacturer" ? <Factory className="h-3 w-3 mr-1" /> :
                       u.role === "brand" ? <Building2 className="h-3 w-3 mr-1" /> :
                       u.role === "influencer" ? <User className="h-3 w-3 mr-1" /> : null}
                      {u.role || "unset"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3"><UserStatusBadge status={u.status} /></td>
                  <td className="px-4 py-3">
                    {u.profile_completed
                      ? <Badge className="bg-green-100 text-green-700 text-xs">Complete</Badge>
                      : <Badge className="bg-yellow-100 text-yellow-700 text-xs">Incomplete</Badge>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(u.created_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {u.status === "suspended" ? (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onAction(u.id, "reactivate", u.email)}>
                          <UserCheck className="h-3 w-3 mr-1" /> Reactivate
                        </Button>
                      ) : u.status === "pending_approval" ? (
                        <>
                          <Button size="sm" variant="outline" className="text-xs h-7 text-green-600" onClick={() => onAction(u.id, "approve", u.email)}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7 text-destructive" onClick={() => onAction(u.id, "suspend", u.email)}>
                            <Ban className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-7 text-destructive" onClick={() => onAction(u.id, "suspend", u.email)}>
                          <Ban className="h-3 w-3 mr-1" /> Suspend
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No users found</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionsTab({ transactions, milestones }: { transactions: any[]; milestones: any[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.slice(0, 20).map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{t.transaction_type}</Badge></td>
                    <td className="px-4 py-3 text-sm font-medium">${Number(t.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">${Number(t.platform_fee).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${t.escrow_status === "released" ? "bg-green-100 text-green-700" : t.escrow_status === "funded" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {t.escrow_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(t.created_at), "MMM d, HH:mm")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No transactions yet</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Escrow Milestones</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {milestones.slice(0, 20).map((m) => (
                  <tr key={m.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 text-sm font-medium">{m.title}</td>
                    <td className="px-4 py-3 text-sm">${Number(m.amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${m.status === "released" ? "bg-green-100 text-green-700" : m.status === "funded" ? "bg-blue-100 text-blue-700" : m.status === "approved" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(m.created_at), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {milestones.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No milestones yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MatchingTab({ matches }: { matches: any[] }) {
  const avgScore = matches.length > 0
    ? Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Matches" value={matches.length} icon={Sparkles} />
        <StatCard title="Avg Match Score" value={`${avgScore}%`} icon={TrendingUp} />
        <StatCard title="Match Types" value={new Set(matches.map(m => m.candidate_type)).size} icon={Users} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent AI Matches</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Explanation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matches.slice(0, 20).map((m) => (
                  <tr key={m.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs capitalize">{m.candidate_type}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${m.score >= 80 ? "bg-green-100 text-green-700" : m.score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {m.score}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{m.explanation}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(m.created_at), "MMM d")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {matches.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No matches yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceTab({ analyses }: { analyses: any[] }) {
  const flagged = analyses.filter((a: any) => a.overall_status === "non_compliant" || a.overall_status === "warnings");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Analyses" value={analyses.length} icon={FlaskConical} />
        <StatCard title="Flagged" value={flagged.length} icon={AlertTriangle} color="text-yellow-500" />
        <StatCard title="Compliant" value={analyses.filter((a: any) => a.overall_status === "compliant").length} icon={CheckCircle} color="text-green-500" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Formulation Analyses</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Markets</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analyses.slice(0, 20).map((a: any) => (
                  <tr key={a.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 text-sm font-medium">{a.product_name}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${a.overall_status === "compliant" ? "bg-green-100 text-green-700" : a.overall_status === "warnings" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {a.overall_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{(a.target_markets || []).join(", ")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(a.created_at), "MMM d")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analyses.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No analyses yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { users, stats, transactions, milestones, matches, analyses, loading, refetch } = useAdminDashboard();
  const { updateUserStatus, acting } = useAdminUserActions(refetch);
  const [search, setSearch] = useState("");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; action: "suspend" | "approve" | "reactivate"; userId: string; email: string;
  }>({ open: false, action: "suspend", userId: "", email: "" });

  const handleAction = (userId: string, action: "suspend" | "approve" | "reactivate", email: string) => {
    setConfirmDialog({ open: true, action, userId, email });
  };

  const confirmAction = async () => {
    await updateUserStatus(confirmDialog.userId, confirmDialog.action);
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const actionLabels = {
    suspend: { title: "Suspend User", description: "This will prevent the user from accessing the platform. They will not be able to log in or perform any actions.", button: "Suspend", destructive: true },
    approve: { title: "Approve User", description: "This will activate the user's account and grant them access to the platform.", button: "Approve", destructive: false },
    reactivate: { title: "Reactivate User", description: "This will restore the user's access to the platform.", button: "Reactivate", destructive: false },
  };

  if (adminLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">You don't have admin privileges to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  const label = actionLabels[confirmDialog.action];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" /> Admin Control Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Platform management and monitoring</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Manufacturers" value={stats.activeManufacturers} icon={Factory} />
          <StatCard title="Brands" value={stats.activeBrands} icon={Building2} />
          <StatCard title="Influencers" value={stats.activeInfluencers} icon={User} />
          <StatCard title="Transaction Volume" value={`$${stats.totalVolume.toLocaleString()}`} icon={DollarSign} />
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="users" className="gap-1"><Users className="h-3 w-3" /> Users</TabsTrigger>
            <TabsTrigger value="matching" className="gap-1"><Sparkles className="h-3 w-3" /> Matching</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1"><DollarSign className="h-3 w-3" /> Transactions</TabsTrigger>
            <TabsTrigger value="compliance" className="gap-1"><Shield className="h-3 w-3" /> Compliance</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="h-3 w-3" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users"><UsersTab users={users} search={search} onAction={handleAction} /></TabsContent>
          <TabsContent value="matching"><MatchingTab matches={matches} /></TabsContent>
          <TabsContent value="transactions"><TransactionsTab transactions={transactions} milestones={milestones} /></TabsContent>
          <TabsContent value="compliance"><ComplianceTab analyses={analyses} /></TabsContent>
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Active RFQs" value={stats.totalRfqs} icon={FileText} />
              <StatCard title="AI Matches" value={stats.totalMatches} icon={Sparkles} />
              <StatCard title="Compliance Analyses" value={stats.totalAnalyses} icon={FlaskConical} />
              <StatCard title="Platform Fees Earned" value={`$${stats.platformFees.toFixed(2)}`} icon={DollarSign} color="text-green-500" />
              <StatCard title="Total Transactions" value={stats.totalTransactions} icon={TrendingUp} />
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{label.title}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{confirmDialog.email}</span>
              <br /><br />
              {label.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={acting}
              className={label.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {acting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {label.button}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
