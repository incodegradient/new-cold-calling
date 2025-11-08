import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Zap, Target, Phone, BarChart2, ShieldCheck } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm">
        <Link to="/" className="flex items-center justify-center">
          <Bot className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-lg font-display font-bold">AuraCall</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link to="#features" className="text-sm font-medium hover:underline underline-offset-4">Features</Link>
          <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4">Login</Link>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
          <div className="container px-4 md:px-6 text-center relative">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-display font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Automate Your Cold Calls with AI
              </h1>
              <p className="mt-4 text-gray-600 md:text-xl">
                AuraCall is the ultimate platform to connect your AI agents, manage leads, and run intelligent outbound campaigns effortlessly.
              </p>
              <div className="mt-6">
                <Button size="lg" asChild>
                  <Link to="/signup">Get Started for Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Key Features</div>
                <h2 className="text-3xl font-display font-bold tracking-tighter sm:text-5xl">Everything You Need to Scale</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From connecting your favorite tools to detailed analytics, we've got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <FeatureCard icon={<Zap className="w-8 h-8 text-blue-600" />} title="Seamless Connections" description="Integrate Twilio, Vapi, Retell, Cal.com, and more in just a few clicks." />
              <FeatureCard icon={<Target className="w-8 h-8 text-blue-600" />} title="Advanced Lead Management" description="Import leads via CSV or Google Sheets, organize them into groups, and track their status." />
              <FeatureCard icon={<Phone className="w-8 h-8 text-blue-600" />} title="Powerful Campaign Builder" description="Create and schedule campaigns with custom pacing, retry logic, and timezone handling." />
              <FeatureCard icon={<Bot className="w-8 h-8 text-blue-600" />} title="AI Agent Management" description="Bring your own agents from Vapi or Retell and assign them to campaigns." />
              <FeatureCard icon={<BarChart2 className="w-8 h-8 text-blue-600" />} title="In-Depth Analytics" description="Monitor campaign and agent performance with detailed reports and call logs." />
              <FeatureCard icon={<ShieldCheck className="w-8 h-8 text-blue-600" />} title="Secure & Reliable" description="Your credentials and data are stored securely, ensuring privacy and compliance." />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">&copy; 2025 AuraCall. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link to="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
          <Link to="#" className="text-xs hover:underline underline-offset-4">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="grid gap-1">
    <div className="flex items-center gap-3">
      {icon}
      <h3 className="text-lg font-bold font-display">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default LandingPage;
