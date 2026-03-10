import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { User, Search, Sparkles, Factory, Building2, Users, ArrowRight } from "lucide-react";

const howItWorks = [
  {
    icon: User,
    title: "Create Your Profile",
    description: "Showcase your expertise and what you're looking for in a partner.",
  },
  {
    icon: Search,
    title: "Discover & Connect",
    description: "Find the perfect partners using our intelligent matching system.",
  },
  {
    icon: Sparkles,
    title: "Collaborate & Grow",
    description: "Manage projects, communicate seamlessly, and launch successfully.",
  },
];

const roleFeatures = {
  manufacturers: [
    { title: "Showcase Your Facility", description: "Highlight your production capabilities and certifications." },
    { title: "Connect with Brands", description: "Find reliable brand partners for long-term production." },
    { title: "Streamline Quotes", description: "Receive and manage production orders efficiently." },
  ],
  brands: [
    { title: "Find Manufacturers", description: "Discover quality manufacturers for your products." },
    { title: "Partner with Influencers", description: "Connect with creators who align with your brand." },
    { title: "Manage Campaigns", description: "Track collaborations and measure success." },
  ],
  influencers: [
    { title: "Grow Your Network", description: "Connect with brands that match your niche." },
    { title: "Monetize Content", description: "Find paid collaboration opportunities." },
    { title: "Build Partnerships", description: "Create lasting relationships with top brands." },
  ],
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/">
            <Logo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#manufacturers" className="text-sm text-muted-foreground hover:text-foreground">For Manufacturers</a>
            <a href="#brands" className="text-sm text-muted-foreground hover:text-foreground">For Brands</a>
            <a href="#influencers" className="text-sm text-muted-foreground hover:text-foreground">For Influencers</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Forge Successful<br />
            Partnerships, Effortlessly
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The ultimate platform connecting innovative manufacturers, visionary brands, and influential creators to build the future of products together.
          </p>
          <div className="mt-10">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">A simple path to powerful collaborations.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="bg-card rounded-xl border p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features by Role */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Unlock Your Potential</h2>
            <p className="mt-2 text-muted-foreground">Tailored features for every role in the creative process.</p>
          </div>

          <div className="space-y-16">
            {/* Manufacturers */}
            <div id="manufacturers" className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-manufacturer/10">
                    <Factory className="h-5 w-5 text-manufacturer" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">For Manufacturers</h3>
                </div>
                <div className="space-y-4">
                  {roleFeatures.manufacturers.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-manufacturer" />
                      <div>
                        <p className="font-medium text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/50 rounded-2xl h-64 flex items-center justify-center">
                <Factory className="h-24 w-24 text-muted-foreground/30" />
              </div>
            </div>

            {/* Brands */}
            <div id="brands" className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="order-2 lg:order-1 bg-secondary/50 rounded-2xl h-64 flex items-center justify-center">
                <Building2 className="h-24 w-24 text-muted-foreground/30" />
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                    <Building2 className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">For Brands</h3>
                </div>
                <div className="space-y-4">
                  {roleFeatures.brands.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-brand" />
                      <div>
                        <p className="font-medium text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Influencers */}
            <div id="influencers" className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-influencer/10">
                    <Users className="h-5 w-5 text-influencer" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">For Influencers</h3>
                </div>
                <div className="space-y-4">
                  {roleFeatures.influencers.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-influencer" />
                      <div>
                        <p className="font-medium text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/50 rounded-2xl h-64 flex items-center justify-center">
                <Users className="h-24 w-24 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Build Your Next Big Thing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join the platform that bridges the gap between idea and reality.
            Sign up today and start your journey.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg">Sign Up Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />

            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <a href="mailto:legal@louisboss.com" className="hover:text-foreground">Contact</a>
            </nav>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BeautyChain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}