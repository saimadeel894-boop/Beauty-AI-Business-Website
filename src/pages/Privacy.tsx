import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
          <h1 className="text-xl font-semibold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: March 10, 2026</p>

          <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide directly, including your name, email address, company information, and profile details. We also automatically collect usage data such as IP addresses, browser type, and interaction patterns.
          </p>

          <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use your information to provide and improve the Service, facilitate connections between manufacturers, brands, and influencers, communicate with you about your account, and ensure platform security.
          </p>

          <h2 className="text-2xl font-bold text-foreground">3. Information Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell your personal information. We may share your information with other platform users as necessary for collaboration (e.g., your profile information with potential partners), and with service providers who assist in operating the platform.
          </p>

          <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
          <p className="text-muted-foreground">
            We implement industry-standard security measures to protect your information, including encryption in transit and at rest, secure authentication, and access controls. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
          <p className="text-muted-foreground">
            You have the right to access, correct, or delete your personal information. You may also request a copy of your data or ask us to restrict its processing. To exercise these rights, please contact us at the email below.
          </p>

          <h2 className="text-2xl font-bold text-foreground">6. Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies and similar technologies to maintain your session, remember your preferences, and analyze platform usage. You can manage cookie preferences through your browser settings.
          </p>

          <h2 className="text-2xl font-bold text-foreground">7. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain your information for as long as your account is active or as needed to provide the Service. We will delete or anonymize your data upon request, subject to any legal obligations to retain certain information.
          </p>

          <h2 className="text-2xl font-bold text-foreground">8. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on the platform and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-foreground">9. Contact</h2>
          <p className="text-muted-foreground">
            For questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:legal@louisboss.com" className="text-primary hover:underline">
              legal@louisboss.com
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
}
