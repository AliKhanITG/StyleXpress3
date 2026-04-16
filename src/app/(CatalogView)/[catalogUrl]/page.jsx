"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/Lib/Api";

const FIELD_MAP = {
  ProductStyleNo: "Style No",
  ProductStyleID: "Style ID",
  ProductStyleDescription: "Style Description",
  ProductShortDescription: "Short Description",
  BrandID: "Brand",
  CustomerID: "Customer",
  RetailerID: "Retailer",
  CategoryID: "Category",
  SubCategoryID: "Sub Category",
  SampleTypeID: "Sample Type",
  SupplierID: "Supplier",
  MerchandiserID: "Merchandiser",
  FabricCodeID: "Fabric Code",
  MainFabrication: "Main Fabrication",
  FabricWeight: "Fabric Weight",
  FabricComposition: "Fabric Composition",
  MainFabricColor: "Main Fabric Color",
  TrimComposition: "Trim Composition",
  ContrastTrimFabrication: "Contrast Trim Fabrication",
  ContrastTrimColor: "Contrast Trim Color",
  WashID: "Wash",
  TreatmentsFinishing: "Treatments & Finishing",
  SustainabilityCertificationID: "Sustainability Certification",
  LaundryDetails: "Laundry Details",
  ShipmentDate: "Shipment Date",
  OrderQuantity: "Order Quantity",
  UnitPrice: "Unit Price",
  Link3D: "3D Link",
};

const COLUMN_TO_VALUE = {
  ProductStyleNo: (p) => p.productStyleNo,
  ProductStyleID: (p) => p.productStyleID,
  ProductStyleDescription: (p) => p.productStyleDescription,
  ProductShortDescription: (p) => p.productShortDescription,
  BrandID: (p) => p.brand,
  CustomerID: (p) => p.customer,
  RetailerID: (p) => p.retailer,
  CategoryID: (p) => p.category,
  SubCategoryID: (p) => p.subCategory,
  SampleTypeID: (p) => p.sampleType,
  SupplierID: (p) => p.supplier,
  MerchandiserID: (p) => p.merchandiser,
  FabricCodeID: (p) => p.fabricCode,
  MainFabrication: (p) => p.mainFabrication,
  FabricWeight: (p) => p.fabricWeight,
  FabricComposition: (p) => p.fabricComposition,
  MainFabricColor: (p) => p.mainFabricColor,
  TrimComposition: (p) => p.trimComposition,
  ContrastTrimFabrication: (p) => p.contrastTrimFabrication,
  ContrastTrimColor: (p) => p.contrastTrimColor,
  WashID: (p) => p.wash,
  TreatmentsFinishing: (p) => p.treatmentsFinishing,
  SustainabilityCertificationID: (p) => p.sustainability,
  LaundryDetails: (p) => p.laundryDetails,
  ShipmentDate: (p) => p.shipmentDate ? new Date(p.shipmentDate).toLocaleDateString() : null,
  OrderQuantity: (p) => p.orderQuantity,
  UnitPrice: (p) => p.unitPrice != null ? `$${p.unitPrice.toFixed(2)}` : null,
  Link3D: (p) => p.link3D,
};

