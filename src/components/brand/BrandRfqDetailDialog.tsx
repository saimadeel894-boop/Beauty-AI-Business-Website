import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TranslateButton } from "@/components/TranslateButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Building2,
  Package,
  DollarSign,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";
import { RfqStatusBadge } from "./RfqStatusBadge";
import type { BrandRfq } from "@/hooks/useBrandRfqs";
import { Link } from "react-router-dom";

interface BrandRfqDetailDialogProps {
  rfq: BrandRfq | null;
  onClose: () => void;
}

export function BrandRfqDetailDialog({ rfq, onClose }: BrandRfqDetailDialogProps) {
  if (!rfq) return null;

  return (
    <Dialog open={!!rfq} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{rfq.title}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Sent to {rfq.manufacturerName}
              </p>
            </div>
            <RfqStatusBadge status={rfq.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Manufacturer
              </div>
              <p className="font-medium">{rfq.manufacturerName}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                Category
              </div>
              <p className="font-medium">{rfq.category || "-"}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                Quantity
              </div>
              <p className="font-medium">{rfq.quantity || "-"}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Budget
              </div>
              <p className="font-medium">{rfq.budget || "-"}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Deadline
              </div>
              <p className="font-medium">{rfq.deadline || "-"}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created
              </div>
              <p className="font-medium">
                {rfq.createdAt
                  ? new Date(rfq.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {rfq.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h4>
              <p className="text-sm whitespace-pre-wrap">{rfq.description}</p>
              <TranslateButton text={rfq.description} context="rfq_description" />
            </div>
          )}

          {/* Attachments */}
          {rfq.attachments && rfq.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Attachments ({rfq.attachments.length})
              </h4>
              <div className="space-y-2">
                {rfq.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Attachment {index + 1}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link to={`/brand/manufacturers/${rfq.manufacturerId}`}>
                View Manufacturer
              </Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
