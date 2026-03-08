import { Badge } from "@/components/ui/badge";

interface RfqStatusBadgeProps {
  status: string;
}

export function RfqStatusBadge({ status }: RfqStatusBadgeProps) {
  const getProps = () => {
    switch (status) {
      case "draft":
        return { className: "bg-muted text-muted-foreground border-muted", label: "Draft" };
      case "sent":
        return { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Sent" };
      case "viewed":
        return { className: "bg-purple-50 text-purple-700 border-purple-200", label: "Viewed" };
      case "in_review":
        return { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "In Review" };
      case "responded":
        return { className: "bg-green-50 text-green-700 border-green-200", label: "Responded" };
      case "accepted":
        return { className: "bg-green-50 text-green-700 border-green-200", label: "Accepted" };
      case "rejected":
        return { className: "bg-red-50 text-red-700 border-red-200", label: "Rejected" };
      case "completed":
        return { className: "bg-green-100 text-green-800 border-green-300", label: "Completed" };
      default:
        return { className: "", label: status };
    }
  };

  const { className, label } = getProps();
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
