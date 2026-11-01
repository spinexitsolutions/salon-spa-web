import type {
  Appointment,
  AppointmentStatus,
  Client,
  GiftCard,
  Lead,
  SiteData,
  Section,
} from "./types";
import { addDays, img, toISODate } from "./utils";

export const IMG = {
  salonBW: "1560066984-138dadb4c035",
  hairBack: "1522337360788-8b13dee7a37e",
  massageOil: "1544161515-4ab6ce6db874",
  spaBottle: "1540555700478-4be289fbecef",
  facialMask: "1570172619644-dfd03ed5d881",
  nailsDark: "1604654894610-df63bc536371",
  hairWash: "1595476108010-b4d1f102b1b1",
  makeupEye: "1487412947147-5cebf100ffc2",
  brushes: "1516975080664-ed2fc6a32937",
  salonPink: "1521590832167-7bcbfaa6381f",
  salonDark: "1600948836101-f9ffda59d250",
  hairColor: "1562322140-8baeececf3df",
  hotStones: "1600334089648-b0d9d3028eb2",
  dropper: "1515377905703-c4788e51af15",
  massageHands: "1519823551278-64ac92734fb1",
  barber: "1503951914875-452162b0f3f1",
  blowdry: "1580618672591-eb180b1a973f",
  p1: "1531746020798-e6953c6e8e04",
  p2: "1494790108377-be9c29b29330",
  p3: "1438761681033-6461ffad8d80",
  m1: "1507003211169-0a1dd7228f2d",
  p4: "1534528741775-53994a69daeb",
  m2: "1500648767791-00dcc994a43e",
  p5: "1544005313-94ddf0286df2",
  tubes: "1608248597279-f99d160bfcbc",
  makeupFlat: "1571875257727-256c39da42af",
  faceMask2: "1616394584738-fc6e612e71b9",
  team: "1559599101-f09722fb4948",
  skincareFlat: "1612817288484-6f916006741a",
  salonModern: "1633681926022-84c23e8cb2d6",
  curly: "1519699047748-de8e457a634e",
  bathtub: "1507652313519-d4e9174996dd",
  handsSoft: "1610992015732-2449b76344bc",
  curling: "1629397685944-7073f5589754",
  facial: "1552693673-1bf958298935",
  citrus: "1505944270255-72b8c68c6a70",
  pedicure: "1519415510236-718bdfcd89c8",
  scissors: "1595475884562-073c30d45670",
  fade: "1599351431202-1e0f0137899a",
  combs: "1527799820374-dcf8d9d4a388",
  pinkHair: "1470259078422-826894b933aa",
  p6: "1531123897727-8f129e1688ce",
  makeupProducts: "1522335789203-aabd1fc54bc9",
  manicure: "1457972729786-0411a3b2b626",
  brows: "1512290923902-8a9f81dc236c",
};

export const DEFAULT_SECTIONS: Section[] = [
  { id: "hero", label: "Hero — kinetic deck + quick book", visible: true },
  { id: "marquee", label: "Marquee ticker", visible: true },
  { id: "philosophy", label: "Philosophy", visible: true },
  { id: "services", label: "Service menu", visible: true },
  { id: "rituals", label: "Signature rituals (horizontal)", visible: true },
  { id: "stats", label: "Numbers", visible: true },
  { id: "team", label: "Artists / Team", visible: true },
  { id: "gallery", label: "Gallery", visible: true },
  { id: "packages", label: "Memberships", visible: true },
  { id: "testimonials", label: "Testimonials", visible: true },
  { id: "offers", label: "Offers", visible: true },
  { id: "journal", label: "Journal", visible: true },
  { id: "faq", label: "FAQ", visible: true },
  { id: "cta", label: "Booking CTA + Newsletter", visible: true },
];

