import { getSupabaseConfigError, normalizeAuthEmail, supabase } from "@/lib/supabase";
import {
  seedBanners,
  seedCategories,
  seedCollections,
  seedFeaturedSections,
  seedHomepageContent,
  seedProducts,
  seedReels,
  seedTestimonials,
} from "@/lib/seed-defaults";
import type {
  AdminUser,
  Banner,
  Category,
  Collection,
  Coupon,
  DashboardStats,
  FeaturedSection,
  HomepageContent,
  HomepageReel,
  Order,
  OrderStatus,
  Product,
  ProductFaq,
  ProductImage,
  ProductInput,
  SystemHealth,
  Testimonial,
} from "@/types/admin";

type TableName =
  | "products"
  | "product_images"
  | "product_faqs"
  | "categories"
  | "collections"
  | "homepage_content"
  | "homepage_sections"
  | "homepage_hero"
  | "homepage_categories"
  | "homepage_collections"
  | "homepage_featured_products"
  | "homepage_testimonials"
  | "homepage_promises"
  | "newsletter_section"
  | "site_settings"
  | "featured_sections"
  | "testimonials"
  | "orders"
  | "order_items"
  | "homepage_reels"
  | "homepage_banners"
  | "banners"
  | "admin_users"
  | "coupons";

const table = (name: TableName) => supabase.from(name);

export const allowedAdminRoles = ["super_admin", "admin"] as const;
export const realtimeTables = [
  "products",
  "product_images",
  "product_faqs",
  "categories",
  "collections",
  "homepage_content",
  "homepage_sections",
  "homepage_hero",
  "homepage_categories",
  "homepage_collections",
  "homepage_featured_products",
  "homepage_testimonials",
  "homepage_promises",
  "newsletter_section",
  "site_settings",
  "featured_sections",
  "testimonials",
  "banners",
  "homepage_banners",
  "homepage_reels",
  "orders",
  "admin_users",
  "coupons",
] as const;

interface AuthProfileUser {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}

function isPermissionDenied(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    candidate.code === "42501" ||
    (typeof candidate.message === "string" &&
      candidate.message.toLowerCase().includes("permission denied"))
  );
}

