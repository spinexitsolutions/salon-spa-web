import type { CollectionKey } from "./types";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "image" | "select" | "toggle" | "date" | "longtext";
  options?: { value: string; label: string }[] | "categories";
  half?: boolean;
  placeholder?: string;
  hint?: string;
};

export type Schema = {
  title: string;
  singular: string;
  description: string;
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

const pub: FieldDef = { key: "published", label: "Published on website", type: "toggle" };

export const SCHEMAS: Partial<Record<CollectionKey, Schema>> = {
  services: {
    title: "Services",
    singular: "service",
    description: "Your full service menu, prices and durations. Featured services appear in the Signature Rituals scroller.",
    titleKey: "name",
    subtitleKey: "category",
    imageKey: "image",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "category", label: "Category", type: "select", options: "categories", half: true },
      { key: "price", label: "Price", type: "number", half: true },
      { key: "duration", label: "Duration (minutes)", type: "number", half: true },
      { key: "featured", label: "Featured as signature ritual", type: "toggle", half: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      pub,
    ],
    defaults: { name: "", category: "hair", price: 1000, duration: 60, description: "", image: "", featured: false, published: true },
  },
  categories: {
    title: "Categories",
    singular: "category",
    description: "Service groups shown as tabs on the menu.",
    titleKey: "name",
    subtitleKey: "tagline",
    imageKey: "image",
    fields: [
      { key: "id", label: "Slug / ID", type: "text", half: true, hint: "Lowercase, used to link services" },
      { key: "name", label: "Name", type: "text", half: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "image", label: "Image", type: "image" },
      pub,
    ],
    defaults: { id: "", name: "", tagline: "", image: "", published: true },
  },
  team: {
    title: "Team",
    singular: "artist",
    description: "Stylists, therapists and artists — also selectable in online booking.",
    titleKey: "name",
    subtitleKey: "role",
    imageKey: "image",
    fields: [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "role", label: "Role", type: "text", half: true },
      { key: "experience", label: "Experience", type: "text", half: true, placeholder: "10 yrs" },
      { key: "specialties", label: "Specialties (comma separated)", type: "text", half: true },
      { key: "bio", label: "Short bio", type: "textarea" },
      { key: "image", label: "Portrait", type: "image" },
      pub,
    ],
    defaults: { name: "", role: "", bio: "", image: "", specialties: "", experience: "", published: true },
  },
  gallery: {
    title: "Gallery",
    singular: "image",
    description: "Masonry gallery with category filters and lightbox.",
    titleKey: "caption",
    subtitleKey: "category",
    imageKey: "image",
    fields: [
      { key: "image", label: "Image", type: "image" },
      { key: "caption", label: "Caption", type: "text", half: true },
      { key: "category", label: "Category", type: "text", half: true },
      pub,
    ],
    defaults: { image: "", caption: "", category: "Hair", published: true },
  },
  testimonials: {
    title: "Testimonials",
    singular: "testimonial",
    description: "Client love shown in the dark quote carousel.",
    titleKey: "name",
    subtitleKey: "role",
    imageKey: "image",
    fields: [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "role", label: "Label", type: "text", half: true, placeholder: "Bride, 2025" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "rating", label: "Rating (1-5)", type: "number", half: true },
      { key: "image", label: "Photo", type: "image" },
      pub,
    ],
    defaults: { name: "", role: "", quote: "", rating: 5, image: "", published: true },
  },
  packages: {
    title: "Memberships",
    singular: "membership",
    description: "Recurring plans shown as pricing cards.",
    titleKey: "name",
    subtitleKey: "description",
    fields: [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "price", label: "Price", type: "number", half: true },
      { key: "period", label: "Period", type: "text", half: true, placeholder: "month" },
      { key: "highlighted", label: "Highlight as most loved", type: "toggle", half: true },
      { key: "description", label: "Short description", type: "text" },
      { key: "features", label: "Features (one per line)", type: "textarea" },
      pub,
    ],
    defaults: { name: "", price: 4999, period: "month", description: "", features: "", highlighted: false, published: true },
  },
  offers: {
    title: "Offers",
    singular: "offer",
    description: "Promo cards with copyable codes. Percentage codes auto-apply in online booking.",
    titleKey: "title",
    subtitleKey: "code",
    imageKey: "image",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "code", label: "Code", type: "text", half: true },
      { key: "discount", label: "Discount label", type: "text", half: true, placeholder: "20%" },
      { key: "validTill", label: "Valid till", type: "date", half: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      pub,
    ],
    defaults: { title: "", description: "", code: "", discount: "10%", image: "", validTill: "", published: true },
  },
  posts: {
    title: "Journal",
    singular: "story",
    description: "Blog posts for SEO and storytelling.",
    titleKey: "title",
    subtitleKey: "category",
    imageKey: "image",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "URL slug", type: "text", half: true, hint: "Auto-generated if empty" },
      { key: "category", label: "Category", type: "text", half: true },
      { key: "author", label: "Author", type: "text", half: true },
      { key: "date", label: "Publish date", type: "date", half: true },
      { key: "readTime", label: "Read time", type: "text", half: true },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "body", label: "Body (blank line = new paragraph)", type: "longtext" },
      { key: "image", label: "Cover image", type: "image" },
      pub,
    ],
    defaults: { slug: "", title: "", excerpt: "", body: "", image: "", category: "Hair", date: "", readTime: "4 min", author: "", published: true },
  },
  faqs: {
    title: "FAQs",
    singular: "question",
    description: "Accordion on the homepage.",
    titleKey: "question",
    fields: [{ key: "question", label: "Question", type: "text" }, { key: "answer", label: "Answer", type: "textarea" }, pub],
    defaults: { question: "", answer: "", published: true },
  },
  stats: {
    title: "Numbers",
    singular: "number",
    description: "Animated counters on the homepage.",
    titleKey: "label",
    subtitleKey: "value",
    fields: [
      { key: "value", label: "Value", type: "number", half: true },
      { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: "k+" },
      { key: "decimals", label: "Decimals", type: "number", half: true },
      { key: "label", label: "Label", type: "text", half: true },
      pub,
    ],
    defaults: { value: 10, suffix: "", label: "", decimals: 0, published: true },
  },
};