/* deterministic PRNG so server & client seeds match */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function seed(): SiteData {
  const services = [
    { id: "s1", name: "Signature Cut & Style", category: "hair", price: 1800, duration: 60, description: "A consultation-led precision cut, finished with a weightless blow-dry tailored to how you live.", image: img(IMG.blowdry), featured: false, published: true },
    { id: "s2", name: "Balayage & Gloss", category: "hair", price: 7500, duration: 180, description: "Hand-painted, sun-kissed dimension with a bond-building gloss for mirror shine.", image: img(IMG.hairColor), featured: true, published: true },
    { id: "s3", name: "Keratin Smoothing", category: "hair", price: 6000, duration: 150, description: "Frizz-free, glass-smooth hair for up to four months — formaldehyde free.", image: img(IMG.curling), featured: false, published: true },
    { id: "s4", name: "Scalp Detox Ritual", category: "hair", price: 2200, duration: 45, description: "Exfoliating scalp therapy, steam and pressure-point massage to reset your roots.", image: img(IMG.hairWash), featured: false, published: true },
    { id: "s5", name: "Hydra Glow Facial", category: "skin", price: 4500, duration: 75, description: "Deep cleanse, extraction and serum infusion for a lit-from-within complexion.", image: img(IMG.facial), featured: true, published: true },
    { id: "s6", name: "24K Radiance Facial", category: "skin", price: 5500, duration: 90, description: "Gold-infused actives, lymphatic sculpting and a cooling jade finish.", image: img(IMG.facialMask), featured: false, published: true },
    { id: "s7", name: "Brow Architecture", category: "skin", price: 1200, duration: 30, description: "Mapping, shaping and tint designed for your bone structure.", image: img(IMG.brows), featured: false, published: true },
    { id: "s8", name: "Deep Tissue Massage", category: "spa", price: 4000, duration: 60, description: "Slow, focused pressure to release chronic tension in back, neck and shoulders.", image: img(IMG.massageHands), featured: false, published: true },
    { id: "s9", name: "Hot Stone Ritual", category: "spa", price: 5200, duration: 90, description: "Warm basalt stones and aromatic oils melt away stress, layer by layer.", image: img(IMG.hotStones), featured: true, published: true },
    { id: "s10", name: "Aromatherapy Journey", category: "spa", price: 4800, duration: 75, description: "A bespoke blend of essential oils with flowing Balinese-inspired strokes.", image: img(IMG.massageOil), featured: true, published: true },
    { id: "s11", name: "Couples Retreat", category: "spa", price: 9500, duration: 120, description: "Side-by-side massage, soak and herbal tea service in our private suite.", image: img(IMG.bathtub), featured: true, published: true },
    { id: "s12", name: "Gel Manicure", category: "nails", price: 1500, duration: 45, description: "Cuticle care, shaping and a chip-resistant gel finish in your shade.", image: img(IMG.manicure), featured: false, published: true },
    { id: "s13", name: "Spa Pedicure", category: "nails", price: 1800, duration: 60, description: "Soak, scrub, mask and massage — feet that feel brand new.", image: img(IMG.pedicure), featured: false, published: true },
    { id: "s14", name: "Nail Art Studio", category: "nails", price: 2000, duration: 60, description: "Minimal lines to editorial chrome — art at your fingertips.", image: img(IMG.nailsDark), featured: false, published: true },
    { id: "s15", name: "Bridal Atelier", category: "makeup", price: 35000, duration: 240, description: "Trials, HD airbrush, draping and hair — a complete bridal experience.", image: img(IMG.makeupEye), featured: true, published: true },
    { id: "s16", name: "Evening Glam", category: "makeup", price: 6000, duration: 90, description: "Camera-ready makeup and styling for nights you'll want to remember.", image: img(IMG.makeupFlat), featured: false, published: true },
    { id: "s17", name: "Gentleman's Cut", category: "men", price: 1200, duration: 45, description: "Clipper and scissor work finished with a hot-towel neck shave.", image: img(IMG.fade), featured: false, published: true },
    { id: "s18", name: "Beard Sculpt & Hot Towel", category: "men", price: 900, duration: 30, description: "Shape, line-up and nourishing beard oil treatment.", image: img(IMG.barber), featured: false, published: true },
  ];

  const team = [
    { id: "t1", name: "Aanya Kapoor", role: "Creative Director", bio: "Fifteen years shaping hair across London and Mumbai.", image: img(IMG.p5, 900), specialties: "Balayage, Precision cuts", experience: "15 yrs", published: true },
    { id: "t2", name: "Rhea Fernandes", role: "Lead Skin Therapist", bio: "Clinical facialist obsessed with barrier health.", image: img(IMG.p2, 900), specialties: "Facials, Dermaplaning", experience: "9 yrs", published: true },
    { id: "t3", name: "Kabir Malhotra", role: "Master Barber", bio: "Classic technique, modern silhouettes.", image: img(IMG.m1, 900), specialties: "Fades, Beard design", experience: "11 yrs", published: true },
    { id: "t4", name: "Meera Iyer", role: "Spa Therapist", bio: "Trained in Bali and Kerala in holistic bodywork.", image: img(IMG.p4, 900), specialties: "Hot stone, Aromatherapy", experience: "8 yrs", published: true },
    { id: "t5", name: "Zara Sheikh", role: "Bridal Artist", bio: "Soft-glam bridal looks that last through the baraat.", image: img(IMG.p6, 900), specialties: "Bridal, HD Airbrush", experience: "10 yrs", published: true },
  ];

  const clientsBase = [
    ["Ishita Sharma", "+91 98200 11223", "ishita@mail.com", "VIP, Balayage"],
    ["Rohan Mehta", "+91 98330 44556", "rohan@mail.com", "Men"],
    ["Ananya Rao", "+91 99870 77889", "ananya@mail.com", "Bride 2026"],
    ["Priya Nair", "+91 98190 22334", "priya@mail.com", "Membership"],
    ["Kavya Singh", "+91 97690 55667", "kavya@mail.com", "Facials"],
    ["Arjun Desai", "+91 98920 88990", "arjun@mail.com", "Men"],
    ["Neha Joshi", "+91 98670 12121", "neha@mail.com", "VIP"],
    ["Sara Thomas", "+91 99300 34343", "sara@mail.com", "Spa"],
    ["Diya Patel", "+91 98210 56565", "diya@mail.com", "Nails"],
    ["Vikram Bose", "+91 98450 78787", "vikram@mail.com", "Couples"],
    ["Tanya Gill", "+91 99200 90909", "tanya@mail.com", "New"],
    ["Myra Kapadia", "+91 98100 13579", "myra@mail.com", "VIP, Spa"],
  ];
  const now = new Date();
  const clients: Client[] = clientsBase.map(([name, phone, email, tags], i) => ({
    id: `c${i + 1}`,
    name,
    phone,
    email,
    tags,
    notes: i % 3 === 0 ? "Prefers afternoon slots. Sensitive scalp." : "",
    birthday: "",
    createdAt: toISODate(addDays(now, -90 + i * 5)),
  }));

  const r = rng(42);
  const times = ["10:00", "11:00", "11:30", "12:30", "14:00", "15:00", "16:30", "17:00", "18:30"];
  const appointments: Appointment[] = [];
  for (let i = 0; i < 34; i++) {
    const offset = Math.floor(r() * 24) - 16; // -16..+7 days
    const c = clients[Math.floor(r() * clients.length)];
    const s = services[Math.floor(r() * services.length)];
    const t = team[Math.floor(r() * team.length)];
    let status: AppointmentStatus = "confirmed";
    if (offset < 0) status = r() > 0.12 ? "completed" : r() > 0.5 ? "cancelled" : "no-show";
    else if (r() > 0.7) status = "pending";
    appointments.push({
      id: `a${i + 1}`,
      ref: `SL-${(10000 + i * 137).toString(36).toUpperCase()}`,
      clientId: c.id,
      clientName: c.name,
      phone: c.phone,
      email: c.email,
      serviceId: s.id,
      serviceName: s.name,
      staffId: t.id,
      staffName: t.name,
      date: toISODate(addDays(now, offset)),
      time: times[Math.floor(r() * times.length)],
      duration: s.duration,
      price: s.price,
      status,
      notes: "",
      source: (["website", "admin", "phone", "walk-in"] as const)[Math.floor(r() * 4)],
      createdAt: toISODate(addDays(now, offset - 3)),
    });
  }

  const leads: Lead[] = [
    { id: "l1", type: "enquiry", name: "Aisha Khan", email: "aisha@mail.com", phone: "+91 98111 22222", message: "Do you offer bridal trial packages for December?", status: "new", createdAt: toISODate(addDays(now, -1)) },
    { id: "l2", type: "callback", name: "Kunal Shah", email: "", phone: "+91 98222 33333", message: "Call back about corporate gifting.", status: "new", createdAt: toISODate(now) },
    { id: "l3", type: "newsletter", name: "", email: "riya@mail.com", phone: "", message: "", status: "new", createdAt: toISODate(addDays(now, -2)) },
    { id: "l4", type: "enquiry", name: "Farah Ali", email: "farah@mail.com", phone: "+91 98333 44444", message: "Is the couples retreat available on weekends?", status: "contacted", createdAt: toISODate(addDays(now, -4)) },
    { id: "l5", type: "newsletter", name: "", email: "mira@mail.com", phone: "", message: "", status: "new", createdAt: toISODate(addDays(now, -6)) },
    { id: "l6", type: "enquiry", name: "Dev Arora", email: "dev@mail.com", phone: "+91 98444 55555", message: "Membership pricing for two people?", status: "converted", createdAt: toISODate(addDays(now, -9)) },
  ];

  const giftCards: GiftCard[] = [
    { id: "g1", code: "GIFT-7KQ2-LM8D", amount: 5000, design: "noir", from: "Rohan", to: "Ishita", recipientEmail: "ishita@mail.com", buyerPhone: "+91 98330 44556", message: "Happy birthday, love!", status: "active", createdAt: toISODate(addDays(now, -3)) },
    { id: "g2", code: "GIFT-P3XZ-91AB", amount: 10000, design: "blush", from: "Team Nova", to: "Priya", recipientEmail: "priya@mail.com", buyerPhone: "+91 98000 00000", message: "Congrats on the promotion!", status: "redeemed", createdAt: toISODate(addDays(now, -20)) },
    { id: "g3", code: "GIFT-H7RT-2W0E", amount: 2500, design: "sage", from: "Arjun", to: "Mom", recipientEmail: "", buyerPhone: "+91 98920 88990", message: "For your Sunday reset.", status: "active", createdAt: toISODate(addDays(now, -1)) },
  ];

  return {
    settings: {
      brandName: "Solène",
      brandSuffix: "Salon & Spa Atelier",
      tagline: "Beauty, slowly considered.",
      currency: "₹",
      phone: "+91 98765 43210",
      whatsapp: "919876543210",
      email: "hello@solene.studio",
      address: "14 Carter Road, Bandra West",
      city: "Mumbai 400050",
      mapQuery: "Carter Road, Bandra West, Mumbai",
      hours: [
        { day: "Monday", open: "10:00", close: "21:00", closed: false },
        { day: "Tuesday", open: "10:00", close: "21:00", closed: false },
        { day: "Wednesday", open: "10:00", close: "21:00", closed: false },
        { day: "Thursday", open: "10:00", close: "21:00", closed: false },
        { day: "Friday", open: "10:00", close: "22:00", closed: false },
        { day: "Saturday", open: "09:00", close: "22:00", closed: false },
        { day: "Sunday", open: "10:00", close: "19:00", closed: false },
      ],
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
      rating: "4.9",
      reviewsCount: "2,300+",
      adminEmail: "admin@solene.studio",
      adminPassword: "solene123",
      seoTitle: "Solène — Salon & Spa Atelier, Mumbai",
      seoDescription: "Hair, skin, spa and bridal rituals by Mumbai's most considered beauty atelier.",
    },
    theme: {
      bg: "#F3F1EC",
      ink: "#111111",
      accent: "#FF4F2B",
      night: "#111111",
      cream: "#F3F1EC",
      displayFont: "bricolage",
      radius: 26,
      cursor: true,
      grain: true,
      smoothScroll: true,
    },
    intro: {
      enabled: true,
      style: "bloom",
      word: "Solène",
      caption: "Salon & Spa — Since 2014",
      duration: 3.2,
      oncePerSession: false,
      images: [IMG.hairBack, IMG.facial, IMG.hotStones, IMG.makeupEye, IMG.salonDark].map((i) => img(i, 900)).join("\n"),
    },
    hero: {
      eyebrow: "Salon & Spa · Bandra, Mumbai",
      line1: "Your best",
      words: "hair, skin, glow, nails, calm",
      line2: "starts here.",
      subtitle: "Hair, skin and body rituals crafted by artists who believe the best results begin with stillness.",
      ctaPrimary: "Book a ritual",
      ctaSecondary: "Explore the menu",
      image: img(IMG.salonDark, 2400),
    },
    announcement: {
      enabled: true,
      text: "Festive Glow Week — 20% off all facials",
      link: "/book",
      linkLabel: "Reserve",
    },
    sections: DEFAULT_SECTIONS,
    categories: [
      { id: "hair", name: "Hair", tagline: "Cut, colour & care", image: img(IMG.hairBack, 1200), published: true },
      { id: "skin", name: "Skin", tagline: "Facials & brows", image: img(IMG.facial, 1200), published: true },
      { id: "spa", name: "Spa", tagline: "Massage & body", image: img(IMG.hotStones, 1200), published: true },
      { id: "nails", name: "Nails", tagline: "Hands & feet", image: img(IMG.manicure, 1200), published: true },
      { id: "makeup", name: "Makeup", tagline: "Bridal & glam", image: img(IMG.makeupEye, 1200), published: true },
      { id: "men", name: "Men", tagline: "Grooming", image: img(IMG.barber, 1200), published: true },
    ],
    services,
    team,
    testimonials: [
      { id: "r1", name: "Ishita Sharma", role: "Balayage client", quote: "I've never felt so listened to in a salon. My colour looks expensive in every light — and the scalp massage alone is worth the visit.", rating: 5, image: img(IMG.p1, 400), published: true },
      { id: "r2", name: "Rohan Mehta", role: "Regular since 2019", quote: "Kabir is an artist. Quiet room, perfect fade, hot towel — it's the most calming 45 minutes of my week.", rating: 5, image: img(IMG.m2, 400), published: true },
      { id: "r3", name: "Ananya Rao", role: "Bride, 2025", quote: "Zara made me look like the best version of me, not someone else. Not a single touch-up needed through a 14-hour day.", rating: 5, image: img(IMG.p3, 400), published: true },
      { id: "r4", name: "Myra Kapadia", role: "Spa member", quote: "The hot stone ritual is pure magic. The space smells like sandalwood and rain. I leave lighter, every single time.", rating: 5, image: img(IMG.p4, 400), published: true },
    ],
    gallery: [
      { id: "g1", image: img(IMG.salonDark, 1200), caption: "The atelier", category: "Space", published: true },
      { id: "g2", image: img(IMG.hairBack, 1000), caption: "Soft waves", category: "Hair", published: true },
      { id: "g3", image: img(IMG.nailsDark, 1000), caption: "Noir tips", category: "Nails", published: true },
      { id: "g4", image: img(IMG.facialMask, 1000), caption: "Clay ritual", category: "Skin", published: true },
      { id: "g5", image: img(IMG.pinkHair, 1000), caption: "Rose colour", category: "Hair", published: true },
      { id: "g6", image: img(IMG.salonPink, 1200), caption: "Styling bar", category: "Space", published: true },
      { id: "g7", image: img(IMG.makeupEye, 1000), caption: "Editorial eye", category: "Makeup", published: true },
      { id: "g8", image: img(IMG.spaBottle, 1000), caption: "Botanicals", category: "Spa", published: true },
      { id: "g9", image: img(IMG.curly, 1000), caption: "Curl care", category: "Hair", published: true },
      { id: "g10", image: img(IMG.citrus, 1000), caption: "Vitamin C glow", category: "Skin", published: true },
      { id: "g11", image: img(IMG.bathtub, 1200), caption: "Soak suite", category: "Spa", published: true },
      { id: "g12", image: img(IMG.fade, 1000), caption: "Sharp fade", category: "Men", published: true },
    ],
    packages: [
      { id: "pk1", name: "Essential", price: 4999, period: "month", description: "Your monthly reset.", features: "1 signature service a month\n10% off retail\nPriority weekend booking\nComplimentary blow-dry on birthday", highlighted: false, published: true },
      { id: "pk2", name: "Atelier", price: 9999, period: "month", description: "Our most loved membership.", features: "2 signature services a month\n1 facial or massage\n15% off all add-ons\nGuest pass every quarter\nFree scalp ritual monthly", highlighted: true, published: true },
      { id: "pk3", name: "Maison", price: 19999, period: "month", description: "Unlimited care, concierge style.", features: "Unlimited blow-dries\n2 spa rituals a month\nDedicated artist\nHome service on request\n20% off bridal & events", highlighted: false, published: true },
    ],
    posts: [
      { id: "p1", slug: "the-art-of-the-slow-blowdry", title: "The art of the slow blow-dry", excerpt: "Why patience — and a cooler setting — gives you hair that moves like silk.", body: "Most damage happens in the last five minutes of a blow-dry, when hair is almost dry and heat has nowhere to go.\n\nOur stylists work in sections, at medium heat, and always finish on a cool shot to seal the cuticle. The result is shine that lasts days, not hours.\n\nAt home, start with a heat protectant, rough-dry to 80%, then pick up a round brush. Point the nozzle down the hair shaft — never across it.", image: img(IMG.blowdry, 1400), category: "Hair", date: "2026-10-12", readTime: "4 min", author: "Aanya Kapoor", published: true },
      { id: "p2", slug: "skin-barrier-101", title: "Skin barrier 101: less is more", excerpt: "A calm barrier is the foundation of glow. Here's how to stop over-exfoliating.", body: "Tightness, stinging and sudden breakouts are often signs of an overworked barrier.\n\nPare back to a gentle cleanser, a ceramide moisturiser and daily SPF for two weeks. Reintroduce actives one at a time.\n\nIn studio, our Hydra Glow Facial focuses on infusion, not aggression — your skin will thank you.", image: img(IMG.skincareFlat, 1400), category: "Skin", date: "2026-10-03", readTime: "5 min", author: "Rhea Fernandes", published: true },
      { id: "p3", slug: "bridal-timeline", title: "Your bridal beauty timeline", excerpt: "From six months out to the morning of — a calm, considered plan.", body: "Six months: book your trial and start a skin plan.\n\nThree months: lock in colour and cut direction.\n\nOne month: final facial and brow shaping.\n\nOne week: hydration, sleep, and nothing new. Trust the plan.", image: img(IMG.makeupProducts, 1400), category: "Bridal", date: "2026-09-21", readTime: "6 min", author: "Zara Sheikh", published: true },
    ],
    faqs: [
      { id: "f1", question: "How do I book an appointment?", answer: "Book online in under a minute, call us, or message on WhatsApp. You'll get an instant booking reference.", published: true },
      { id: "f2", question: "What is your cancellation policy?", answer: "Free rescheduling up to 12 hours before your appointment. Late cancellations may incur a 25% fee.", published: true },
      { id: "f3", question: "Which products do you use?", answer: "We work with clean, professional brands — Olaplex, Kérastase, Dermalogica and our own botanical oils.", published: true },
      { id: "f4", question: "Do you offer bridal and group bookings?", answer: "Yes — our Bridal Atelier covers trials, the big day and family. Group bookings get dedicated artists.", published: true },
      { id: "f5", question: "Is parking available?", answer: "Complimentary valet is available at the entrance on Carter Road.", published: true },
    ],
    offers: [
      { id: "o1", title: "Festive Glow Week", description: "20% off every facial, including the 24K Radiance.", code: "GLOW20", discount: "20%", image: img(IMG.facial, 1000), validTill: "2026-11-30", published: true },
      { id: "o2", title: "First Visit", description: "New to Solène? Enjoy a complimentary scalp ritual with any hair service.", code: "HELLO", discount: "Free", image: img(IMG.hairWash, 1000), validTill: "2026-12-31", published: true },
      { id: "o3", title: "Duo Sundays", description: "Book the Couples Retreat on Sunday and save ₹1,500.", code: "DUO1500", discount: "₹1.5k", image: img(IMG.bathtub, 1000), validTill: "2026-12-31", published: true },
    ],
    stats: [
      { id: "st1", value: 12, suffix: "", label: "Years of craft", decimals: 0, published: true },
      { id: "st2", value: 18, suffix: "k+", label: "Happy clients", decimals: 0, published: true },
      { id: "st3", value: 4.9, suffix: "★", label: "Average rating", decimals: 1, published: true },
      { id: "st4", value: 32, suffix: "", label: "Artists & therapists", decimals: 0, published: true },
    ],
    clients,
    appointments,
    leads,
    giftCards,
  };
}
