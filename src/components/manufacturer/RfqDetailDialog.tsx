import { useState, useEffect } from "react";
import { TranslateButton } from "@/components/TranslateButton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Calendar,
  DollarSign,
  Package,
  Clock,
  Building2,
  CheckCircle,
  Send,
} from "lucide-react";
import { Rfq } from "@/hooks/useRfqs";
import { useToast } from "@/hooks/use-toast";
import {
  createRfqResponse,
  getRfqResponse,
  updateRfqResponse,
  RfqResponse,
} from "@/services/firestore/rfqResponses";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RfqDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfq: Rfq | null;
  manufacturerId: string;
  onStatusChange?: () => void;
}

export function RfqDetailDialog({
  open,
  onOpenChange,
  rfq,
  manufacturerId,
  onStatusChange,
}: RfqDetailDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<RfqResponse | null>(null);
  const [formData, setFormData] = useState({
    quotedPrice: "",
    estimatedLeadTime: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rfq && open) {
      loadExistingResponse();
    }
  }, [rfq, open]);

  const loadExistingResponse = async () => {
    if (!rfq) return;
    setLoading(true);
    const response = await getRfqResponse(rfq.id);
    if (response) {
      setExistingResponse(response);
      setFormData({
        quotedPrice: response.quotedPrice,
        estimatedLeadTime: response.estimatedLeadTime,
        message: response.message,
      });
    } else {
      setExistingResponse(null);
      setFormData({ quotedPrice: "", estimatedLeadTime: "", message: "" });
    }
    setLoading(false);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfq) return;

    setSubmitting(true);

    try {
      if (existingResponse) {
        // Update existing response
        const { error } = await updateRfqResponse(rfq.id, {
          ...formData,
          status: "submitted",
        });
        if (error) throw error;
      } else {
        // Create new response
        const { error } = await createRfqResponse(rfq.id, manufacturerId, {
          ...formData,
          status: "submitted",
        });
        if (error) throw error;
      }

      // Update RFQ status to in_review
      await updateDoc(doc(db, "rfqs", rfq.id), {
        status: "in_review",
      });

      toast({
        title: "Response Submitted",
        description: "Your quote has been sent to the brand.",
      });

      onStatusChange?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async () => {
    if (!rfq) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "rfqs", rfq.id), { status: "accepted" });
      toast({ title: "RFQ Accepted" });
      onStatusChange?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to accept RFQ",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rfq) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "rfqs", rfq.id), { status: "rejected" });
      toast({ title: "RFQ Rejected" });
      onStatusChange?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject RFQ",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case "in_review":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Review
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!rfq) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{rfq.title}</span>
            {getStatusBadge(rfq.status)}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* RFQ Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Request Details
                </CardTitle>
                <CardDescription>From {rfq.brandName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rfq.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-foreground">{rfq.description}</p>
                    <TranslateButton text={rfq.description} context="rfq_description" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {rfq.category && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium">{rfq.category}</p>
                      </div>
                    </div>
                  )}
                  {rfq.quantity && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="text-sm font-medium">{rfq.quantity}</p>
                      </div>
                    </div>
                  )}
                  {rfq.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="text-sm font-medium">{rfq.budget}</p>
                      </div>
                    </div>
                  )}
                  {rfq.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-sm font-medium">
                          {format(new Date(rfq.deadline), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {rfq.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Received on {format(rfq.createdAt, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Response Form or Status */}
            {rfq.status === "pending" || rfq.status === "in_review" ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {existingResponse ? "Your Response" : "Submit Quote"}
                  </CardTitle>
                  <CardDescription>
                    {existingResponse
                      ? "Update your quote or take action"
                      : "Respond to this RFQ with your pricing and lead time"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitResponse} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="quotedPrice">Quoted Price *</Label>
                        <Input
                          id="quotedPrice"
                          value={formData.quotedPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, quotedPrice: e.target.value }))
                          }
                          placeholder="e.g., $8/unit"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedLeadTime">Lead Time *</Label>
                        <Input
                          id="estimatedLeadTime"
                          value={formData.estimatedLeadTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              estimatedLeadTime: e.target.value,
                            }))
                          }
                          placeholder="e.g., 4-6 weeks"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message to Brand *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, message: e.target.value }))
                        }
                        placeholder="Include any additional details, terms, or questions..."
                        rows={4}
                        required
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {existingResponse ? "Update Quote" : "Submit Quote"}
                          </>
                        )}
                      </Button>

                      {existingResponse && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={handleAccept}
                            disabled={submitting}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept RFQ
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={handleReject}
                            disabled={submitting}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="font-medium text-foreground">
                      This RFQ has been {rfq.status}
                    </p>
                    {existingResponse && (
                      <div className="mt-4 text-left bg-secondary/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Your Quote:</p>
                        <div className="grid gap-2 text-sm">
                          <p>
                            <span className="text-muted-foreground">Price:</span>{" "}
                            {existingResponse.quotedPrice}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Lead Time:</span>{" "}
                            {existingResponse.estimatedLeadTime}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Message:</span>{" "}
                            {existingResponse.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
