"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Trash2, GripVertical } from "lucide-react";
import Swal from "sweetalert2";
import { useAuthStore } from "@/store/AuthStore";
import { api } from "@/Lib/Api";
import MarketplaceNav from "@/components/marketplace/MarketplaceNav";

const DATA_FIELD_OPTIONS = [
  { label: "Style No", column: "ProductStyleNo" },
  { label: "Style ID", column: "ProductStyleID" },
  { label: "Style Description", column: "ProductStyleDescription" },
  { label: "Short Description", column: "ProductShortDescription" },
  { label: "Brand", column: "BrandID" },
  { label: "Customer", column: "CustomerID" },
  { label: "Retailer", column: "RetailerID" },
  { label: "Category", column: "CategoryID" },
  { label: "Sub Category", column: "SubCategoryID" },
  { label: "Sample Type", column: "SampleTypeID" },
  { label: "Supplier", column: "SupplierID" },
  { label: "Merchandiser", column: "MerchandiserID" },
  { label: "Fabric Code", column: "FabricCodeID" },
  { label: "Main Fabrication", column: "MainFabrication" },
  { label: "Fabric Weight", column: "FabricWeight" },
  { label: "Fabric Composition", column: "FabricComposition" },
  { label: "Main Fabric Color", column: "MainFabricColor" },
  { label: "Trim Composition", column: "TrimComposition" },
  { label: "Contrast Trim Fabrication", column: "ContrastTrimFabrication" },
  { label: "Contrast Trim Color", column: "ContrastTrimColor" },
  { label: "Wash", column: "WashID" },
  { label: "Treatments & Finishing", column: "TreatmentsFinishing" },
  { label: "Sustainability Certification", column: "SustainabilityCertificationID" },
  { label: "Laundry Details", column: "LaundryDetails" },
  { label: "Shipment Date", column: "ShipmentDate" },
  { label: "Order Quantity", column: "OrderQuantity" },
  { label: "Unit Price", column: "UnitPrice" },
  { label: "3D Link", column: "Link3D" },
];

