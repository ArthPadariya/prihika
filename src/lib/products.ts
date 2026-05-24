import { supabase } from "@/lib/supabase";
import {
  seedBanners,
  seedCategories,
  seedCollections,
  seedFeaturedSections,
  seedHomepageContent,
  seedProducts,
  seedReels,
  seedTestimonials,
} from "@/lib/seed-data";
import type {
  Banner,
  Category,
  Collection,
  FeaturedSection,
  HomepageContent,
  HomepageReel,
  Product as AdminProduct,
  Testimonial,
} from "@/types/admin";
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
  testimonials: Testimonial[];
}

function canReturnEmpty(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  return (
    candidate.code === "42P01" ||
    candidate.code === "42501" ||
    candidate.code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
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
    if (canReturnEmpty(error)) return empty;
    throw error;
  }
  return data ?? empty;
}

function mergeByKey<T>(items: T[], seed: T[], keyFor: (item: T) => string | null | undefined) {
  const merged = new Map(seed.map((item) => [keyFor(item), item]).filter(([key]) => Boolean(key)));
  for (const item of items) {
    const key = keyFor(item);
    if (key) merged.set(key, item);
  }
  return [...merged.values(), ...items.filter((item) => !keyFor(item))];
}

function mergeProducts(items: AdminProduct[]) {
  const merged = new Map(seedProducts.map((product) => [product.slug, product]));
  for (const item of items) {
    const fallback = item.slug ? merged.get(item.slug) : undefined;
    merged.set(item.slug, {
      ...fallback,
      ...item,
      product_images: item.product_images?.length ? item.product_images : fallback?.product_images,
      product_faqs: item.product_faqs?.length ? item.product_faqs : fallback?.product_faqs,
    });
  }
  return [...merged.values()];
}

export async function listStoreProducts() {
  const data = await safeSelect(
    supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false }),
    [] as AdminProduct[],
  );
  return mergeProducts(data).map(mapProduct);
}

export async function getStoreProduct(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    idOrSlug,
  );
  const seeded = seedProducts.find(
    (product) => product.id === idOrSlug || product.slug === idOrSlug,
  );
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_faqs(*)")
    .eq("status", "active")
    .or(isUuid ? `id.eq.${idOrSlug},slug.eq.${idOrSlug}` : `slug.eq.${idOrSlug}`)
    .limit(1)
    .maybeSingle();
  if (error) {
    if (canReturnEmpty(error)) return seeded ? mapProduct(seeded) : null;
    throw error;
  }
  return data ? mapProduct(data as AdminProduct) : seeded ? mapProduct(seeded) : null;
}

export async function listStoreCategories() {
  const [categories, products] = await Promise.all([
    safeSelect(
      supabase
        .from("categories")
        .select("*")
        .eq("featured", true)
        .order("display_order", { ascending: true }),
      [] as Category[],
    ),
    listStoreProducts(),
  ]);

  return mergeByKey(categories, seedCategories, (category) => category.slug).map((category) => ({
    ...category,
    count: products.filter((product) => product.category === category.name).length,
  }));
}

export async function listStoreCollections(featuredOnly = false) {
  let query = supabase
    .from("collections")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (featuredOnly) query = query.eq("featured", true);
  const collections = await safeSelect(query, [] as Collection[]);
  return mergeByKey(
    collections,
    featuredOnly ? seedCollections.filter((collection) => collection.featured) : seedCollections,
    (collection) => collection.slug,
  );
}

export async function listStoreBanners() {
  const banners = await safeSelect(
    supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    [] as Banner[],
  );
  return mergeByKey(
    banners,
    seedBanners.filter((banner) => banner.active),
    (banner) => banner.id,
  );
}

export async function listStoreReels() {
  const reels = await safeSelect(
    supabase
      .from("homepage_reels")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    [] as HomepageReel[],
  );
  return mergeByKey(
    reels,
    seedReels.filter((reel) => reel.active),
    (reel) => reel.id,
  );
}

export async function listStoreTestimonials() {
  const testimonials = await safeSelect(
    supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    [] as Testimonial[],
  );
  return mergeByKey(
    testimonials,
    seedTestimonials.filter((testimonial) => testimonial.active),
    (testimonial) => testimonial.id,
  );
}

export async function getHomepageContent() {
  const { data, error } = await supabase
    .from("homepage_content")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (canReturnEmpty(error)) return seedHomepageContent;
    throw error;
  }
  return (data as HomepageContent | null) ?? seedHomepageContent;
}

export async function listStoreFeaturedSections() {
  const sections = await safeSelect(
    supabase
      .from("featured_sections")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    [] as FeaturedSection[],
  );
  return mergeByKey(
    sections,
    seedFeaturedSections.filter((section) => section.active),
    (section) => section.section_key,
  );
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
    testimonials,
  ] = await Promise.all([
    getHomepageContent(),
    listStoreProducts(),
    listStoreCategories(),
    listStoreCollections(true),
    listStoreBanners(),
    listStoreReels(),
    listStoreFeaturedSections(),
    listStoreTestimonials(),
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
    testimonials,
    bestsellers,
    trending,
    instagramProducts: products.slice(0, 6),
  };
}
