export type AdminRole = "super_admin" | "admin" | "editor" | string;

export type ProductStatus = "draft" | "active" | "archived" | string;

export interface AdminUser {
  id: string;
  user_id?: string | null;
  email: string;
  name?: string | null;
  role: AdminRole;
  created_at?: string | null;
  updated_at?: string | null;
}

export type CouponDiscountType = "percentage" | "fixed" | string;

export interface Coupon {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  minimum_order?: number | null;
  expires_at?: string | null;
  active?: boolean | null;
  created_at?: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_price?: number | null;
  description?: string | null;
  category?: string | null;
  collection?: string | null;
  material?: string | null;
  stock?: number | null;
  featured?: boolean | null;
  status?: ProductStatus | null;
  created_at?: string | null;
  updated_at?: string | null;
  product_images?: ProductImage[];
  product_faqs?: ProductFaq[];
}

export type ProductInput = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "product_images" | "product_faqs"
>;

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
}

export interface ProductFaq {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  sort_order?: number | null;
  created_at?: string | null;
}

export interface HomepageReel {
  id: string;
  title?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
}

export interface Banner {
  id: string;
  title?: string | null;
  desktop_image_url?: string | null;
  mobile_image_url?: string | null;
  link_url?: string | null;
  active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  featured?: boolean | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  cover_image?: string | null;
  featured?: boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HomepageContent {
  id: string;
  hero_title: string;
  hero_subtitle?: string | null;
  hero_image?: string | null;
  hero_badge?: string | null;
  hero_featured_note?: string | null;
  cta_primary?: string | null;
  cta_primary_link?: string | null;
  cta_secondary?: string | null;
  cta_secondary_link?: string | null;
  testimonial_text?: string | null;
  active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FeaturedSection {
  id: string;
  section_key: string;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  product_ids?: string[] | null;
  active?: boolean | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Testimonial {
  id: string;
  name: string;
  city?: string | null;
  text: string;
  rating?: number | null;
  active?: boolean | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HomepagePromise {
  id: string;
  icon?: string | null;
  title: string;
  description?: string | null;
  active?: boolean | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NewsletterSection {
  id: string;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  placeholder?: string | null;
  button_label?: string | null;
  active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | string;
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | string;

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_title?: string | null;
  quantity: number;
  price: number;
  created_at?: string | null;
}

export interface Order {
  id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address?: Record<string, unknown> | string | null;
  total_amount?: number | null;
  status?: OrderStatus | null;
  payment_status?: PaymentStatus | null;
  created_at?: string | null;
  order_items?: OrderItem[];
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalCollections: number;
  totalOrders: number;
  totalRevenue: number;
  totalReels: number;
  totalBanners: number;
  activeReels: number;
  activeBanners: number;
  featuredProducts: number;
  lowStock: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalAdminUsers: number;
  newestProducts: string[];
}

export interface SystemHealth {
  authenticated: boolean;
  adminEmail: string;
  adminRole: string;
  supabaseConfigured: boolean;
  databaseReachable: boolean;
  realtimeTables: string[];
  buckets: Array<{ name: string; ready: boolean; publicUrl: string }>;
  storageReadyCount: number;
  checkedAt: string;
}

export interface ChartPoint {
  name: string;
  revenue?: number;
  orders?: number;
  products?: number;
}