function ProductDetailModal({ product, properties, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const imgUrl = product?.primaryImageFile
    ? `/img/products/${product.companyID}/${product.primaryImageFile}`
    : null;
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");
  const imgContainerRef = useRef(null);

  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setZoom((prev) => Math.min(5, Math.max(1, prev + (e.deltaY > 0 ? -0.3 : 0.3))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  function handleMouseLeave() {
    setZoom(1);
    setOrigin("50% 50%");
  }

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => { setZoom(1); setOrigin("50% 50%"); }, [product]);

  if (!product) return null;

  const displayProps = properties.length > 0 ? properties : ["ProductStyleNo", "ProductStyleID", "ProductStyleDescription"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden w-full md:w-[900px] md:h-[520px] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white text-slate-400 hover:text-slate-800 shadow-md cursor-pointer transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* Prev arrow */}
        {hasPrev && (
          <button onClick={onPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white text-slate-400 hover:text-slate-800 shadow-md cursor-pointer transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next arrow */}
        {hasNext && (
          <button onClick={onNext} className="absolute right-14 md:right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white text-slate-400 hover:text-slate-800 shadow-md cursor-pointer transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Image side — fixed 50%, magnifier zoom */}
        <div
          ref={imgContainerRef}
          className="relative w-full md:w-1/2 h-64 md:h-full bg-slate-50 flex-shrink-0 overflow-hidden"
          style={{ cursor: zoom > 1 ? "grab" : "zoom-in" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={product.productStyleNo || "Product"}
              fill
              className="object-contain p-6 transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
              sizes="450px"
              draggable={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
          {zoom > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* Details side — fixed 50% */}
        <div className="w-full md:w-1/2 h-auto md:h-full overflow-y-auto p-6 md:p-8">
          <div className="space-y-1.5">
            {displayProps.map((col) => {
              const label = FIELD_MAP[col];
              const valueFn = COLUMN_TO_VALUE[col];
              const value = valueFn ? valueFn(product) : null;
              if (!label || !value) return null;
              return (
                <div key={col} className="flex gap-2">
                  <span className="text-[13px] font-bold text-slate-500 whitespace-nowrap min-w-0">{label}:</span>
                  {col === "Link3D" && typeof value === "string" && value.startsWith("http") ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-[13px] text-indigo-600 underline break-all">{value}</a>
                  ) : (
                    <span className="text-[13px] text-slate-800">{value}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogViewPage() {
  const { catalogUrl } = useParams();
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gridCols, setGridCols] = useState(6);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (!catalogUrl) return;
    api.get(`/api/marketplace/catalog/public/${catalogUrl}`)
      .then(({ data }) => setCatalog(data))
      .catch(() => setError("Catalog not found or has been removed."))
      .finally(() => setLoading(false));
  }, [catalogUrl]);

  const closeModal = useCallback(() => setSelectedIndex(null), []);
  const goPrev = useCallback(() => setSelectedIndex((i) => (i > 0 ? i - 1 : i)), []);
  const goNext = useCallback(() => setSelectedIndex((i) => (catalog?.products && i < catalog.products.length - 1 ? i + 1 : i)), [catalog]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <X className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-700 mb-2">Catalog Not Found</h1>
          <p className="text-slate-500">{error || "This catalog does not exist."}</p>
        </div>
      </div>
    );
  }

  const properties = catalog.catalogProperties
    ? catalog.catalogProperties.split(",").filter((p) => p.trim())
    : [];

  const productCount = catalog.products?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/img/catalog/catalogbg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-800/75 to-indigo-900/65" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-8">
          {/* Desktop: 3-column layout */}
          <div className="hidden sm:flex items-center justify-between">
            <Image src="/img/logo/logo.png" alt="StyleLab" width={140} height={40} className="h-9 w-auto object-contain brightness-0 invert flex-shrink-0" />
            <div className="text-center">
              <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Catalog</p>
              <h1 className="text-2xl font-bold text-white tracking-wide uppercase mt-1">{catalog.catalogName}</h1>
              {catalog.customer && <p className="text-sm text-white/60 mt-1">{catalog.customer}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              {catalog.emailTo && <p className="text-xs text-white/50">{catalog.emailTo}</p>}
              <p className="text-xs text-white/40 mt-1">{productCount} product{productCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {/* Mobile: stacked layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <Image src="/img/logo/logo.png" alt="StyleLab" width={100} height={30} className="h-6 w-auto object-contain brightness-0 invert" />
              <div className="text-right text-[10px] text-white/50">
                {catalog.emailTo && <p>{catalog.emailTo}</p>}
                <p>{productCount} product{productCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Catalog</p>
              <h1 className="text-xl font-bold text-white uppercase mt-0.5">{catalog.catalogName}</h1>
              {catalog.customer && <p className="text-xs text-white/60 mt-0.5">{catalog.customer}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400">
            Hover or tap a product to view full details.
          </p>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-400">Grid:</span>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              {[3, 4, 5, 6, 7].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`w-8 h-7 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${
                    gridCols === cols ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {productCount === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Eye className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-slate-500">No products in this catalog.</p>
          </div>
        ) : (
          <div className="marketplace-grid grid grid-cols-2 gap-3 md:gap-4" style={{ '--grid-cols': gridCols }}>
            {catalog.products.map((p, idx) => {
              const imgUrl = p.primaryImageFile
                ? `/img/products/${p.companyID}/${p.primaryImageFile}`
                : null;

              return (
                <div
                  key={p.id}
                  className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedIndex(idx)}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={p.productStyleNo || "Product"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}

                    {/* Hover overlay with View button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                        <Eye className="h-3.5 w-3.5" /> View
                      </span>
                    </div>
                  </div>

                  {/* Card info */}
                  <div className="px-2.5 py-2.5 space-y-0.5">
                    {(properties.length > 0 ? properties : ["ProductStyleNo", "ProductStyleDescription"]).slice(0, 2).map((col) => {
                      const label = FIELD_MAP[col];
                      const valueFn = COLUMN_TO_VALUE[col];
                      const value = valueFn ? valueFn(p) : null;
                      if (!label || !value) return null;
                      return (
                        <p key={col} className="text-[11px] text-slate-600 truncate">
                          <span className="font-bold text-slate-500">{label}:</span> {value}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-slate-900 py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <Image src="/img/logo/logo.png" alt="StyleLab" width={120} height={35} className="h-8 w-auto object-contain mx-auto brightness-0 invert opacity-60" />
          <p className="text-xs text-slate-500 mt-4">&copy; {new Date().getFullYear()} StyleLab. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedIndex !== null && catalog.products?.[selectedIndex] && (
        <ProductDetailModal
          product={catalog.products[selectedIndex]}
          properties={properties}
          onClose={closeModal}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < catalog.products.length - 1}
        />
      )}
    </div>
  );
}