function isMissingRelation(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  return (
    candidate.code === "42P01" ||
    candidate.code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

function shouldReturnEmpty(error: unknown) {
  return isPermissionDenied(error) || isMissingRelation(error);
}

function isNoRows(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  return candidate.code === "PGRST116" || message.includes("0 rows") || message.includes("no rows");
}

function pickDefined<T extends Record<string, unknown>, K extends keyof T>(
  input: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (payload, key) => {
      if (input[key] !== undefined) payload[key] = input[key];
      return payload;
    },
    {} as Pick<T, K>,
  );
}

function logAndThrow(context: string, error: unknown): never {
  console.error(`[Prihika CMS] ${context}`, error);
  if (error instanceof Error) throw error;
  if (error && typeof error === "object" && "message" in error) {
    throw new Error(String((error as { message?: unknown }).message));
  }
  throw new Error(`${context} failed.`);
}

function getMetadataText(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getAuthRole(user: AuthProfileUser): AdminUser["role"] {
  const role =
    getMetadataText(user.app_metadata, "role") ||
    getMetadataText(user.user_metadata, "role") ||
    getMetadataText(user.app_metadata, "admin_role") ||
    getMetadataText(user.user_metadata, "admin_role");

  return allowedAdminRoles.includes(role as (typeof allowedAdminRoles)[number]) ? role : "admin";
}

function createSessionAdminProfile(user: AuthProfileUser): AdminUser | null {
  const email = user.email ? normalizeAuthEmail(user.email) : "";
  if (!email) return null;

  const name =
    getMetadataText(user.user_metadata, "name") ||
    getMetadataText(user.user_metadata, "full_name") ||
    email.split("@")[0];

  return {
    id: user.id,
    user_id: user.id,
    email,
    name,
    role: getAuthRole(user),
    created_at: null,
    updated_at: null,
  };
}

async function saveRow<T>(
  tableName: TableName,
  payload: Record<string, unknown>,
  id?: string,
): Promise<T> {
  if (id) {
    const updated = await table(tableName).update(payload).eq("id", id).select().maybeSingle();
    if (updated.error && !isNoRows(updated.error))
      logAndThrow(`Update ${tableName}`, updated.error);
    if (updated.data) return updated.data as T;

    const inserted = await table(tableName)
      .insert({ id, ...payload })
      .select()
      .single();
    if (inserted.error) logAndThrow(`Insert ${tableName}`, inserted.error);
    return inserted.data as T;
  }

  const inserted = await table(tableName).insert(payload).select().single();
  if (inserted.error) logAndThrow(`Insert ${tableName}`, inserted.error);
  return inserted.data as T;
}

async function readAllowedAdminProfile(user: AuthProfileUser): Promise<AdminUser | null> {
  const email = user.email ? normalizeAuthEmail(user.email) : "";
  if (!email) return null;

  const { data, error } = await table("admin_users")
    .select("*")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (error) {
    if (shouldReturnEmpty(error)) {
      console.warn(
        "[Prihika CMS] admin_users profile lookup is blocked by Supabase permissions. Using the authenticated session profile until the admin RLS migration is applied.",
        error,
      );
      return createSessionAdminProfile(user);
    }
    logAndThrow("Read admin profile", error);
  }

  if (
    !data ||
    !allowedAdminRoles.includes(String(data.role) as (typeof allowedAdminRoles)[number])
  ) {
    return null;
  }

  return data as AdminUser;
}

export async function getAdminProfileForUser(user: AuthProfileUser): Promise<AdminUser | null> {
  return readAllowedAdminProfile(user);
}

export async function getCurrentAdminProfile(): Promise<AdminUser | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const user = sessionData.session?.user;
  if (!user?.email) return null;

  return readAllowedAdminProfile(user);
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    products,
    featuredProducts,
    orders,
    reels,
    activeReels,
    banners,
    activeBanners,
    categories,
    collections,
    lowStock,
    newestProducts,
    pendingOrders,
    deliveredOrders,
    admins,
  ] = await Promise.all([
    table("products").select("id", { count: "exact", head: true }),
    table("products").select("id", { count: "exact", head: true }).eq("featured", true),
    table("orders").select("id,total_amount", { count: "exact" }),
    table("homepage_reels").select("id", { count: "exact", head: true }),
    table("homepage_reels").select("id", { count: "exact", head: true }).eq("active", true),
    table("homepage_banners").select("id", { count: "exact", head: true }),
    table("homepage_banners").select("id", { count: "exact", head: true }).eq("active", true),
    table("homepage_categories").select("id", { count: "exact", head: true }),
    table("homepage_collections").select("id", { count: "exact", head: true }),
    table("products").select("id", { count: "exact", head: true }).lte("stock", 3),
    table("products").select("title").order("created_at", { ascending: false }).limit(5),
    table("orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
    table("orders").select("id", { count: "exact", head: true }).eq("status", "Delivered"),
    table("admin_users").select("id", { count: "exact", head: true }),
  ]);

  for (const result of [
    products,
    featuredProducts,
    orders,
    reels,
    activeReels,
    banners,
    activeBanners,
    categories,
    collections,
    lowStock,
    newestProducts,
    pendingOrders,
    deliveredOrders,
    admins,
  ]) {
    if (result.error && !shouldReturnEmpty(result.error)) {
      console.error("[Prihika CMS] Dashboard query failed", result.error);
    }
  }

  const totalRevenue =
    orders.data?.reduce(
      (sum, order) => sum + Number((order as { total_amount?: number }).total_amount ?? 0),
      0,
    ) ?? 0;

  return {
    totalProducts: products.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalCollections: collections.count ?? 0,
    totalOrders: orders.count ?? orders.data?.length ?? 0,
    totalRevenue,
    totalReels: reels.count ?? 0,
    totalBanners: banners.count ?? 0,
    activeReels: activeReels.count ?? 0,
    activeBanners: activeBanners.count ?? 0,
    featuredProducts: featuredProducts.count ?? 0,
    lowStock: lowStock.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    deliveredOrders: deliveredOrders.count ?? 0,
    totalAdminUsers: admins.error ? 1 : (admins.count ?? 0),
    newestProducts: ((newestProducts.data ?? []) as Pick<Product, "title">[])
      .map((product) => String((product as { title?: string }).title ?? ""))
      .filter(Boolean),
  };
}

export async function listProducts(
  search = "",
  page = 1,
  pageSize = 10,
  category = "all",
  sort = "newest",
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = table("products")
    .select("*, product_images(*), product_faqs(*)", { count: "exact" })
    .range(from, to);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "stock_asc") query = query.order("stock", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  if (search)
    query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%,category.ilike.%${search}%`);
  if (category !== "all") query = query.eq("category", category);

  const { data, error, count } = await query;
  if (error) {
    if (shouldReturnEmpty(error)) return { products: seedProducts, count: seedProducts.length };
    logAndThrow("List products", error);
  }
  const products = ((data ?? []) as Product[]).length ? ((data ?? []) as Product[]) : seedProducts;
  return { products, count: Math.max(count ?? 0, products.length) };
}

export async function listAllProducts() {
  const { data, error } = await table("products").select(
    "id,title,category,collection,price,featured,status,stock,created_at",
  );
  if (error) {
    if (shouldReturnEmpty(error)) return seedProducts;
    logAndThrow("List all products", error);
  }
  return ((data ?? []) as Product[]).length ? ((data ?? []) as Product[]) : seedProducts;
}

export async function listCategories() {
  const { data, error } = await table("homepage_categories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    if (shouldReturnEmpty(error)) return seedCategories;
    logAndThrow("List categories", error);
  }
  return ((data ?? []) as Category[]).length ? ((data ?? []) as Category[]) : seedCategories;
}

export async function saveCategory(
  input: Omit<Category, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "name",
      "slug",
      "image",
      "description",
      "featured",
      "display_order",
    ]),
    featured: Boolean(input.featured),
    display_order: Number(input.display_order ?? 0),
  };
  return saveRow<Category>("homepage_categories", payload, id);
}

export async function deleteCategory(id: string) {
  const { error } = await table("homepage_categories").delete().eq("id", id);
  if (error) logAndThrow("Delete category", error);
}

export async function listCollections() {
  const { data, error } = await table("homepage_collections")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    if (shouldReturnEmpty(error)) return seedCollections;
    logAndThrow("List collections", error);
  }
  return ((data ?? []) as Collection[]).length ? ((data ?? []) as Collection[]) : seedCollections;
}

export async function saveCollection(
  input: Omit<Collection, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "title",
      "slug",
      "description",
      "cover_image",
      "featured",
      "seo_title",
      "seo_description",
      "display_order",
    ]),
    featured: Boolean(input.featured),
    display_order: Number(input.display_order ?? 0),
  };
  return saveRow<Collection>("homepage_collections", payload, id);
}

export async function deleteCollection(id: string) {
  const { error } = await table("homepage_collections").delete().eq("id", id);
  if (error) logAndThrow("Delete collection", error);
}

export async function getHomepageContent() {
  const { data, error } = await table("homepage_hero")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (shouldReturnEmpty(error)) return seedHomepageContent;
    logAndThrow("Read homepage content", error);
  }
  return (data as HomepageContent | null) ?? seedHomepageContent;
}

export async function saveHomepageContent(
  input: Omit<HomepageContent, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "hero_title",
      "hero_subtitle",
      "hero_image",
      "hero_badge",
      "hero_featured_note",
      "cta_primary",
      "cta_primary_link",
      "cta_secondary",
      "cta_secondary_link",
      "testimonial_text",
      "active",
    ]),
    active: Boolean(input.active),
  };
  return saveRow<HomepageContent>("homepage_hero", payload, id);
}

export async function listFeaturedSections() {
  const { data, error } = await table("homepage_featured_products")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedFeaturedSections;
    logAndThrow("List featured sections", error);
  }
  return ((data ?? []) as FeaturedSection[]).length
    ? ((data ?? []) as FeaturedSection[])
    : seedFeaturedSections;
}

export async function saveFeaturedSection(
  input: Omit<FeaturedSection, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "section_key",
      "eyebrow",
      "title",
      "description",
      "product_ids",
      "active",
      "display_order",
    ]),
    active: Boolean(input.active),
    display_order: Number(input.display_order ?? 0),
    product_ids: input.product_ids ?? [],
  };
  return saveRow<FeaturedSection>("homepage_featured_products", payload, id);
}

export async function deleteFeaturedSection(id: string) {
  const { error } = await table("homepage_featured_products").delete().eq("id", id);
  if (error) logAndThrow("Delete featured section", error);
}

export async function listTestimonials() {
  const { data, error } = await table("homepage_testimonials")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedTestimonials;
    logAndThrow("List testimonials", error);
  }
  return ((data ?? []) as Testimonial[]).length
    ? ((data ?? []) as Testimonial[])
    : seedTestimonials;
}

export async function saveTestimonial(
  input: Omit<Testimonial, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "name",
      "city",
      "text",
      "rating",
      "active",
      "display_order",
    ]),
    rating: Number(input.rating ?? 5),
    active: Boolean(input.active),
    display_order: Number(input.display_order ?? 0),
  };
  return saveRow<Testimonial>("homepage_testimonials", payload, id);
}

export async function deleteTestimonial(id: string) {
  const { error } = await table("homepage_testimonials").delete().eq("id", id);
  if (error) logAndThrow("Delete testimonial", error);
}

export async function saveProduct(input: ProductInput, id?: string) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "title",
      "slug",
      "price",
      "compare_price",
      "description",
      "category",
      "collection",
      "material",
      "stock",
      "featured",
      "status",
    ]),
    price: Number(input.price || 0),
    compare_price: input.compare_price ? Number(input.compare_price) : null,
    stock: Number(input.stock || 0),
    featured: Boolean(input.featured),
  };

  return saveRow<Product>("products", payload, id);
}

export async function deleteProduct(id: string) {
  const { error } = await table("products").delete().eq("id", id);
  if (error) logAndThrow("Delete product", error);
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  const { error } = await table("products").update({ featured }).eq("id", id);
  if (error) logAndThrow("Toggle product featured", error);
}

export async function addProductImages(images: Omit<ProductImage, "id" | "created_at">[]) {
  const { data, error } = await table("product_images").insert(images).select();
  if (error) logAndThrow("Add product images", error);
  return (data ?? []) as ProductImage[];
}

export async function deleteProductImage(id: string) {
  const { error } = await table("product_images").delete().eq("id", id);
  if (error) logAndThrow("Delete product image", error);
}

export async function saveProductFaq(input: Omit<ProductFaq, "id" | "created_at">, id?: string) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "product_id",
      "question",
      "answer",
      "sort_order",
    ]),
    sort_order: Number(input.sort_order ?? 0),
  };
  const query = id
    ? table("product_faqs").update(payload).eq("id", id).select().single()
    : table("product_faqs").insert(payload).select().single();
  const { data, error } = await query;
  if (error) logAndThrow("Save product FAQ", error);
  return data as ProductFaq;
}

export async function deleteProductFaq(id: string) {
  const { error } = await table("product_faqs").delete().eq("id", id);
  if (error) logAndThrow("Delete product FAQ", error);
}

export async function listReels() {
  const { data, error } = await table("homepage_reels")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedReels;
    logAndThrow("List homepage reels", error);
  }
  return ((data ?? []) as HomepageReel[]).length ? ((data ?? []) as HomepageReel[]) : seedReels;
}

export async function createReel(input: Omit<HomepageReel, "id" | "created_at">) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "title",
      "video_url",
      "thumbnail_url",
      "active",
      "sort_order",
    ]),
    active: Boolean(input.active),
    sort_order: Number(input.sort_order ?? 0),
  };
  const { data, error } = await table("homepage_reels").insert(payload).select().single();
  if (error) logAndThrow("Create homepage reel", error);
  return data as HomepageReel;
}

export async function updateReel(id: string, input: Partial<HomepageReel>) {
  const payload = pickDefined(input as Record<string, unknown>, [
    "title",
    "video_url",
    "thumbnail_url",
    "active",
    "sort_order",
  ]);
  const { error } = await table("homepage_reels").update(payload).eq("id", id);
  if (error) logAndThrow("Update homepage reel", error);
}

export async function deleteReel(id: string) {
  const { error } = await table("homepage_reels").delete().eq("id", id);
  if (error) logAndThrow("Delete homepage reel", error);
}

export async function listBanners() {
  const { data, error } = await table("homepage_banners")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedBanners;
    logAndThrow("List banners", error);
  }
  return ((data ?? []) as Banner[]).length ? ((data ?? []) as Banner[]) : seedBanners;
}

export async function saveBanner(input: Omit<Banner, "id" | "created_at">, id?: string) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "title",
      "desktop_image_url",
      "mobile_image_url",
      "link_url",
      "active",
      "sort_order",
    ]),
    active: Boolean(input.active),
    sort_order: Number(input.sort_order ?? 0),
  };
  return saveRow<Banner>("homepage_banners", payload, id);
}

export async function deleteBanner(id: string) {
  const { error } = await table("homepage_banners").delete().eq("id", id);
  if (error) logAndThrow("Delete banner", error);
}

export async function listOrders(search = "", status = "all") {
  let query = table("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,id.ilike.%${search}%`,
    );
  }
  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    if (shouldReturnEmpty(error)) return [];
    logAndThrow("List orders", error);
  }
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await table("orders").update({ status }).eq("id", id);
  if (error) logAndThrow("Update order status", error);
}

