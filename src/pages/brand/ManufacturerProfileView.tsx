import { useParams, Link } from "react-router-dom";
import { TranslateButton } from "@/components/TranslateButton";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useManufacturerPublicProfile } from "@/hooks/useManufacturerPublicProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Factory,
  MapPin,
  Clock,
  Package,
  Award,
  Globe,
  ArrowLeft,
  FileText,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function ManufacturerProfileView() {
  const { manufacturerId } = useParams<{ manufacturerId: string }>();
  const { profile, products, loading } = useManufacturerPublicProfile(manufacturerId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <Factory className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            Manufacturer Not Found
          </h2>
          <p className="mt-2 text-muted-foreground">
            This manufacturer profile doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/brand/manufacturers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Manufacturers
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="-ml-2">
          <Link to="/brand/manufacturers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manufacturers
          </Link>
        </Button>

        {/* Header */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-manufacturer/10">
                <Factory className="h-8 w-8 text-manufacturer" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.companyName}
                </h1>
                {profile.location && (
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-1 text-primary hover:underline text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    {profile.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <Button asChild size="lg" className="gap-2">
              <Link to={`/brand/rfqs/create?manufacturer=${manufacturerId}`}>
                <FileText className="h-5 w-5" />
                Create RFQ
              </Link>
            </Button>
          </div>

          {profile.description && (
            <div className="mt-6">
              <p className="text-muted-foreground">{profile.description}</p>
              <TranslateButton text={profile.description} context="product_specification" />
            </div>
          )}

          {/* Key Metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.moq && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Minimum Order
                </div>
                <p className="mt-1 font-semibold text-foreground">{profile.moq}</p>
              </div>
            )}
            {profile.leadTime && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Lead Time
                </div>
                <p className="mt-1 font-semibold text-foreground">{profile.leadTime}</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories & Certifications */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Product Categories</h3>
            {profile.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No categories listed</p>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-manufacturer" />
              Certifications
            </h3>
            {profile.certifications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="border-manufacturer/30 text-manufacturer">
                    {cert}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No certifications listed</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Products ({products.length})
          </h3>
          
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-medium text-foreground">{product.name}</h4>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {product.category}
                    </Badge>
                    {product.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      {product.moq && <span>MOQ: {product.moq}</span>}
                      {product.priceRange && <span>{product.priceRange}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No products listed yet</p>
          )}
        </div>

        {/* CTA */}
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Interested in working with {profile.companyName}?
          </h3>
          <p className="mt-2 text-muted-foreground">
            Create a Request for Quotation to start the conversation
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link to={`/brand/rfqs/create?manufacturer=${manufacturerId}`}>
              <FileText className="mr-2 h-5 w-5" />
              Create RFQ
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
