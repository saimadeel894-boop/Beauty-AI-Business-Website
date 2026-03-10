import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Terms of Service</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: March 10, 2026</p>

          <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using the BeautyChain platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
          </p>

          <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
          <p className="text-muted-foreground">
            BeautyChain is a B2B platform connecting manufacturers, brands, and influencers in the beauty and personal care industry. The platform facilitates collaboration, product development, and campaign management.
          </p>

          <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
          <p className="text-muted-foreground">
            You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold text-foreground">4. User Conduct</h2>
          <p className="text-muted-foreground">
            You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You must not attempt to gain unauthorized access to any part of the Service.
          </p>

          <h2 className="text-2xl font-bold text-foreground">5. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All content and materials available on the Service, including but not limited to text, graphics, logos, and software, are the property of BeautyChain or its licensors and are protected by applicable intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold text-foreground">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the fullest extent permitted by law, BeautyChain shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
          </p>

          <h2 className="text-2xl font-bold text-foreground">7. Modifications</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on the platform. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground">8. Termination</h2>
          <p className="text-muted-foreground">
            We may terminate or suspend your account at any time, with or without cause, with or without notice. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-2xl font-bold text-foreground">9. Contact</h2>
          <p className="text-muted-foreground">
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@louisboss.com" className="text-primary hover:underline">
              legal@louisboss.com
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
}