export async function deleteOrder(id: string) {
  const { error } = await table("orders").delete().eq("id", id);
  if (error) logAndThrow("Delete order", error);
}

export async function listAdminUsers() {
  const { data, error } = await table("admin_users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    if (shouldReturnEmpty(error)) {
      const profile = await getCurrentAdminProfile();
      return profile ? [profile] : [];
    }
    logAndThrow("List admin users", error);
  }
  return (data ?? []) as AdminUser[];
}

export async function createAdminUser(input: Pick<AdminUser, "email" | "role" | "name">) {
  const { data, error } = await table("admin_users")
    .insert({ ...input, email: normalizeAuthEmail(input.email) })
    .select()
    .single();
  if (error) logAndThrow("Create admin user", error);
  return data as AdminUser;
}

export async function updateAdminRole(id: string, role: AdminUser["role"]) {
  const { error } = await table("admin_users").update({ role }).eq("id", id);
  if (error) logAndThrow("Update admin role", error);
}

export async function deleteAdminUser(id: string) {
  const { error } = await table("admin_users").delete().eq("id", id);
  if (error) logAndThrow("Delete admin user", error);
}

export async function listCoupons(search = "", status = "all") {
  let query = table("coupons").select("*").order("created_at", { ascending: false });

  if (search) query = query.ilike("code", `%${search}%`);
  if (status === "active") query = query.eq("active", true);
  if (status === "inactive") query = query.eq("active", false);

  const { data, error } = await query;
  if (error) {
    if (shouldReturnEmpty(error)) return [];
    logAndThrow("List coupons", error);
  }
  return (data ?? []) as Coupon[];
}

