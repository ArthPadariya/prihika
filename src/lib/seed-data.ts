import bangle from "@/assets/bangle.jpg";
import bracelet from "@/assets/bracelet.jpg";
import bridal from "@/assets/collection-bridal.jpg";
import everyday from "@/assets/collection-everyday.jpg";
import statement from "@/assets/collection-statement.jpg";
import earrings from "@/assets/earrings.jpg";
import hero from "@/assets/hero.jpg";
import necklace from "@/assets/necklace.jpg";
import pendant from "@/assets/pendant.jpg";
import ring from "@/assets/ring.jpg";
import solitaire from "@/assets/solitaire.jpg";
import type {
  Banner,
  Category,
  Collection,
  FeaturedSection,
  HomepageContent,
  HomepageReel,
  Product,
  Testimonial,
} from "@/types/admin";

const ids = {
  solitaire: "00000000-0000-4000-8000-000000000101",
  ring: "00000000-0000-4000-8000-000000000102",
  pendant: "00000000-0000-4000-8000-000000000103",
  necklace: "00000000-0000-4000-8000-000000000104",
  earrings: "00000000-0000-4000-8000-000000000105",
  bracelet: "00000000-0000-4000-8000-000000000106",
  bangle: "00000000-0000-4000-8000-000000000107",
};

const productFaqs = (productId: string) => [
  {
    id: `00000000-0000-4000-8000-00000000${productId.slice(-3)}1`,
    product_id: productId,
    question: "Is this piece certified?",
    answer:
      "Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.",
    sort_order: 0,
  },
  {
    id: `00000000-0000-4000-8000-00000000${productId.slice(-3)}2`,
    product_id: productId,
    question: "Can I request styling help before ordering?",
    answer: "Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.",
    sort_order: 1,
  },
];

export const seedProducts: Product[] = [
  {
    id: ids.solitaire,
    title: "Celeste Solitaire Ring",
    slug: "celeste-solitaire-ring",
    price: 54000,
    compare_price: 62000,
    description:
      "A luminous solitaire ring designed for quiet proposals, milestones, and everyday ceremony.",
    category: "Rings",
    collection: "Bridal Heirlooms",
    material: "18K Rose Gold",
    stock: 8,
    featured: true,
    status: "active",
    product_images: [
      {
        id: "00000000-0000-4000-8000-000000001101",
        product_id: ids.solitaire,
        image_url: solitaire,
        alt_text: "Celeste Solitaire Ring",
        sort_order: 0,
      },
      {
        id: "00000000-0000-4000-8000-000000001102",
        product_id: ids.solitaire,
        image_url: ring,
        alt_text: "Solitaire ring side profile",
        sort_order: 1,
      },
    ],
    product_faqs: productFaqs(ids.solitaire),
  },
  {
    id: ids.ring,
    title: "Noor Stack Ring",
    slug: "noor-stack-ring",
    price: 28500,
    description:
      "A refined stack ring with a slim silhouette, made to layer beautifully with heirloom bands.",
    category: "Rings",
    collection: "Everyday Icons",
    material: "18K Yellow Gold",
    stock: 14,
    featured: true,
    status: "active",
    product_images: [
      {
        id: "00000000-0000-4000-8000-000000001201",
        product_id: ids.ring,
        image_url: ring,
        alt_text: "Noor Stack Ring",
        sort_order: 0,
      },
    ],
    product_faqs: productFaqs(ids.ring),
  },
  {
    id: ids.pendant,
    title: "Aara Diamond Pendant",
    slug: "aara-diamond-pendant",
    price: 36500,
    compare_price: 42000,
    description:
      "A soft diamond pendant that catches light without trying too hard, finished for daily wear.",
    category: "Pendants",
    collection: "Everyday Icons",
    material: "18K Rose Gold",
    stock: 11,
    featured: true,
    status: "active",
    product_images: [
      {
        id: "00000000-0000-4000-8000-000000001301",
        product_id: ids.pendant,
        image_url: pendant,
        alt_text: "Aara Diamond Pendant",
        sort_order: 0,
      },
    ],
    product_faqs: productFaqs(ids.pendant),
  },
  {
    id: ids.necklace,
    title: "Mira Layered Necklace",
    slug: "mira-layered-necklace",
    price: 68500,
    description:
      "A layered necklace with polished movement, made for silk sarees, linen shirts, and evenings out.",
    category: "Necklaces",
    collection: "Statement Edit",
    material: "18K Yellow Gold",
    stock: 6,
    featured: true,
    status: "active",
    product_images: [
      {
        id: "00000000-0000-4000-8000-000000001401",
        product_id: ids.necklace,
        image_url: necklace,
        alt_text: "Mira Layered Necklace",
        sort_order: 0,
      },
    ],
    product_faqs: productFaqs(ids.necklace),
  },
  {
    id: ids.earrings,
    title: "Ira Diamond Hoops",
    slug: "ira-diamond-hoops",
    price: 45500,
    description:
      "Diamond hoops with a clean, luminous profile that moves easily from workday to wedding guest.",
    category: "Earrings",
    collection: "Everyday Icons",
    material: "18K White Gold",
    stock: 9,
    featured: false,
    status: "active",
    product_images: [
      {
        id: "00000000-0000-4000-8000-000000001501",
        product_id: ids.earrings,
        image_url: earrings,
        alt_text: "Ira Diamond Hoops",
        sort_order: 0,
      },
    ],
    product_faqs: productFaqs(ids.earrings),
  },
  {
    id: ids.bracelet,
    title: "Leela Tennis Bracelet",
    slug: "leela-tennis-bracelet",
    price: 72000,
    compare_price: 78500,
    description:
      "A graceful tennis bracelet with even-set stones and a secure clasp for celebrations and daily shine.",
    category: "Bracelets",
    collection: "Statement Edit",
    material: "18K White Gold",
    stock: 5,
    featured: true,
    status: "active",
    product_images: [
      {
        id: "00000000-0000-4000-8000-000000001601",
        product_id: ids.bracelet,
        image_url: bracelet,
        alt_text: "Leela Tennis Bracelet",
        sort_order: 0,
      },
    ],
    product_faqs: productFaqs(ids.bracelet),
  },
  {
    id: ids.bangle,
    title: "Saanjh Gold Bangle",
    slug: "saanjh-gold-bangle",
    price: 58500,
    description:
      "A sculpted gold bangle with a warm finish, built to feel substantial without losing softness.",
    category: "Bangles",
    collection: "Statement Edit",
    material: "22K Gold",
    stock: 7,
    featured: false,
    status: "active",
    product_images: [
      {
        id: "00000000-0000-4000-8000-000000001701",
        product_id: ids.bangle,
        image_url: bangle,
        alt_text: "Saanjh Gold Bangle",
        sort_order: 0,
      },
    ],
    product_faqs: productFaqs(ids.bangle),
  },
];

