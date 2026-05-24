import { getSupabaseConfigError, normalizeAuthEmail, supabase } from "@/lib/supabase";
import {
  seedBanners,
  seedCategories,
  seedCollections,
  seedFeaturedSections,
  seedHomepageContent,
  seedProducts,
  seedReels,
  seededDashboardStats,
  seedTestimonials,
} from "@/lib/seed-data";
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
  | "featured_sections"
  | "testimonials"
  | "orders"
  | "order_items"
  | "homepage_reels"
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
  "featured_sections",
  "testimonials",
  "banners",
  "homepage_reels",
  "orders",
  "admin_users",
  "coupons",
] as const;

interface AuthProfileUser {
  id: string;
  email?: string | null;
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

function createFallbackAdminProfile(user: AuthProfileUser, email: string): AdminUser {
  return {
    id: user.id,
    email,
    name: email.split("@")[0] || "Admin",
    role: "super_admin",
  };
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

function withSeed<T>(items: T[], seed: T[]) {
  return items.length ? items : seed;
}

function mergeByKey<T>(items: T[], seed: T[], keyFor: (item: T) => string | null | undefined) {
  const merged = new Map(seed.map((item) => [keyFor(item), item]).filter(([key]) => Boolean(key)));
  for (const item of items) {
    const key = keyFor(item);
    if (key) merged.set(key, item);
  }
  return [...merged.values(), ...items.filter((item) => !keyFor(item))];
}

function mergeProducts(items: Product[]) {
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

async function saveRow<T>(
  tableName: TableName,
  payload: Record<string, unknown>,
  id?: string,
): Promise<T> {
  if (id) {
    const updated = await table(tableName).update(payload).eq("id", id).select().maybeSingle();
    if (updated.error && !isNoRows(updated.error)) throw updated.error;
    if (updated.data) return updated.data as T;

    const inserted = await table(tableName)
      .insert({ id, ...payload })
      .select()
      .single();
    if (inserted.error) throw inserted.error;
    return inserted.data as T;
  }

  const inserted = await table(tableName).insert(payload).select().single();
  if (inserted.error) throw inserted.error;
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
    if (isPermissionDenied(error)) {
      return createFallbackAdminProfile(user, email);
    }
    throw error;
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
    table("banners").select("id", { count: "exact", head: true }),
    table("banners").select("id", { count: "exact", head: true }).eq("active", true),
    table("categories").select("id", { count: "exact", head: true }),
    table("collections").select("id", { count: "exact", head: true }),
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
    if (result.error && !shouldReturnEmpty(result.error)) throw result.error;
  }

  const totalRevenue =
    orders.data?.reduce(
      (sum, order) => sum + Number((order as { total_amount?: number }).total_amount ?? 0),
      0,
    ) ?? 0;

  return {
    totalProducts: products.count || seededDashboardStats.totalProducts,
    totalCategories: categories.count || seededDashboardStats.totalCategories,
    totalCollections: collections.count || seededDashboardStats.totalCollections,
    totalOrders: orders.count ?? orders.data?.length ?? 0,
    totalRevenue,
    totalReels: reels.count || seededDashboardStats.totalReels,
    totalBanners: banners.count || seededDashboardStats.totalBanners,
    activeReels: activeReels.count || seededDashboardStats.activeReels,
    activeBanners: activeBanners.count || seededDashboardStats.activeBanners,
    featuredProducts: featuredProducts.count || seededDashboardStats.featuredProducts,
    lowStock: lowStock.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    deliveredOrders: deliveredOrders.count ?? 0,
    totalAdminUsers: admins.error ? 1 : (admins.count ?? 0),
    newestProducts: withSeed(
      (newestProducts.data ?? []) as Pick<Product, "title">[],
      seedProducts.slice(0, 5),
    )
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
    throw error;
  }
  const shouldMergeSeed = page === 1 && !search && category === "all";
  const products = shouldMergeSeed
    ? mergeProducts((data ?? []) as Product[])
    : withSeed((data ?? []) as Product[], seedProducts);
  return { products, count: Math.max(count ?? 0, products.length) };
}

export async function listAllProducts() {
  const { data, error } = await table("products").select(
    "id,title,category,collection,price,featured,status,stock,created_at",
  );
  if (error) {
    if (shouldReturnEmpty(error)) return seedProducts;
    throw error;
  }
  return mergeProducts((data ?? []) as Product[]);
}

export async function listCategories() {
  const { data, error } = await table("categories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    if (shouldReturnEmpty(error)) return seedCategories;
    throw error;
  }
  return mergeByKey((data ?? []) as Category[], seedCategories, (category) => category.slug);
}

export async function saveCategory(
  input: Omit<Category, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...input,
    featured: Boolean(input.featured),
    display_order: Number(input.display_order ?? 0),
  };
  return saveRow<Category>("categories", payload, id);
}

export async function deleteCategory(id: string) {
  const { error } = await table("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function listCollections() {
  const { data, error } = await table("collections")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    if (shouldReturnEmpty(error)) return seedCollections;
    throw error;
  }
  return mergeByKey((data ?? []) as Collection[], seedCollections, (collection) => collection.slug);
}

export async function saveCollection(
  input: Omit<Collection, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...input,
    featured: Boolean(input.featured),
    display_order: Number(input.display_order ?? 0),
  };
  return saveRow<Collection>("collections", payload, id);
}

