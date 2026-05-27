import { supabase } from "@/lib/supabase";
import type {
  Banner,
  Category,
  Collection,
  FeaturedSection,
  HomepageContent,
  HomepagePromise,
  HomepageReel,
  NewsletterSection,
  Product as AdminProduct,
  Testimonial,
} from "@/types/admin";
import {
  seedBanners,
  seedCategories,
  seedCollections,
  seedFeaturedSections,
  seedHomepageContent,
  seedNewsletter,
  seedProducts,
  seedPromises,
  seedReels,
  seedTestimonials,
} from "@/lib/seed-defaults";
import type { Product } from "./store";

export interface StoreCategory extends Category {
  count: number;
}

export interface HomeData {
  homepage: HomepageContent | null;
  categories: StoreCategory[];
  collections: Collection[];
  products: Product[];
  bestsellers: Product[];
  trending: Product[];
  instagramProducts: Product[];
  banners: Banner[];
  reels: HomepageReel[];
  featuredSections: FeaturedSection[];
  promises: HomepagePromise[];
  testimonials: Testimonial[];
  newsletter: NewsletterSection | null;
}

function canReturnEmpty(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  return (
    candidate.code === "42501" ||
    candidate.code === "42P01" ||
    candidate.code === "PGRST205" ||
    message.includes("permission denied") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

function logStoreReadError(context: string, error: unknown) {
  console.error(`[Prihika storefront] ${context}`, error);
}

function firstImage(product: AdminProduct) {
  return (
    product.product_images
      ?.slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))[0]?.image_url ?? ""
  );
}

function mapProduct(product: AdminProduct): Product {
  return {
    id: product.slug || product.id,
    databaseId: product.id,
    name: product.title,
    price: Number(product.price ?? 0),
    oldPrice: product.compare_price ? Number(product.compare_price) : undefined,
    category: product.category || "Uncategorised",
    collection: product.collection || "Prihika",
    image: firstImage(product),
    rating: 0,
    reviews: 0,
    metal: product.material || "Fine Jewellery",
    description: product.description || "",
    faqs: product.product_faqs
      ?.slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      .map((faq) => ({ question: faq.question, answer: faq.answer })),
  };
}

async function safeSelect<T>(query: PromiseLike<{ data: T | null; error: unknown }>, empty: T) {
  const { data, error } = await query;
  if (error) {
    if (canReturnEmpty(error)) {
      logStoreReadError("Supabase read returned no usable data", error);
      return empty;
    }
    throw error;
  }
  return data ?? empty;
}

export async function listStoreProducts() {
  const data = await safeSelect(
    supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false }),
    seedProducts as AdminProduct[],
  );
  return (data.length ? data : seedProducts).map(mapProduct);
}

export async function getStoreProduct(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    idOrSlug,
  );
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_faqs(*)")
    .eq("status", "active")
    .or(isUuid ? `id.eq.${idOrSlug},slug.eq.${idOrSlug}` : `slug.eq.${idOrSlug}`)
    .limit(1)
    .maybeSingle();
  if (error) {
    if (canReturnEmpty(error)) {
      logStoreReadError("Product lookup returned no usable data", error);
      const fallback = seedProducts.find(
        (product) => product.id === idOrSlug || product.slug === idOrSlug,
      );
      return fallback ? mapProduct(fallback) : null;
    }
    throw error;
  }
  const fallback = seedProducts.find(
    (product) => product.id === idOrSlug || product.slug === idOrSlug,
  );
  return data ? mapProduct(data as AdminProduct) : fallback ? mapProduct(fallback) : null;
}

export async function listStoreCategories() {
  const [categories, products] = await Promise.all([
    safeSelect(
      supabase
        .from("homepage_categories")
        .select("*")
        .eq("featured", true)
        .order("display_order", { ascending: true }),
      seedCategories,
    ),
    listStoreProducts(),
  ]);

  return (categories.length ? categories : seedCategories).map((category) => ({
    ...category,
    count: products.filter((product) => product.category === category.name).length,
  }));
}

export async function listStoreCollections(featuredOnly = false) {
  let query = supabase
    .from("homepage_collections")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (featuredOnly) query = query.eq("featured", true);
  const data = await safeSelect(query, seedCollections);
  return data.length ? data : seedCollections;
}

export async function listStoreBanners() {
  const data = await safeSelect(
    supabase
      .from("homepage_banners")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    seedBanners,
  );
  return data.length ? data : seedBanners;
}

export async function listStoreReels() {
  const data = await safeSelect(
    supabase
      .from("homepage_reels")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    seedReels,
  );
  return data.length ? data : seedReels;
}

export async function listStoreTestimonials() {
  const data = await safeSelect(
    supabase
      .from("homepage_testimonials")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    seedTestimonials,
  );
  return data.length ? data : seedTestimonials;
}

export async function getHomepageContent() {
  const { data, error } = await supabase
    .from("homepage_hero")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (canReturnEmpty(error)) {
      logStoreReadError("Homepage content returned no usable data", error);
      return seedHomepageContent;
    }
    throw error;
  }
  return (data as HomepageContent | null) ?? seedHomepageContent;
}

export async function listStoreFeaturedSections() {
  const data = await safeSelect(
    supabase
      .from("homepage_featured_products")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    seedFeaturedSections,
  );
  return data.length ? data : seedFeaturedSections;
}

export async function listStorePromises() {
  const data = await safeSelect(
    supabase
      .from("homepage_promises")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    seedPromises,
  );
  return data.length ? data : seedPromises;
}

export async function getNewsletterSection() {
  const { data, error } = await supabase
    .from("newsletter_section")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (canReturnEmpty(error)) {
      logStoreReadError("Newsletter section returned no usable data", error);
      return seedNewsletter;
    }
    throw error;
  }
  return (data as NewsletterSection | null) ?? seedNewsletter;
}

function productsForSection(products: Product[], section?: FeaturedSection) {
  if (!section?.product_ids?.length) return [];
  const byId = new Map(
    products.flatMap((product) => [
      [product.id, product],
      [product.databaseId, product],
    ]),
  );
  return section.product_ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
}

export async function getHomeData(): Promise<HomeData> {
  const [
    homepage,
    products,
    categories,
    collections,
    banners,
    reels,
    featuredSections,
    promises,
    testimonials,
    newsletter,
  ] = await Promise.all([
    getHomepageContent(),
    listStoreProducts(),
    listStoreCategories(),
    listStoreCollections(true),
    listStoreBanners(),
    listStoreReels(),
    listStoreFeaturedSections(),
    listStorePromises(),
    listStoreTestimonials(),
    getNewsletterSection(),
  ]);
  const bestsellers = productsForSection(
    products,
    featuredSections.find((section) => section.section_key === "bestsellers"),
  ).slice(0, 4);
  const trending = productsForSection(
    products,
    featuredSections.find((section) => section.section_key === "trending"),
  ).slice(0, 4);

  return {
    homepage,
    products,
    categories,
    collections,
    banners,
    reels,
    featuredSections,
    promises,
    testimonials,
    newsletter,
    bestsellers,
    trending,
    instagramProducts: products.slice(0, 6),
  };
}
