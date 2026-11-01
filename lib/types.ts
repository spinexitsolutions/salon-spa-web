export type Hours = { day: string; open: string; close: string; closed: boolean };

export type Settings = {
  brandName: string;
  brandSuffix: string;
  tagline: string;
  currency: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  mapQuery: string;
  hours: Hours[];
  instagram: string;
  facebook: string;
  youtube: string;
  rating: string;
  reviewsCount: string;
  adminEmail: string;
  adminPassword: string;
  seoTitle: string;
  seoDescription: string;
};

export type Theme = {
  bg: string;
  ink: string;
  accent: string;
  night: string;
  cream: string;
  displayFont: "bricolage" | "syne" | "unbounded";
  radius: number;
  cursor: boolean;
  grain: boolean;
  smoothScroll: boolean;
};

export type IntroStyle = "bloom" | "frame" | "minimal";

export type Intro = {
  enabled: boolean;
  style: IntroStyle;
  word: string;
  caption: string;
  duration: number;
  oncePerSession: boolean;
  images: string;
};

export type Hero = {
  eyebrow: string;
  line1: string;
  words: string;
  line2: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  image: string;
};

export type Announcement = { enabled: boolean; text: string; link: string; linkLabel: string };

export type SectionKey =
  | "hero"
  | "marquee"
  | "philosophy"
  | "services"
  | "rituals"
  | "stats"
  | "team"
  | "gallery"
  | "packages"
  | "testimonials"
  | "offers"
  | "journal"
  | "faq"
  | "cta";

export type Section = { id: SectionKey; label: string; visible: boolean };

export type Category = { id: string; name: string; tagline: string; image: string; published: boolean };

export type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  image: string;
  featured: boolean;
  published: boolean;
};

export type Member = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string;
  experience: string;
  published: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
  published: boolean;
};

export type GalleryItem = { id: string; image: string; caption: string; category: string; published: boolean };

export type Package = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string;
  highlighted: boolean;
  published: boolean;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  published: boolean;
};

export type Faq = { id: string; question: string; answer: string; published: boolean };

export type Offer = {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  image: string;
  validTill: string;
  published: boolean;
};

export type Stat = { id: string; value: number; suffix: string; label: string; decimals: number; published: boolean };

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string;
  notes: string;
  birthday: string;
  createdAt: string;
};

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no-show";

export type Appointment = {
  id: string;
  ref: string;
  clientId: string;
  clientName: string;
  phone: string;
  email: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: AppointmentStatus;
  notes: string;
  source: "website" | "admin" | "walk-in" | "phone";
  createdAt: string;
};

export type LeadStatus = "new" | "contacted" | "converted" | "closed";

export type Lead = {
  id: string;
  type: "enquiry" | "newsletter" | "callback";
  name: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

export type GiftCard = {
  id: string;
  code: string;
  amount: number;
  design: string;
  from: string;
  to: string;
  recipientEmail: string;
  buyerPhone: string;
  message: string;
  status: "active" | "redeemed" | "expired";
  createdAt: string;
};

export type Collections = {
  categories: Category[];
  services: Service[];
  team: Member[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  packages: Package[];
  posts: Post[];
  faqs: Faq[];
  offers: Offer[];
  stats: Stat[];
  clients: Client[];
  appointments: Appointment[];
  leads: Lead[];
  giftCards: GiftCard[];
};

export type CollectionKey = keyof Collections;

export type SiteData = Collections & {
  settings: Settings;
  theme: Theme;
  intro: Intro;
  hero: Hero;
  announcement: Announcement;
  sections: Section[];
};

export type ObjectKey = "settings" | "theme" | "intro" | "hero" | "announcement";
