// Central shape for a card. Every field is optional at render time —
// components should treat missing values as "hide this", never as an error.

export const emptySection = () => ({
  id: crypto.randomUUID(),
  type: 'about', // about | products | services | team | gallery | faqs | testimonials | custom
  title: 'About Us',
  body: '',
  items: [], // used by products/services/team/gallery/faqs/testimonials
});

export const createEmptyCard = () => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  updatedAt: Date.now(),

  // Identity
  companyName: '',
  logo: '', // data URL
  ownerName: '',
  designation: '',
  profilePicture: '', // data URL
  description: '',
  workingHours: '',

  // Contact
  phone: '',
  whatsapp: '',
  whatsappMessage: 'Hello! I found your business card and would like to know more.',
  email: '',
  emailSubject: '',
  emailBody: '',
  website: '',
  address: '',
  mapsUrl: '',

  // Social
  linkedin: '',
  github: '',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  telegram: '',

  // Design
  theme: 'modern',
  primaryColor: '#161c33',
  accentColor: '#c9a15c',
  buttonStyle: 'pill', // pill | rounded | square
  font: 'inter', // inter | fraunces | system

  // Content
  sections: [],
  gallery: [], // array of { id, src, caption }
});

export const SECTION_TYPES = [
  { value: 'about', label: 'About Us' },
  { value: 'products', label: 'Products' },
  { value: 'services', label: 'Services' },
  { value: 'initiatives', label: 'Initiatives' },
  { value: 'projects', label: 'Projects' },
  { value: 'team', label: 'Team Members' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'brochures', label: 'Brochures' },
  { value: 'faqs', label: 'FAQs' },
  { value: 'custom', label: 'Custom Section' },
];