export async function saveCoupon(input: Omit<Coupon, "id" | "created_at">, id?: string) {
  const payload = {
    ...pickDefined(input as Record<string, unknown>, [
      "code",
      "discount_type",
      "discount_value",
      "minimum_order",
      "expires_at",
      "active",
    ]),
    code: input.code.trim().toUpperCase(),
    discount_value: Number(input.discount_value || 0),
    minimum_order: input.minimum_order ? Number(input.minimum_order) : 0,
    active: Boolean(input.active),
    expires_at: input.expires_at || null,
  };
  return saveRow<Coupon>("coupons", payload, id);
}

export async function updateCoupon(id: string, input: Partial<Coupon>) {
  const payload = pickDefined(input as Record<string, unknown>, [
    "code",
    "discount_type",
    "discount_value",
    "minimum_order",
    "expires_at",
    "active",
  ]);
  const { error } = await table("coupons").update(payload).eq("id", id);
  if (error) logAndThrow("Update coupon", error);
}

export async function deleteCoupon(id: string) {
  const { error } = await table("coupons").delete().eq("id", id);
  if (error) logAndThrow("Delete coupon", error);
}

export async function getSystemHealth(admin: AdminUser | null): Promise<SystemHealth> {
  const { data: sessionData } = await supabase.auth.getSession();
  const databaseCheck = await table("products").select("id", { count: "exact", head: true });
  const bucketNames = [
    "homepage",
    "reels",
    "banners",
    "products",
    "categories",
    "collections",
  ] as const;
  const buckets = bucketNames.map((name) => ({
    name,
    ready: true,
    publicUrl: supabase.storage.from(name).getPublicUrl(".keep").data.publicUrl,
  }));

  return {
    authenticated: Boolean(sessionData.session),
    adminEmail: admin?.email ?? sessionData.session?.user.email ?? "Unknown",
    adminRole: String(admin?.role ?? "admin"),
    supabaseConfigured: !getSupabaseConfigError(),
    databaseReachable: !databaseCheck.error,
    realtimeTables: [...realtimeTables],
    buckets,
    storageReadyCount: buckets.length,
    checkedAt: new Date().toISOString(),
  };
}

export async function uploadFile(
  bucket: "products" | "reels" | "banners" | "homepage" | "categories" | "collections",
  file: File,
  folder = "cms",
  onProgress?: (progress: number) => void,
) {
  onProgress?.(12);
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const uploadFile = file.type.startsWith("image/") ? await compressImage(file) : file;
  onProgress?.(45);

  const { error } = await supabase.storage.from(bucket).upload(path, uploadFile, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) logAndThrow(`Upload ${bucket} asset`, error);
  onProgress?.(85);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  onProgress?.(100);
  return data.publicUrl;
}

export async function compressImage(file: File, maxSize = 1800, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 350_000) return file;

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);

  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
}