export const seedCategories: Category[] = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    name: "Rings",
    slug: "rings",
    image: ring,
    description: "Solitaire, stack, and occasion rings.",
    featured: true,
    display_order: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    name: "Necklaces",
    slug: "necklaces",
    image: necklace,
    description: "Layered chains and statement necklaces.",
    featured: true,
    display_order: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    name: "Earrings",
    slug: "earrings",
    image: earrings,
    description: "Hoops, studs, and polished everyday shine.",
    featured: true,
    display_order: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    name: "Bracelets",
    slug: "bracelets",
    image: bracelet,
    description: "Bracelets and bangles for modern heirlooms.",
    featured: true,
    display_order: 3,
  },
];

export const seedCollections: Collection[] = [
  {
    id: "00000000-0000-4000-8000-000000000301",
    title: "Bridal Heirlooms",
    slug: "bridal-heirlooms",
    description: "Ceremonial pieces for vows, family rituals, and the stories that stay.",
    cover_image: bridal,
    featured: true,
    seo_title: "Bridal Heirlooms - PriHiKa",
    seo_description: "Wedding-ready fine jewellery by PriHiKa.",
    display_order: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000302",
    title: "Everyday Icons",
    slug: "everyday-icons",
    description: "Quietly luxurious staples designed to become part of your daily rhythm.",
    cover_image: everyday,
    featured: true,
    seo_title: "Everyday Icons - PriHiKa",
    seo_description: "Fine jewellery for everyday wear.",
    display_order: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000303",
    title: "Statement Edit",
    slug: "statement-edit",
    description: "Bold silhouettes, soft finishes, and pieces that hold a room gracefully.",
    cover_image: statement,
    featured: true,
    seo_title: "Statement Edit - PriHiKa",
    seo_description: "Statement jewellery with PriHiKa restraint.",
    display_order: 2,
  },
];

export const seedHomepageContent: HomepageContent = {
  id: "00000000-0000-4000-8000-000000000401",
  hero_badge: "New Season Heirlooms",
  hero_title: "Luxury jewellery, made to be remembered.",
  hero_subtitle:
    "Discover handcrafted rings, necklaces, earrings, bracelets, and bridal pieces designed with care, set in fine metals, and finished for a lifetime of meaning.",
  hero_image: hero,
  hero_featured_note: "Loved by modern brides, gift givers, and collectors of quiet luxury.",
  cta_primary: "Shop Now",
  cta_primary_link: "/shop",
  cta_secondary: "View Collections",
  cta_secondary_link: "/collections",
  testimonial_text: "The PriHiKa edit is curated for modern heirlooms and everyday ceremony.",
  active: true,
};

