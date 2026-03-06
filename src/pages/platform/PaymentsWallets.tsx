import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TrendingUp, Clock, CreditCard, MoreVertical, CalendarDays, Loader2, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";

const gateways = [
  { name: "Stripe", initial: "S", bg: "bg-[#635BFF]", connected: false, detail: "Connect your Stripe account to enable escrow deposits, milestone releases, and payouts." },
  { name: "PayPal", initial: "P", bg: "bg-[#003087]", connected: false, detail: "Connect your PayPal Business account to accept global payments securely." },
];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-800",
  funded: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  approved: "bg-green-50 text-green-700",
  released: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
};

export default function PaymentsWallets() {
  const { wallet, isLoading: walletLoading, initWallet } = useWallet();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();

  useEffect(() => {
    if (!walletLoading && !wallet) {
      initWallet.mutate();
    }
  }, [walletLoading, wallet]);

  const balance = wallet ? Number(wallet.balance) : 0;
  const pendingBalance = wallet ? Number(wallet.pending_balance) : 0;
  const totalReceived = wallet ? Number(wallet.total_received) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payments & Wallets</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your payment gateways, view balance, and track transaction history.</p>
          </div>
          <Button className="gap-2"><CreditCard className="h-4 w-4" /> Initiate Payment</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Wallet Balance</p>
                  {walletLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-2 text-muted-foreground" />
                  ) : (
                    <h3 className="mt-2 text-3xl font-bold tracking-tight">${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
                  )}
                </div>
                <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <Wallet className="h-3 w-3 mr-1" /> Active
                </Badge>
                <span className="text-xs text-muted-foreground">Total received: ${totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending / In Escrow</p>
                  {walletLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-2 text-muted-foreground" />
                  ) : (
                    <h3 className="mt-2 text-3xl font-bold tracking-tight">${pendingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
                  )}
                </div>
                <div className="p-2 bg-amber-50 rounded-lg"><Clock className="h-5 w-5 text-amber-600" /></div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{transactions.filter(t => t.escrow_status === "pending" || t.escrow_status === "funded").length} transactions pending</p>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary-foreground/10 blur-2xl" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-primary-foreground/80">Stripe Integration</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight">Coming Soon</h3>
                <div className="mt-4">
                  <Badge variant="secondary" className="text-xs bg-primary-foreground/20 text-primary-foreground border-0">
                    <CalendarDays className="h-3 w-3 mr-1" /> Escrow-ready architecture
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gateways + Transactions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-4">
            <h3 className="text-lg font-bold">Linked Gateways</h3>
            {gateways.map((gw, i) => (
              <Card key={i} className="opacity-80 hover:opacity-100 transition-opacity">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${gw.bg} flex items-center justify-center text-white font-bold text-lg`}>{gw.initial}</div>
                      <div>
                        <h4 className="font-bold">{gw.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                          <span className="text-xs font-medium text-muted-foreground">Not Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{gw.detail}</p>
                    <Button className="w-full text-sm" disabled>Connect Account (Phase 2)</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
              <div className="flex gap-1 rounded-lg bg-secondary p-1">
                <Button variant="secondary" size="sm" className="text-xs bg-background shadow-sm">All</Button>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Incoming</Button>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Outgoing</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {txLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No transactions yet</p>
                  <p className="text-sm mt-1">Transactions from escrow milestones will appear here.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Description</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">Amount</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{t.description || "Transaction"}</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="text-xs">{t.transaction_type?.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium ${statusColor[t.escrow_status] || ""}`}>
                            {t.escrow_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono text-right font-medium">
                          ${Number(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
