import type React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Filter, Grid2X2, List, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { DataTable, type AdminColumn } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { ProductCard } from "@/components/admin/ProductCard";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import {
  addProductImages,
  deleteProduct,
  deleteProductFaq,
  deleteProductImage,
  listProducts,
  saveProduct,
  saveProductFaq,
  toggleProductFeatured,
} from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Product, ProductFaq, ProductInput } from "@/types/admin";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products CMS - Prihika Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProductsPage,
});

const blankProduct: ProductInput = {
  title: "",
  slug: "",
  price: 0,
  compare_price: null,
  description: "",
  category: "",
  collection: "",
  material: "",
  stock: 0,
  featured: false,
  status: "draft",
};

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listProducts(search, page, 12, category, sort);
      setProducts(result.products);
      setCount(result.count);
    } catch (loadError) {
      setProducts([]);
      setCount(0);
      setError(loadError instanceof Error ? loadError.message : "Products could not load.");
    } finally {
      setLoading(false);
    }
  }, [search, page, category, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("products", () => void load());
  useRealtimeRefresh("product_images", () => void load());
  useRealtimeRefresh("product_faqs", () => void load());

  const categories = useMemo(() => {
    const values = new Set(products.map((product) => product.category).filter(Boolean) as string[]);
    return ["all", ...Array.from(values)];
  }, [products]);

  const columns: AdminColumn<Product>[] = [
    {
      header: "Product",
      cell: (product) => (
        <div>
          <p className="font-medium text-white">{product.title}</p>
          <p className="text-xs text-[#f6ead0]/45">{product.slug}</p>
        </div>
      ),
    },
    { header: "Category", cell: (product) => product.category ?? "Uncategorised" },
    {
      header: "Price",
      cell: (product) => `Rs. ${Number(product.price ?? 0).toLocaleString("en-IN")}`,
    },
    {
      header: "Stock",
      cell: (product) => (
        <span className={Number(product.stock ?? 0) <= 3 ? "text-red-300" : ""}>
          {product.stock ?? 0}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (product) => <StatusPill value={product.status ?? "draft"} />,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (product) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => void toggleFeatured(product)}
            className="rounded-md p-2 text-[#f6ead0]/60 hover:bg-white/10 hover:text-[#f4d58d]"
          >
            <Star className={`h-4 w-4 ${product.featured ? "fill-current text-[#f4d58d]" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => openEdit(product)}
            className="rounded-md p-2 text-[#f6ead0]/60 hover:bg-white/10 hover:text-white"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(product)}
            className="rounded-md p-2 text-red-300/70 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const toggleFeatured = async (product: Product) => {
    setProducts((items) =>
      items.map((item) =>
        item.id === product.id ? { ...item, featured: !product.featured } : item,
      ),
    );
    await toggleProductFeatured(product.id, !product.featured);
    toast.success(product.featured ? "Removed from featured." : "Marked as featured.");
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteProduct(deleteTarget.id);
    toast.success("Product deleted.");
    setDeleteTarget(null);
    await load();
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Create, edit, feature, filter, and enrich jewellery products with images and FAQs."
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f6ead0]/35" />
              <input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search by title, slug, or category"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35 focus:border-[#d7b46a]/50"
              />
            </label>
            <label className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f6ead0]/35" />
              <select
                value={category}
                onChange={(event) => {
                  setPage(1);
                  setCategory(event.target.value);
                }}
                className="h-11 rounded-lg border border-white/10 bg-black/20 pl-9 pr-8 text-sm text-white outline-none focus:border-[#d7b46a]/50"
              >
                {categories.map((item) => (
                  <option key={item} value={item} className="bg-[#100d0a]">
                    {item === "all" ? "All categories" : item}
                  </option>
                ))}
              </select>
            </label>
            <select
              value={sort}
              onChange={(event) => {
                setPage(1);
                setSort(event.target.value);
              }}
              className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d7b46a]/50"
            >
              <option value="newest" className="bg-[#100d0a]">
                Newest first
              </option>
              <option value="price_asc" className="bg-[#100d0a]">
                Price low to high
              </option>
              <option value="price_desc" className="bg-[#100d0a]">
                Price high to low
              </option>
              <option value="stock_asc" className="bg-[#100d0a]">
                Low stock first
              </option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-lg p-3 ${view === "grid" ? "bg-[#d7b46a] text-black" : "bg-white/[0.05] text-[#f6ead0]/65 hover:bg-white/10"}`}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={`rounded-lg p-3 ${view === "table" ? "bg-[#d7b46a] text-black" : "bg-white/[0.05] text-[#f6ead0]/65 hover:bg-white/10"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <AdminCardSkeleton count={8} />
        ) : view === "grid" ? (
          products.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products found"
              description="Adjust the search, change filters, or add a new product."
            />
          )
        ) : (
          <DataTable
            data={products}
            columns={columns}
            emptyTitle="No products found"
            emptyDescription="Adjust the search or add a new product."
          />
        )}

        <div className="flex flex-col items-center justify-between gap-3 text-sm text-[#f6ead0]/55 sm:flex-row">
          <span>
            Showing page {page} of {Math.max(1, Math.ceil(count / 12))}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-white/10 px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= Math.ceil(count / 12)}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-white/10 px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ProductFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        onSaved={load}
      />
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete product?"
        description="This removes the product record from Supabase. Product images stored separately should be reviewed if you want to remove files from storage too."
        onConfirm={() => void confirmDelete()}
      />
    </AdminLayout>
  );
}

function ProductFormModal({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProductInput>(blankProduct);
  const [saving, setSaving] = useState(false);
  const [faqDraft, setFaqDraft] = useState({ question: "", answer: "" });
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingFaqs, setPendingFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  useEffect(() => {
    setForm(
      product
        ? {
            title: product.title,
            slug: product.slug,
            price: product.price,
            compare_price: product.compare_price ?? null,
            description: product.description ?? "",
            category: product.category ?? "",
            collection: product.collection ?? "",
            material: product.material ?? "",
            stock: product.stock ?? 0,
            featured: Boolean(product.featured),
            status: product.status ?? "draft",
          }
        : blankProduct,
    );
    setFaqDraft({ question: "", answer: "" });
    setPendingImages([]);
    setPendingFaqs([]);
  }, [product, open]);

  const setField = (key: keyof ProductInput, value: string | number | boolean | null) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await saveProduct(form, product?.id);
      if (pendingImages.length) {
        await addProductImages(
          pendingImages.map((url, index) => ({
            product_id: saved.id,
            image_url: url,
            sort_order: (product?.product_images?.length ?? 0) + index,
          })),
        );
      }
      if (pendingFaqs.length) {
        await Promise.all(
          pendingFaqs.map((faq, index) =>
            saveProductFaq({
              product_id: saved.id,
              question: faq.question,
              answer: faq.answer,
              sort_order: (product?.product_faqs?.length ?? 0) + index,
            }),
          ),
        );
      }
      toast.success(product ? "Product updated." : "Product created.");
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const addImages = async (urls: string[]) => {
    if (!product) {
      setPendingImages((items) => [...items, ...urls]);
      toast.success("Images staged. They will be attached when the product is saved.");
      return;
    }
    await addProductImages(
      urls.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        sort_order: (product.product_images?.length ?? 0) + index,
      })),
    );
    toast.success("Product images saved.");
    await onSaved();
  };

  const addFaq = async () => {
    if (!faqDraft.question || !faqDraft.answer) return;
    if (!product) {
      setPendingFaqs((items) => [...items, faqDraft]);
      setFaqDraft({ question: "", answer: "" });
      toast.success("FAQ staged. It will be attached when the product is saved.");
      return;
    }
    await saveProductFaq({
      product_id: product.id,
      question: faqDraft.question,
      answer: faqDraft.answer,
      sort_order: product.product_faqs?.length ?? 0,
    });
    setFaqDraft({ question: "", answer: "" });
    toast.success("FAQ added.");
    await onSaved();
  };

  const removeFaq = async (faq: ProductFaq) => {
    await deleteProductFaq(faq.id);
    toast.success("FAQ deleted.");
    await onSaved();
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={product ? "Edit Product" : "Add Product"}
      description="Manage catalogue fields, image assets, and product FAQs."
      wide
    >
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Title"
            value={form.title}
            onChange={(value) => setField("title", value)}
            required
          />
          <Field
            label="Slug"
            value={form.slug}
            onChange={(value) => setField("slug", value)}
            required
          />
          <Field
            label="Price"
            type="number"
            value={String(form.price)}
            onChange={(value) => setField("price", Number(value))}
            required
          />
          <Field
            label="Compare Price"
            type="number"
            value={String(form.compare_price ?? "")}
            onChange={(value) => setField("compare_price", value ? Number(value) : null)}
          />
          <Field
            label="Category"
            value={form.category ?? ""}
            onChange={(value) => setField("category", value)}
          />
          <Field
            label="Collection"
            value={form.collection ?? ""}
            onChange={(value) => setField("collection", value)}
          />
          <Field
            label="Material"
            value={form.material ?? ""}
            onChange={(value) => setField("material", value)}
          />
          <Field
            label="Stock"
            type="number"
            value={String(form.stock ?? 0)}
            onChange={(value) => setField("stock", Number(value))}
          />
          <label>
            <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">Status</span>
            <select
              value={form.status ?? "draft"}
              onChange={(event) => setField("status", event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
            >
              {["draft", "active", "archived"].map((status) => (
                <option key={status} value={status} className="bg-[#100d0a]">
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">Description</span>
          <textarea
            value={form.description ?? ""}
            onChange={(event) => setField("description", event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none"
          />
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(event) => setField("featured", event.target.checked)}
          />
          <span className="text-sm text-[#f6ead0]/75">
            Feature this product on curated admin and storefront views
          </span>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#d7b46a] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="font-display text-xl text-white">Product Images</h3>
          <div className="mt-3">
            <UploadDropzone
              bucket="products"
              folder={product ? `products/${product.id}` : "products/new"}
              onUploaded={(urls) => void addImages(urls)}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {pendingImages.map((url) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-[#d7b46a]/20"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-[#f4d58d]">
                  Staged
                </span>
              </div>
            ))}
            {product?.product_images
              ?.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
              .map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-white/10"
                >
                  <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => void deleteProductImage(image.id).then(onSaved)}
                    className="absolute right-2 top-2 rounded-md bg-black/70 p-2 text-red-200 opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </section>

        <section>
          <h3 className="font-display text-xl text-white">Product FAQs</h3>
          <div className="mt-3 space-y-3">
            <Field
              label="Question"
              value={faqDraft.question}
              onChange={(value) => setFaqDraft((current) => ({ ...current, question: value }))}
            />
            <textarea
              placeholder="Answer"
              value={faqDraft.answer}
              onChange={(event) =>
                setFaqDraft((current) => ({ ...current, answer: event.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35"
            />
            <button
              type="button"
              onClick={() => void addFaq()}
              className="rounded-lg border border-[#d7b46a]/30 px-4 py-2 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10"
            >
              Add FAQ
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {pendingFaqs.map((faq, index) => (
              <div
                key={`${faq.question}-${index}`}
                className="rounded-lg border border-[#d7b46a]/20 bg-[#d7b46a]/10 p-3"
              >
                <p className="font-medium text-white">{faq.question}</p>
                <p className="mt-1 text-sm text-[#f6ead0]/55">{faq.answer}</p>
              </div>
            ))}
            {product?.product_faqs?.map((faq) => (
              <div key={faq.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{faq.question}</p>
                    <p className="mt-1 text-sm text-[#f6ead0]/55">{faq.answer}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeFaq(faq)}
                    className="text-red-300/75 hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required={required}
        className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-[#d7b46a]/50"
      />
    </label>
  );
}

function StatusPill({ value }: { value: string }) {
  const tone =
    value === "active"
      ? "border-emerald-300/30 text-emerald-200"
      : value === "archived"
        ? "border-red-300/30 text-red-200"
        : "border-[#d7b46a]/30 text-[#f4d58d]";
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${tone}`}>{value}</span>;
}