export async function deleteCollection(id: string) {
  const { error } = await table("collections").delete().eq("id", id);
  if (error) throw error;
}

export async function getHomepageContent() {
  const { data, error } = await table("homepage_content")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (shouldReturnEmpty(error)) return seedHomepageContent;
    throw error;
  }
  return (data as HomepageContent | null) ?? seedHomepageContent;
}

export async function saveHomepageContent(
  input: Omit<HomepageContent, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = { ...input, active: Boolean(input.active) };
  return saveRow<HomepageContent>("homepage_content", payload, id);
}

export async function listFeaturedSections() {
  const { data, error } = await table("featured_sections")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedFeaturedSections;
    throw error;
  }
  return mergeByKey(
    (data ?? []) as FeaturedSection[],
    seedFeaturedSections,
    (section) => section.section_key,
  );
}

export async function saveFeaturedSection(
  input: Omit<FeaturedSection, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...input,
    active: Boolean(input.active),
    display_order: Number(input.display_order ?? 0),
    product_ids: input.product_ids ?? [],
  };
  return saveRow<FeaturedSection>("featured_sections", payload, id);
}

export async function deleteFeaturedSection(id: string) {
  const { error } = await table("featured_sections").delete().eq("id", id);
  if (error) throw error;
}

export async function listTestimonials() {
  const { data, error } = await table("testimonials")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedTestimonials;
    throw error;
  }
  return mergeByKey(
    (data ?? []) as Testimonial[],
    seedTestimonials,
    (testimonial) => testimonial.id,
  );
}

export async function saveTestimonial(
  input: Omit<Testimonial, "id" | "created_at" | "updated_at">,
  id?: string,
) {
  const payload = {
    ...input,
    rating: Number(input.rating ?? 5),
    active: Boolean(input.active),
    display_order: Number(input.display_order ?? 0),
  };
  return saveRow<Testimonial>("testimonials", payload, id);
}

export async function deleteTestimonial(id: string) {
  const { error } = await table("testimonials").delete().eq("id", id);
  if (error) throw error;
}

export async function saveProduct(input: ProductInput, id?: string) {
  const payload = {
    ...input,
    price: Number(input.price || 0),
    compare_price: input.compare_price ? Number(input.compare_price) : null,
    stock: Number(input.stock || 0),
    featured: Boolean(input.featured),
  };

  return saveRow<Product>("products", payload, id);
}

export async function deleteProduct(id: string) {
  const { error } = await table("products").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  const { error } = await table("products").update({ featured }).eq("id", id);
  if (error) throw error;
}