function CartProductCard({ item, index, onRemove, onDragStart, onDragOver, onDrop, isDragOver }) {
  const p = item.product;
  const imgUrl = p?.primaryImageFile
    ? `/img/products/${p.companyID}/${p.primaryImageFile}`
    : null;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group relative bg-white rounded-lg overflow-hidden border transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragOver
          ? "border-indigo-400 shadow-md shadow-indigo-100 scale-[1.02]"
          : "border-slate-100 hover:border-slate-200 hover:shadow-md"
      }`}
    >
      {/* Delete button — always visible on mobile */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.productID); }}
        className="absolute top-1.5 right-1.5 z-10 p-1 sm:p-1.5 rounded-md bg-white/90 text-slate-400 hover:text-red-500 hover:bg-red-50 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
      >
        <Trash2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
      </button>

      {/* Drag handle — desktop only */}
      <div className="absolute top-1.5 left-1.5 z-10 p-1 rounded-md bg-white/90 text-slate-300 opacity-0 group-hover:opacity-100 transition-all hidden sm:block">
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* Image */}
      <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
        {imgUrl && !imgError ? (
          <Image
            src={imgUrl}
            alt={p?.productStyleNo || "Product"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            onError={() => setImgError(true)}
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <svg className="h-8 sm:h-10 w-8 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 sm:px-3 pt-2 pb-2 sm:pb-3">
        <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 truncate">{p?.productStyleNo || "—"}</p>
        {p?.productStyleDescription && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">{p.productStyleDescription}</p>
        )}
        <div className="flex items-center justify-between mt-1.5 sm:mt-2">
          {p?.unitPrice != null ? (
            <span className="text-[12px] sm:text-sm font-bold text-slate-900">${p.unitPrice.toFixed(2)}</span>
          ) : <span />}
          {p?.brand && (
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold tracking-wider uppercase truncate ml-1">{p.brand.brandName}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogCartPage() {
  const { isAuthenticated } = useAuthStore();

  const [cartItems, setCartItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const [catalogName, setCatalogName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [correspondentEmail, setCorrespondentEmail] = useState("");
  const [internalTeam, setInternalTeam] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [customerComments, setCustomerComments] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [internalEmail, setInternalEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (dragIndex === null || dragIndex === dropIndex) return;
    setCartItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  }, [dragIndex]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([
      api.get("/api/marketplace/cart/items"),
      api.get("/api/marketplace/filters"),
    ])
      .then(([cartRes, filtersRes]) => {
        setCartItems(cartRes.data || []);
        setCartCount(cartRes.data?.length || 0);
        setCustomers(filtersRes.data?.customers || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      const { data } = await api.delete(`/api/marketplace/cart/${productId}`);
      setCartItems((prev) => prev.filter((item) => item.productID !== productId));
      setCartCount(data.count);
    } catch {}
  };

  const toggleField = (column) => {
    setSelectedFields((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleCreateCatalog = async () => {
    if (!catalogName.trim()) return;
    setCreating(true);
    try {
      const productIdList = cartItems.map((item) => item.productID).join(",");
      const { data } = await api.post("/api/marketplace/catalog/create", {
        catalogName: catalogName.trim(),
        customerID: customerId ? parseInt(customerId) : null,
        correspondentEmail: correspondentEmail.trim() || null,
        internalTeam: internalTeam.trim() || null,
        internalEmail: internalEmail.trim() || null,
        videoLink: videoLink.trim() || null,
        catalogProperties: selectedFields.join(","),
        productIDs: productIdList,
        customerComments: customerComments.trim() || null,
      });
      setCartItems([]);
      setCartCount(0);
      setCatalogName("");
      setCustomerId("");
      setCorrespondentEmail("");
      setInternalTeam("");
      setSelectedFields([]);
      setCustomerComments("");
      setVideoLink("");
      setInternalEmail("");
      await Swal.fire({
        icon: "success",
        title: "Catalog Created!",
        html: `<strong>${data.catalogName}</strong> has been created successfully.`,
        confirmButtonText: "View My Catalogs",
        confirmButtonColor: "#4f46e5",
      });
      window.location.href = "/my-catalogs";
    } catch {
      Swal.fire({ icon: "error", title: "Oops!", text: "Failed to create catalog. Please try again.", confirmButtonColor: "#4f46e5" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <MarketplaceNav cartCount={cartCount} />

      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 py-4 sm:py-6">
        {/* Form Section */}
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Customer */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="">select</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.customerName}</option>
                ))}
              </select>
            </div>

            {/* Catalog Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Catalog Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
                placeholder="Fashion 2024"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Correspondent Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Correspondent Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={correspondentEmail}
                onChange={(e) => setCorrespondentEmail(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Internal Team */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Internal Team <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={internalTeam}
                onChange={(e) => setInternalTeam(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Data Fields */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Select Data field that you want to show your customer in this Catalog <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => document.getElementById("field-dropdown")?.classList.toggle("hidden")}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-left text-slate-500 focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  {selectedFields.length === 0
                    ? "Nothing selected"
                    : DATA_FIELD_OPTIONS.filter((f) => selectedFields.includes(f.column)).map((f) => f.label).join(", ")}
                </button>
                <div id="field-dropdown" className="hidden absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1">
                  {DATA_FIELD_OPTIONS.map((f) => (
                    <button
                      key={f.column}
                      onClick={() => toggleField(f.column)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 cursor-pointer ${
                        selectedFields.includes(f.column) ? "text-slate-900 font-medium" : "text-slate-600"
                      }`}
                    >
                      <span className={`h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                        selectedFields.includes(f.column) ? "bg-slate-900 border-slate-900" : "border-slate-300"
                      }`}>
                        {selectedFields.includes(f.column) && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </span>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Comments */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                When customer like, comments... <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerComments}
                onChange={(e) => setCustomerComments(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Video Link */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Optional: You can add reference video link or ebook etc.
              </label>
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Internal Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Optional: Email of Internal...
              </label>
              <input
                type="email"
                value={internalEmail}
                onChange={(e) => setInternalEmail(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Create Button */}
            <div className="flex items-end">
              <button
                onClick={handleCreateCatalog}
                disabled={creating || !catalogName.trim() || cartItems.length === 0}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {creating ? "Creating..." : "Create Catalog"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-xs text-slate-400">Drag cards to reorder</span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-slate-100 rounded-lg" />
                <div className="mt-2 h-3 bg-slate-100 rounded w-3/4" />
                <div className="mt-1 h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <GripVertical className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No products in your catalog cart</h3>
            <p className="text-sm text-slate-500 mt-1">Go to the Marketplace and add products to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {cartItems.map((item, index) => (
              <CartProductCard
                key={item.id}
                item={item}
                index={index}
                onRemove={handleRemove}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragOver={dragOverIndex === index}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
