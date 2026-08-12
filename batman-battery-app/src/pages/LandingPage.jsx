import { Link } from 'react-router-dom';
import { MapPin, Zap, Phone, Facebook, Clock, Shield, Star, ChevronRight, Battery, Wrench } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Data ─────────────────────────────────────────────────

const SERVICES = [
  {
    icon: Zap,
    title: 'Emergency Jumpstart',
    desc: "Dead battery? We'll jumpstart your vehicle on the spot in minutes — no towing needed.",
    tag: 'Most requested',
    tagColor: 'signal',
  },
  {
    icon: Battery,
    title: 'Battery Replacement',
    desc: 'Same-day replacement with quality batteries for cars, motorcycles, vans, and SUVs. All brands available.',
    tag: null,
    tagColor: null,
  },
  {
    icon: Wrench,
    title: 'Battery Testing',
    desc: "Not sure if your battery is the problem? We'll test it on-site and give you an honest diagnosis.",
    tag: null,
    tagColor: null,
  },
  {
    icon: Shield,
    title: 'Preventive Check-up',
    desc: "Regular battery health checks before you get stranded. We come to you at work, home, or anywhere in Cebu.",
    tag: null,
    tagColor: null,
  },
];

const STATS = [
  { value: '24/7', label: 'Always available' },
  { value: '30 min', label: 'Average response time' },
  { value: '5★', label: 'Customer satisfaction' },
  { value: 'Cebu-wide', label: 'Service coverage' },
];

const TESTIMONIALS = [
  {
    name: 'Mark T.',
    location: 'Mandaue City',
    text: 'My car died in the middle of the road at 2AM. Batman Battery arrived in under 25 minutes! Super professional and affordable.',
    stars: 5,
  },
  {
    name: 'Joy A.',
    location: 'Talisay',
    text: 'Called them on a Sunday and they came within the hour. Fixed the battery, explained everything clearly, and the price was very fair.',
    stars: 5,
  },
  {
    name: 'Ryan C.',
    location: 'Lapu-Lapu City',
    text: 'Battery died in the mall parking lot. One call and they were there! Replaced it fast. Now I keep their number saved.',
    stars: 5,
  },
];

const BATTERY_PRODUCTS = [
  {
    brand: 'Motolite',
    types: 'Maintenance-free, MF Gold',
    coverage: 'Cars, SUVs, vans',
    warranty: '1 year',
  },
  {
    brand: 'Amaron',
    types: 'Silver, Pro, Flo',
    coverage: 'All vehicle types',
    warranty: '18 months',
  },
  {
    brand: 'Panasonic',
    types: 'MF, Silver',
    coverage: 'Cars, motorcycles',
    warranty: '1 year',
  },
  {
    brand: 'Century',
    types: 'Maintenance-free, Hi-Life',
    coverage: 'Cars, SUVs, trucks',
    warranty: '1 year',
  },
  {
    brand: 'Yuasa',
    types: 'Motorcycle, AGM',
    coverage: 'Motorcycles, scooters',
    warranty: '6 months',
  },
  {
    brand: 'CSB / Generic',
    types: 'Budget-friendly options',
    coverage: 'All vehicles',
    warranty: '6 months',
  },
];

// Service area – Cebu center
const BASE = { lat: 10.3157, lng: 123.8854 };

// ── Components ────────────────────────────────────────────