export async function addProductImages(images: Omit<ProductImage, "id" | "created_at">[]) {
  const { data, error } = await table("product_images").insert(images).select();
  if (error) throw error;
  return (data ?? []) as ProductImage[];
}

export async function deleteProductImage(id: string) {
  const { error } = await table("product_images").delete().eq("id", id);
  if (error) throw error;
}

export async function saveProductFaq(input: Omit<ProductFaq, "id" | "created_at">, id?: string) {
  const query = id
    ? table("product_faqs").update(input).eq("id", id).select().single()
    : table("product_faqs").insert(input).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data as ProductFaq;
}

export async function deleteProductFaq(id: string) {
  const { error } = await table("product_faqs").delete().eq("id", id);
  if (error) throw error;
}

export async function listReels() {
  const { data, error } = await table("homepage_reels")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedReels;
    throw error;
  }
  return mergeByKey((data ?? []) as HomepageReel[], seedReels, (reel) => reel.id);
}

export async function createReel(input: Omit<HomepageReel, "id" | "created_at">) {
  const { data, error } = await table("homepage_reels").insert(input).select().single();
  if (error) throw error;
  return data as HomepageReel;
}

export async function updateReel(id: string, input: Partial<HomepageReel>) {
  const { error } = await table("homepage_reels").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteReel(id: string) {
  const { error } = await table("homepage_reels").delete().eq("id", id);
  if (error) throw error;
}

export async function listBanners() {
  const { data, error } = await table("banners")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    if (shouldReturnEmpty(error)) return seedBanners;
    throw error;
  }
  return mergeByKey((data ?? []) as Banner[], seedBanners, (banner) => banner.id);
}

export async function saveBanner(input: Omit<Banner, "id" | "created_at">, id?: string) {
  return saveRow<Banner>("banners", input as Record<string, unknown>, id);
}

export async function deleteBanner(id: string) {
  const { error } = await table("banners").delete().eq("id", id);
  if (error) throw error;
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
    throw error;
  }
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await table("orders").update({ status }).eq("id", id);
  if (error) throw error;
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
    throw error;
  }
  return (data ?? []) as AdminUser[];
}

export async function createAdminUser(input: Pick<AdminUser, "email" | "role" | "name">) {
  const { data, error } = await table("admin_users")
    .insert({ ...input, email: normalizeAuthEmail(input.email) })
    .select()
    .single();
  if (error) throw error;
  return data as AdminUser;
}

export async function updateAdminRole(id: string, role: AdminUser["role"]) {
  const { error } = await table("admin_users").update({ role }).eq("id", id);
  if (error) throw error;
}

export async function deleteAdminUser(id: string) {
  const { error } = await table("admin_users").delete().eq("id", id);
  if (error) throw error;
}

export async function listCoupons(search = "", status = "all") {
  let query = table("coupons").select("*").order("created_at", { ascending: false });

  if (search) query = query.ilike("code", `%${search}%`);
  if (status === "active") query = query.eq("active", true);
  if (status === "inactive") query = query.eq("active", false);

  const { data, error } = await query;
  if (error) {
    if (shouldReturnEmpty(error)) return [];
    throw error;
  }
  return (data ?? []) as Coupon[];
}

export async function saveCoupon(input: Omit<Coupon, "id" | "created_at">, id?: string) {
  const payload = {
    ...input,
    code: input.code.trim().toUpperCase(),
    discount_value: Number(input.discount_value || 0),
    minimum_order: input.minimum_order ? Number(input.minimum_order) : 0,
    active: Boolean(input.active),
    expires_at: input.expires_at || null,
  };
  const query = id
    ? table("coupons").update(payload).eq("id", id).select().single()
    : table("coupons").insert(payload).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data as Coupon;
}

export async function updateCoupon(id: string, input: Partial<Coupon>) {
  const { error } = await table("coupons").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteCoupon(id: string) {
  const { error } = await table("coupons").delete().eq("id", id);
  if (error) throw error;
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

  if (error) throw error;
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
