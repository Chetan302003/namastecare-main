import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, FileText, Bell, Smartphone, CheckCircle, Star, ArrowRight, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Family Profiles",
    desc: "Add all family members with QR codes for easy sharing",
    bullets: ["Secure profile linking", "QR code sharing", "Multi-member support"]
  },
  {
    icon: FileText,
    title: "Smart Records",
    desc: "Upload reports and get AI-powered clinical summaries with color-coded flags",
    bullets: ["AI analysis", "Color-coded alerts", "Secure storage"]
  },
  {
    icon: Bell,
    title: "Medicine Alerts",
    desc: "Send timely medicine reminders directly via WhatsApp",
    bullets: ["WhatsApp integration", "Custom schedules", "Family notifications"]
  },
  {
    icon: Smartphone,
    title: "Doctor View",
    desc: "Share patient summaries with doctors via QR code — no login needed",
    bullets: ["QR code access", "No doctor login", "Instant sharing"]
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Mother of 2",
    content: "NamasteCare has made managing my family's health so much easier. The medicine reminders are a lifesaver!",
    rating: 5
  },
  {
    name: "Dr. Rajesh Kumar",
    role: "Family Physician",
    content: "The doctor view feature is brilliant. Patients can share their records instantly without any hassle.",
    rating: 5
  },
  {
    name: "Amit Patel",
    role: "Tech Professional",
    content: "Secure, user-friendly, and fully compliant with national standards. Exactly what Indian families need for healthcare management.",
    rating: 5
  }
];

const howItWorks = [
  {
    step: 1,
    title: "Create Your Profile",
    desc: "Sign up and add your family members to your care group",
    icon: Users
  },
  {
    step: 2,
    title: "Upload & Organize",
    desc: "Store health records, set medicine reminders, and track wellness",
    icon: FileText
  },
  {
    step: 3,
    title: "Share with Doctors",
    desc: "Generate QR codes for instant doctor access to patient summaries",
    icon: Smartphone
  }
];

const HealthcareIllustration = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(152, 55%, 33%)" />
        <stop offset="100%" stopColor="hsl(160, 50%, 28%)" />
      </linearGradient>
    </defs>
    <circle cx="200" cy="150" r="80" fill="url(#healthGradient)" opacity="0.1" />
    <path d="M180 140 L190 150 L210 130" stroke="hsl(152, 55%, 33%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="200" cy="150" r="40" stroke="hsl(152, 55%, 33%)" strokeWidth="2" fill="none" />
    <path d="M185 145 Q200 135 215 145 Q200 155 185 145" stroke="hsl(152, 55%, 33%)" strokeWidth="2" fill="none" />
  </svg>
);

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground tracking-tight">NamasteCare</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary transition-all duration-200 relative group">
              <Link to="/login">
                Sign in
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:glow transition-all duration-200 shadow-lg">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 pb-20 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full hover:bg-primary/20 hover:scale-105 hover:pulse transition-all duration-200 cursor-pointer">
                <Shield className="h-3.5 w-3.5" /> Secure & Private
              </div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full hover:bg-primary/20 hover:scale-105 hover:pulse transition-all duration-200 cursor-pointer">
                <CheckCircle className="h-3.5 w-3.5" /> Secure and compliant
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-2xl mx-auto lg:mx-0 leading-[1.1] mb-6">
              You and Your family's health, <span className="text-primary">organized</span> and accessible
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8">
              Store health records, track medicines, and share patient summaries with doctors — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-xl hover:glow transition-all duration-200 shadow-lg text-lg px-8 py-3 group">
                <Link to="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="hover:bg-primary/10 hover:border-primary/50 hover:scale-105 hover:shadow-lg transition-all duration-200 border-2 text-lg px-8 py-3">
                <Link to="/doctor/1">See Doctor View</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block animate-fade-in-delayed">
            <HealthcareIllustration />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose NamasteCare?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive healthcare management designed for Indian families
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group p-6 md:p-8 rounded-2xl bg-card border border-border card-elevated hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20 transition-all duration-300 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200 hover:bounce">
                <f.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-200">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
              <ul className="space-y-2">
                {f.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto bg-muted/30 rounded-3xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How it Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in just 3 simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map((step, i) => (
            <div key={step.step} className="text-center animate-fade-in group cursor-pointer" style={{ animationDelay: `${i * 200}ms` }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200">
                <step.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="text-2xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform duration-200">0{step.step}</div>
              <h3 className="font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors duration-200">{step.title}</h3>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by families and healthcare professionals across India
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.name}
              className="group p-6 rounded-2xl bg-card border border-border card-elevated hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-200" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic group-hover:text-foreground transition-colors duration-200">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg text-foreground">NamasteCare</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                you and your's family's health, organized. Secure, compliant healthcare management for Indian families.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-primary/10" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-primary/10" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-primary/10" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-primary/10" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/signup" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">Sign In</Link></li>
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">Features</a></li>
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 group">
                  <Mail className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                  <a href="mailto:support@namastecare.com" className="hover:text-primary hover:underline transition-all duration-200">support@namastecare.com</a>
                </li>
                <li className="flex items-center gap-2 group">
                  <Phone className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                  <a href="tel:+91-1234567890" className="hover:text-primary hover:underline transition-all duration-200">+91 12345 67890</a>
                </li>
                <li className="flex items-center gap-2 group">
                  <MapPin className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
                  <span className="group-hover:text-foreground transition-colors duration-200">Mumbai, India</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 NamasteCare. Your health data stays private and secure. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