function StarRow({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-signal text-signal" />
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-signal text-xs font-semibold tracking-[0.18em] uppercase font-display mb-3">
      {children}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-mist overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ink/80 backdrop-blur-md border-b border-white/8">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-signal flex items-center justify-center shadow-[0_0_12px_3px_rgba(245,166,35,0.4)]">
              <Zap className="h-4 w-4 text-ink fill-ink" />
            </div>
            <span className="font-bold font-display text-mist text-base leading-none">
              Batman Battery<span className="text-signal"> 24/7</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-fog font-display">
            <a href="#services" className="hover:text-mist transition-colors">Services</a>
            <a href="#products" className="hover:text-mist transition-colors">Products</a>
            <a href="#testimonials" className="hover:text-mist transition-colors">Reviews</a>
            <a href="#location" className="hover:text-mist transition-colors">Location</a>
            <a href="#contact" className="hover:text-mist transition-colors">Contact</a>
          </div>

          <Link
            to="/request"
            id="nav-request-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-signal text-ink text-sm font-bold font-display hover:bg-signal/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            <Zap className="h-3.5 w-3.5 fill-ink" />
            Request help
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-signal/6 blur-[100px]" />
        </div>

        {/* Icon */}
        <div className="relative mb-6 animate-fade-in">
          <div className="h-20 w-20 rounded-2xl bg-signal flex items-center justify-center mx-auto shadow-[0_0_40px_16px_rgba(245,166,35,0.35)] btn-beacon">
            <Zap className="h-11 w-11 text-ink fill-ink" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-signal/10 border border-signal/25 text-signal text-xs font-semibold font-display mb-5 animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
          Available 24 hours · 7 days a week
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-mist leading-[1.05] tracking-tight max-w-3xl animate-fade-in">
          Stranded in Cebu?<br />
          <span className="text-signal">We're on the way.</span>
        </h1>

        <p className="text-fog text-lg mt-5 max-w-xl animate-fade-in">
          Cebu's fastest mobile battery service. Jumpstart or replacement — anywhere in Cebu, any time, any vehicle.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-9 animate-slide-up">
          <Link
            to="/request"
            id="hero-request-btn"
            className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-signal text-ink font-bold font-display text-lg hover:bg-signal/90 active:scale-[0.97] btn-beacon transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            <Zap className="h-6 w-6 fill-ink" />
            Request help now
          </Link>
          <a
            href="tel:+639XXXXXXXXX"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full border border-white/15 text-mist font-semibold font-display text-base hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            <Phone className="h-5 w-5 text-signal" />
            Call us now
          </a>
        </div>

        <p className="text-fog/60 text-xs mt-4 animate-fade-in">
          No sign-up needed · Free diagnosis · Response in ~30 min
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-fog/50 animate-bounce">
          <p className="text-[10px] font-display tracking-widest uppercase">Scroll</p>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────── */}
      <section className="border-y border-white/8 bg-surface/50">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <p className="font-display font-bold text-3xl text-signal leading-none">{value}</p>
              <p className="text-fog text-sm font-display">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────── */}
      <section id="services" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <SectionLabel>What we do</SectionLabel>
          <h2 className="font-display font-bold text-4xl text-mist tracking-tight">
            Complete battery solutions,<br className="hidden sm:block" /> brought to you
          </h2>
          <p className="text-fog mt-3 max-w-xl mx-auto">
            No shop visit, no towing. We come to wherever you're stranded in Cebu.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, desc, tag, tagColor }) => (
            <div
              key={title}
              className="relative bg-surface rounded-2xl border border-white/8 p-6 hover:border-signal/25 transition-all group hover:-translate-y-0.5"
            >
              {tag && (
                <span className="absolute top-4 right-4 text-[10px] font-semibold font-display px-2 py-0.5 rounded-full bg-signal/15 text-signal border border-signal/25">
                  {tag}
                </span>
              )}
              <div className="h-11 w-11 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center mb-4 group-hover:bg-signal/20 transition-colors">
                <Icon className="h-5 w-5 text-signal" />
              </div>
              <h3 className="font-display font-semibold text-mist text-base mb-2">{title}</h3>
              <p className="text-fog text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/request"
            className="inline-flex items-center gap-2 text-signal font-semibold font-display hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded"
          >
            Request a service now
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── PRODUCTS ────────────────────────────────── */}
      <section id="products" className="bg-surface/40 border-y border-white/8 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <SectionLabel>Battery brands</SectionLabel>
            <h2 className="font-display font-bold text-4xl text-mist tracking-tight">
              Quality batteries, all brands
            </h2>
            <p className="text-fog mt-3 max-w-xl mx-auto">
              We carry the most trusted battery brands in the Philippines — for every vehicle and every budget.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BATTERY_PRODUCTS.map(({ brand, types, coverage, warranty }) => (
              <div
                key={brand}
                className="bg-ink rounded-2xl border border-white/8 p-5 hover:border-signal/20 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-display font-bold text-mist text-lg">{brand}</h3>
                  <span className="text-[10px] font-display font-semibold px-2 py-0.5 rounded-full bg-go/10 text-go border border-go/25 whitespace-nowrap">
                    {warranty} warranty
                  </span>
                </div>
                <p className="text-fog text-sm mb-1">
                  <span className="text-fog/60 text-xs font-display uppercase tracking-wider">Types:</span>{' '}
                  {types}
                </p>
                <p className="text-fog text-sm">
                  <span className="text-fog/60 text-xs font-display uppercase tracking-wider">For:</span>{' '}
                  {coverage}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-fog text-sm mt-6">
            Don't see your battery brand? <a href="tel:+639XXXXXXXXX" className="text-signal underline hover:no-underline">Call us</a> — we can source it.
          </p>
        </div>
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <SectionLabel>Why Batman Battery</SectionLabel>
            <h2 className="font-display font-bold text-4xl text-mist tracking-tight leading-tight">
              Fast. Reliable.<br />Always there for you.
            </h2>
            <p className="text-fog mt-4 leading-relaxed">
              We built Batman Battery 24/7 because we've all been there — stranded at the worst possible time. Our mission is to get you back on the road as fast as possible, with zero hassle.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {[
                { icon: Clock, title: '~30 min average response', desc: 'We aim to reach you in under 30 minutes anywhere in Cebu.' },
                { icon: Shield, title: 'Certified technicians', desc: 'All our techs are trained, insured, and background-checked.' },
                { icon: MapPin, title: 'Cebu-wide coverage', desc: 'Cebu City, Mandaue, Lapu-Lapu, Talisay, Danao, and more.' },
                { icon: Star, title: 'Transparent pricing', desc: 'No hidden fees. You\'ll know the price before we start.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-signal/10 border border-signal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-signal" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-mist text-sm">{title}</p>
                    <p className="text-fog text-sm mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-surface rounded-2xl border border-white/8 p-6">
              <p className="text-fog text-xs font-display uppercase tracking-wider mb-4">Our process</p>
              {[
                { step: '01', title: 'You request', desc: 'Fill out the form or call us. Takes less than 60 seconds.' },
                { step: '02', title: 'We dispatch', desc: 'Our dispatcher assigns the nearest available technician immediately.' },
                { step: '03', title: 'Tech arrives', desc: 'Track your technician in real time. Average: ~30 minutes.' },
                { step: '04', title: 'Back on the road', desc: 'Battery fixed or replaced. You\'re done. No towing, no drama.' },
              ].map(({ step, title, desc }, i) => (
                <div key={step} className={`flex gap-4 ${i < 3 ? 'pb-5 mb-5 border-b border-white/5' : ''}`}>
                  <div className="text-2xl font-display font-bold text-signal/40 leading-none w-9 flex-shrink-0 pt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-mist text-sm">{title}</p>
                    <p className="text-fog text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Glow */}
            <div className="absolute -inset-4 bg-signal/4 rounded-3xl blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────── */}
      <section id="testimonials" className="bg-surface/40 border-y border-white/8 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <SectionLabel>What customers say</SectionLabel>
            <h2 className="font-display font-bold text-4xl text-mist tracking-tight">
              Trusted by Cebuanos
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, location: loc, text, stars }) => (
              <div key={name} className="bg-ink rounded-2xl border border-white/8 p-6 flex flex-col gap-4">
                <StarRow count={stars} />
                <p className="text-mist text-sm leading-relaxed flex-1">"{text}"</p>
                <div>
                  <p className="font-display font-semibold text-mist text-sm">{name}</p>
                  <p className="text-fog text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {loc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION MAP ────────────────────────────── */}
      <section id="location" className="max-w-6xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <SectionLabel>Service area</SectionLabel>
            <h2 className="font-display font-bold text-4xl text-mist tracking-tight leading-tight">
              Serving all of Cebu
            </h2>
            <p className="text-fog mt-4">
              We cover the entire Metro Cebu area and beyond. If you're stranded anywhere in the Cebu province, we'll come to you.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {[
                'Cebu City',
                'Mandaue City',
                'Lapu-Lapu City',
                'Talisay City',
                'Minglanilla',
                'Consolacion',
                'Liloan',
                'Danao City',
                'Toledo City',
                'Naga City',
              ].map((place) => (
                <div key={place} className="flex items-center gap-2.5 text-sm text-fog">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal flex-shrink-0" />
                  {place}
                </div>
              ))}
              <p className="text-fog/60 text-xs mt-2 italic">+ more areas covered. Call to confirm.</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: 380 }}>
            <MapContainer
              center={[BASE.lat, BASE.lng]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              zoomControl={false}
              dragging={false}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[BASE.lat, BASE.lng]}>
                <Popup>
                  <strong>Batman Battery 24/7</strong><br />
                  Serving all of Cebu
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-white/8 bg-signal/5 py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-signal/8 blur-[80px]" />
        </div>
        <div className="relative max-w-2xl mx-auto px-5 text-center">
          <div className="h-14 w-14 rounded-2xl bg-signal flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_10px_rgba(245,166,35,0.3)] btn-beacon">
            <Zap className="h-8 w-8 text-ink fill-ink" />
          </div>
          <h2 className="font-display font-bold text-4xl text-mist tracking-tight">
            Need help right now?
          </h2>
          <p className="text-fog mt-3">
            Don't wait. Send us your request in under a minute and we'll dispatch a tech immediately.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              to="/request"
              id="cta-request-btn"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-signal text-ink font-bold font-display text-base hover:bg-signal/90 active:scale-[0.97] btn-beacon transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <Zap className="h-5 w-5 fill-ink" />
              Request help
            </Link>
            <a
              href="tel:+639XXXXXXXXX"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/15 text-mist font-semibold font-display text-sm hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            >
              <Phone className="h-4 w-4 text-signal" />
              Call us directly
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT & FOOTER ────────────────────────── */}
      <footer id="contact" className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid sm:grid-cols-3 gap-10 pb-10 border-b border-white/8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-signal flex items-center justify-center">
                <Zap className="h-4 w-4 text-ink fill-ink" />
              </div>
              <span className="font-bold font-display text-mist">Batman Battery <span className="text-signal">24/7</span></span>
            </div>
            <p className="text-fog text-sm leading-relaxed">
              Cebu's fastest mobile battery service. We come to you — any vehicle, any time, anywhere in Cebu.
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="font-display font-semibold text-mist text-sm mb-4">Contact</p>
            <div className="flex flex-col gap-3">
              <a href="tel:+639XXXXXXXXX" className="flex items-center gap-2.5 text-fog text-sm hover:text-signal transition-colors">
                <Phone className="h-4 w-4 text-signal flex-shrink-0" />
                +63 9XX XXX XXXX
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-fog text-sm hover:text-signal transition-colors">
                <Facebook className="h-4 w-4 text-signal flex-shrink-0" />
                Batman Battery 24/7
              </a>
              <div className="flex items-center gap-2.5 text-fog text-sm">
                <MapPin className="h-4 w-4 text-signal flex-shrink-0" />
                Metro Cebu, Cebu City, Philippines 6000
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <p className="font-display font-semibold text-mist text-sm mb-4">Hours</p>
            <div className="flex items-center gap-2 text-go text-sm mb-2">
              <span className="h-2 w-2 rounded-full bg-go animate-pulse flex-shrink-0" />
              <span className="font-semibold font-display">Open now</span>
            </div>
            <p className="text-fog text-sm">Monday – Sunday</p>
            <p className="text-signal font-semibold font-display text-sm">24 hours a day</p>
            <p className="text-fog/60 text-xs mt-3">Including holidays</p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fog/50">
          <p>© 2026 Batman Battery 24/7. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/request" className="hover:text-fog transition-colors">Request service</Link>
            <Link to="/admin/login" className="hover:text-fog transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