export const seedFeaturedSections: FeaturedSection[] = [
  {
    id: "00000000-0000-4000-8000-000000000501",
    section_key: "categories",
    eyebrow: "Shop by Category",
    title: "Fine jewellery for every ritual",
    description: "Homepage category cards powered by CMS seed data.",
    product_ids: [],
    active: true,
    display_order: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000502",
    section_key: "bestsellers",
    eyebrow: "Bestsellers",
    title: "Most loved this season",
    description: "Featured products selected from the CMS.",
    product_ids: [ids.solitaire, ids.pendant, ids.necklace, ids.bracelet],
    active: true,
    display_order: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000503",
    section_key: "collections",
    eyebrow: "Collections",
    title: "Stories in gold, diamonds, and light",
    description: "Featured collection cards controlled by CMS.",
    product_ids: [],
    active: true,
    display_order: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000504",
    section_key: "trending",
    eyebrow: "Trending Now",
    title: "Pieces with a quiet glow",
    description: "Trending products selected from seeded CMS records.",
    product_ids: [ids.ring, ids.earrings, ids.bangle, ids.solitaire],
    active: true,
    display_order: 3,
  },
  {
    id: "00000000-0000-4000-8000-000000000505",
    section_key: "testimonials",
    eyebrow: "Kind Words",
    title: "Jewellery that becomes part of the moment",
    description: "Homepage testimonial heading.",
    product_ids: [],
    active: true,
    display_order: 4,
  },
  {
    id: "00000000-0000-4000-8000-000000000506",
    section_key: "instagram",
    eyebrow: "On Instagram",
    title: "Seen in soft light",
    description: "Instagram-style product grid heading.",
    product_ids: [],
    active: true,
    display_order: 5,
  },
];

export const seedTestimonials: Testimonial[] = [
  {
    id: "00000000-0000-4000-8000-000000000601",
    name: "Priya Mehra",
    city: "Mumbai",
    text: "The solitaire felt personal from the first fitting. It has that rare balance of polish and warmth.",
    rating: 5,
    active: true,
    display_order: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000602",
    name: "Ananya Rao",
    city: "Bengaluru",
    text: "I bought the pendant as a gift and the packaging, finish, and concierge support were beautiful.",
    rating: 5,
    active: true,
    display_order: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000603",
    name: "Nisha Kapoor",
    city: "Delhi",
    text: "The bracelet is delicate but not fragile. It catches light in the most graceful way.",
    rating: 5,
    active: true,
    display_order: 2,
  },
];

export const seedBanners: Banner[] = [
  {
    id: "00000000-0000-4000-8000-000000000701",
    title: "Bridal appointments",
    desktop_image_url: statement,
    mobile_image_url: bridal,
    link_url: "/collections",
    active: true,
    sort_order: 0,
  },
];

export const seedReels: HomepageReel[] = [
  {
    id: "00000000-0000-4000-8000-000000000801",
    title: "Solitaire glow",
    video_url: solitaire,
    thumbnail_url: solitaire,
    active: true,
    sort_order: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000802",
    title: "Layered gold",
    video_url: necklace,
    thumbnail_url: necklace,
    active: true,
    sort_order: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000803",
    title: "Diamond hoops",
    video_url: earrings,
    thumbnail_url: earrings,
    active: true,
    sort_order: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000804",
    title: "Bracelet detail",
    video_url: bracelet,
    thumbnail_url: bracelet,
    active: true,
    sort_order: 3,
  },
];

export const seededDashboardStats = {
  totalProducts: seedProducts.length,
  totalCategories: seedCategories.length,
  totalCollections: seedCollections.length,
  totalOrders: 0,
  totalRevenue: 0,
  totalReels: seedReels.length,
  totalBanners: seedBanners.length,
  activeReels: seedReels.filter((reel) => reel.active).length,
  activeBanners: seedBanners.filter((banner) => banner.active).length,
  lowStock: seedProducts.filter((product) => Number(product.stock ?? 0) <= 3).length,
  pendingOrders: 0,
  deliveredOrders: 0,
  totalAdminUsers: 1,
  featuredProducts: seedProducts.filter((product) => product.featured).length,
  newestProducts: seedProducts.slice(0, 5).map((product) => product.title),
};
