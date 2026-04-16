"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/Lib/Api";
import { cn, formatCurrency } from "@/Lib/Utils";
import { TopBar } from "@/Components/Layout/TopBar";
import { Button } from "@/Components/Ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Ui/Card";
import { Input } from "@/Components/Ui/Input";

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data) {
    return data.items ?? [];
  }
  return [];
}

const rfqSchema = z.object({
  title: z.string().min(1, "Title is required"),
  customerId: z.string().min(1, "Customer is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  productId: z.string().min(1, "Product is required"),
  requiredBy: z.string().min(1, "Required by date is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  specifications: z.string().optional(),
  notes: z.string().optional(),
});

export default function NewRfqPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      title: "",
      customerId: "",
      supplierId: "",
      productId: "",
      requiredBy: "",
      quantity: 1,
      specifications: "",
      notes: "",
    },
  });

  const productId = watch("productId");
  const selectedProduct = products.find((p) => p.id === productId);
  const listPrice = selectedProduct?.unitPrice ?? selectedProduct?.price;

  useEffect(() => {
    void (async () => {
      setLoadingRefs(true);
      try {
        const [custRes, supRes, prodRes] = await Promise.all([
          api.get("/api/customers"),
          api.get("/api/suppliers"),
          api.get("/api/products", { params: { pageSize: 500 } }),
        ]);
        setCustomers(unwrapList(custRes.data));
        setSuppliers(unwrapList(supRes.data));
        setProducts(unwrapList(prodRes.data));
      } catch {
        setCustomers([]);
        setSuppliers([]);
        setProducts([]);
      } finally {
        setLoadingRefs(false);
      }
    })();
  }, []);

  const onSubmit = async (values) => {
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/rfq", {
        title: values.title,
        customerId: values.customerId,
        supplierId: values.supplierId,
        productId: values.productId,
        requiredBy: values.requiredBy,
        quantity: values.quantity,
        specifications: values.specifications || undefined,
        notes: values.notes || undefined,
      });
      router.push("/rfq");
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Failed to create RFQ.");
    } finally {
      setSubmitting(false);
    }
  };

  const productLabel = (p) =>
    p.styleNo || p.name || p.styleDescription || p.id;

  return (
    <div className="min-h-full bg-slate-50">
      <TopBar title="New RFQ" />
      <div className="p-6 max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-slate-600">
          <Link href="/rfq">
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>
        </Button>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
        )}

        {loadingRefs ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">RFQ details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <Input placeholder="Q2 fabric sourcing" {...register("title")} />
                  {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Customer</label>
                  <select
                    className={cn(
                      "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-xs",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    )}
                    {...register("customerId")}
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name ?? c.id}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="text-xs text-red-600">{errors.customerId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Supplier</label>
                  <select
                    className={cn(
                      "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-xs",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    )}
                    {...register("supplierId")}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name ?? s.id}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p className="text-xs text-red-600">{errors.supplierId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Product</label>
                  <select
                    className={cn(
                      "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-xs",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    )}
                    {...register("productId")}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {productLabel(p)}
                      </option>
                    ))}
                  </select>
                  {errors.productId && (
                    <p className="text-xs text-red-600">{errors.productId.message}</p>
                  )}
                  {listPrice != null && (
                    <p className="text-xs text-slate-500">List price {formatCurrency(listPrice)}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Required by</label>
                    <Input type="date" {...register("requiredBy")} />
                    {errors.requiredBy && (
                      <p className="text-xs text-red-600">{errors.requiredBy.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Quantity</label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      {...register("quantity", { valueAsNumber: true })}
                    />
                    {errors.quantity && (
                      <p className="text-xs text-red-600">{errors.quantity.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Specifications</label>
                  <textarea
                    className={cn(
                      "flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs",
                      "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    )}
                    placeholder="Materials, colors, sizes…"
                    {...register("specifications")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Notes</label>
                  <textarea
                    className={cn(
                      "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs",
                      "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    )}
                    placeholder="Internal notes"
                    {...register("notes")}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/rfq">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Create RFQ"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
