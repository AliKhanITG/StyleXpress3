"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Search, X, ChevronDown,
  SlidersHorizontal, PlusCircle,
  LayoutGrid, Grid3X3, Rows3, List,
} from "lucide-react";
import { useAuthStore } from "@/store/AuthStore";
import { api } from "@/Lib/Api";
import MarketplaceNav from "@/components/marketplace/MarketplaceNav";

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar filter helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function buildCategoryTree(flat) {
  const map = {};
  flat.forEach((n) => { map[n.id] = { ...n, children: [] }; });
  const roots = [];
  flat.forEach((n) => {
    if (n.parentCategoryID == null) roots.push(map[n.id]);
    else if (map[n.parentCategoryID]) map[n.parentCategoryID].children.push(map[n.id]);
  });
  return roots;
}

function FilterSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-3">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm font-semibold text-slate-800 cursor-pointer">
        {title}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-2.5 space-y-1.5">{children}</div>}
    </div>
  );
}

function getCategoryPath(flatCategories, id) {
  const map = {};
  flatCategories.forEach((c) => { map[c.id] = c; });
  const path = [];
  let cur = map[id];
  while (cur) {
    path.unshift(cur.categoryName);
    cur = cur.parentCategoryID ? map[cur.parentCategoryID] : null;
  }
  return path;
}

function findAncestorIds(flatCategories, id) {
  const map = {};
  flatCategories.forEach((c) => { map[c.id] = c; });
  const ids = new Set();
  let cur = map[id];
  while (cur?.parentCategoryID) {
    ids.add(cur.parentCategoryID);
    cur = map[cur.parentCategoryID];
  }
  return ids;
}

function CategoryTreeNode({ node, selectedIds, onToggle: onSelect, expanded, onExpandToggle, depth = 0 }) {
  const hasChildren = node.children?.length > 0;
  const isSelected = selectedIds.has(node.id);

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-[5px] pr-1 rounded-md transition-colors ${
          isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
        }`}
        style={{ paddingLeft: `${depth * 20 + 4}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => onExpandToggle(node.id)}
            className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded.has(node.id) ? "" : "-rotate-90"}`} />
          </button>
        ) : (
          <span className="w-[18px] flex-shrink-0" />
        )}

        <button
          onClick={() => onSelect(node.id)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
        >
          <span className={`flex-shrink-0 h-3.5 w-3.5 rounded border flex items-center justify-center ${
            isSelected ? "bg-slate-900 border-slate-900" : "border-slate-300"
          }`}>
            {isSelected && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </span>
          <span className={`text-[13px] truncate ${isSelected ? "text-slate-900 font-semibold" : "text-slate-700"}`}>
            {node.categoryName}
          </span>
        </button>

        {node.productCount > 0 && (
          <span className="flex-shrink-0 text-[11px] text-slate-400 ml-auto">({node.productCount.toLocaleString()})</span>
        )}
      </div>

      {hasChildren && expanded.has(node.id) && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              selectedIds={selectedIds}
              onToggle={onSelect}
              expanded={expanded}
              onExpandToggle={onExpandToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTree({ nodes, selectedIds, onToggle, flatCategories }) {
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    if (!selectedIds.size || !flatCategories?.length) return;
    const allAncestors = new Set();
    selectedIds.forEach((id) => {
      findAncestorIds(flatCategories, id).forEach((a) => allAncestors.add(a));
    });
    setExpanded((prev) => {
      const next = new Set(prev);
      allAncestors.forEach((id) => next.add(id));
      return next;
    });
  }, [selectedIds, flatCategories]);

  const expandToggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedNames = flatCategories
    ?.filter((c) => selectedIds.has(c.id))
    .map((c) => c.categoryName) || [];

  return (
    <div>
      {selectedNames.length > 0 && (
        <div className="text-[12px] text-indigo-600 font-medium mb-2 truncate">
          {selectedNames.join(", ")}
        </div>
      )}
      <div className="max-h-72 overflow-y-auto -mx-1 px-1">
        {nodes.map((node) => (
          <CategoryTreeNode
            key={node.id}
            node={node}
            selectedIds={selectedIds}
            onToggle={onToggle}
            expanded={expanded}
            onExpandToggle={expandToggle}
          />
        ))}
      </div>
    </div>
  );
}

function toggleSet(set, id) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function CheckboxFilterList({ items, selectedIds, onToggle, nameKey }) {
  return items.map((item) => {
    const checked = selectedIds.has(item.id);
    return (
      <button
        key={item.id}
        onClick={() => onToggle(item.id)}
        className={`flex items-center justify-between w-full text-left text-[13px] py-1 transition-colors cursor-pointer ${
          checked ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="flex items-center gap-2">
          <span className={`h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
            checked ? "bg-slate-900 border-slate-900" : "border-slate-300"
          }`}>
            {checked && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </span>
          <span className="truncate">{item[nameKey]}</span>
        </span>
        {item.productCount > 0 && <span className="text-[11px] text-slate-400 flex-shrink-0">({item.productCount.toLocaleString()})</span>}
      </button>
    );
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   Product Card
   ═══════════════════════════════════════════════════════════════════════════ */

function ProductCard({ product, inCart, onToggleCart }) {
  const [imgError, setImgError] = useState(false);
  const [hoverCheckbox, setHoverCheckbox] = useState(false);
  const imgUrl = product.primaryImageFile
    ? `/img/products/${product.companyID}/${product.primaryImageFile}`
    : null;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
        {imgUrl && !imgError ? (
          <Image
            src={imgUrl}
            alt={product.productStyleNo || "Product"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}

        {/* Checkbox + tooltip label */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <span
            className={`px-2 py-1 rounded text-[11px] font-semibold text-white whitespace-nowrap transition-all duration-200 ${
              hoverCheckbox || inCart ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
            }`}
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            {inCart ? "Added to Catalog" : "Add to Catalog"}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCart(product.id); }}
            onMouseEnter={() => setHoverCheckbox(true)}
            onMouseLeave={() => setHoverCheckbox(false)}
            className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              inCart
                ? "bg-indigo-600 border-indigo-600"
                : "bg-white/90 border-slate-300 hover:border-indigo-500 opacity-0 group-hover:opacity-100"
            }`}
          >
            {inCart && (
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-2 sm:px-3 pt-2 pb-2 sm:pb-3">
        <div className="flex items-baseline justify-between gap-1 sm:gap-2">
          <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 truncate">{product.productStyleNo}</p>
          {product.productStyleID && (
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium flex-shrink-0 hidden sm:inline">{product.productStyleID}</span>
          )}
        </div>
        {product.productStyleDescription && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">{product.productStyleDescription}</p>
        )}
        <div className="flex items-center justify-between mt-1.5 sm:mt-2">
          {product.unitPrice != null ? (
            <span className="text-[12px] sm:text-sm font-bold text-slate-900">${product.unitPrice.toFixed(2)}</span>
          ) : (
            <span />
          )}
          {product.brand && (
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold tracking-wider uppercase truncate ml-1">{product.brand.brandName}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Marketplace Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function MarketplacePage() {
  const { isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [cartIds, setCartIds] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [filters, setFilters] = useState({ categories: [], brands: [], customers: [], retailers: [], suppliers: [], merchandisers: [], priceRange: { min: 0, max: 0 } });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const [selCategories, setSelCategories] = useState(new Set());
  const [selBrands, setSelBrands] = useState(new Set());
  const [selCustomers, setSelCustomers] = useState(new Set());
  const [selRetailers, setSelRetailers] = useState(new Set());
  const [selSuppliers, setSelSuppliers] = useState(new Set());
  const [selMerchandisers, setSelMerchandisers] = useState(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [gridCols, setGridCols] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, pageSize, sortBy };
      if (selCategories.size)    params.categoryIds    = [...selCategories].join(",");
      if (selBrands.size)        params.brandIds       = [...selBrands].join(",");
      if (selCustomers.size)     params.customerIds    = [...selCustomers].join(",");
      if (selRetailers.size)     params.retailerIds    = [...selRetailers].join(",");
      if (selSuppliers.size)     params.supplierIds    = [...selSuppliers].join(",");
      if (selMerchandisers.size) params.merchandiserIds = [...selMerchandisers].join(",");
      if (debouncedSearch) params.search = debouncedSearch;

      const { data } = await api.get("/api/marketplace/products", { params });
      setProducts(data.items || []);
      setTotal(data.total || 0);
      setPage(pg);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selCategories, selBrands, selCustomers, selRetailers, selSuppliers, selMerchandisers, debouncedSearch, sortBy, pageSize]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/api/marketplace/filters").then(({ data }) => setFilters(data)).catch(() => {});
    api.get("/api/marketplace/cart/product-ids").then(({ data }) => setCartIds(new Set(data))).catch(() => {});
    api.get("/api/marketplace/cart/count").then(({ data }) => setCartCount(data.count || 0)).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProducts(1);
  }, [isAuthenticated, fetchProducts]);

  const handleToggleCart = async (productId) => {
    try {
      const { data } = await api.post("/api/marketplace/cart/toggle", { productId });
      setCartIds((prev) => {
        const next = new Set(prev);
        if (data.inCart) next.add(productId);
        else next.delete(productId);
        return next;
      });
      setCartCount(data.count);
    } catch {}
  };

  const clearFilters = () => {
    setSelCategories(new Set());
    setSelBrands(new Set());
    setSelCustomers(new Set());
    setSelRetailers(new Set());
    setSelSuppliers(new Set());
    setSelMerchandisers(new Set());
    setSearchInput("");
    setSortBy("newest");
  };

  const activeFilterCount = selCategories.size + selBrands.size + selCustomers.size + selRetailers.size + selSuppliers.size + selMerchandisers.size + (debouncedSearch ? 1 : 0);
  const categoryTree = buildCategoryTree(filters.categories);
  const totalPages = Math.ceil(total / pageSize);

  const chipItems = [
    ...filters.categories.filter((c) => selCategories.has(c.id)).map((c) => ({ label: c.categoryName, clear: () => setSelCategories((p) => { const n = new Set(p); n.delete(c.id); return n; }) })),
    ...filters.brands.filter((b) => selBrands.has(b.id)).map((b) => ({ label: b.brandName, clear: () => setSelBrands((p) => { const n = new Set(p); n.delete(b.id); return n; }) })),
    ...filters.customers.filter((c) => selCustomers.has(c.id)).map((c) => ({ label: c.customerName, clear: () => setSelCustomers((p) => { const n = new Set(p); n.delete(c.id); return n; }) })),
    ...filters.retailers.filter((r) => selRetailers.has(r.id)).map((r) => ({ label: r.retailerName, clear: () => setSelRetailers((p) => { const n = new Set(p); n.delete(r.id); return n; }) })),
    ...filters.suppliers.filter((s) => selSuppliers.has(s.id)).map((s) => ({ label: s.supplierName, clear: () => setSelSuppliers((p) => { const n = new Set(p); n.delete(s.id); return n; }) })),
    ...filters.merchandisers.filter((m) => selMerchandisers.has(m.id)).map((m) => ({ label: m.merchandiserName, clear: () => setSelMerchandisers((p) => { const n = new Set(p); n.delete(m.id); return n; }) })),
  ];

  return (
    <>
      <MarketplaceNav cartCount={cartCount} />

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebar(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </button>
            <span className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{total.toLocaleString()}</span> Results
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Active filter chips */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2 flex-wrap">
              {chipItems.map((chip, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                  {chip.label}
                  <button onClick={chip.clear} className="hover:text-slate-900 cursor-pointer"><X className="h-3 w-3" /></button>
                </span>
              ))}
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer">Clear all</button>
              )}
            </div>

            {/* Grid view toggles */}
            <div className="hidden md:flex items-center border border-slate-200 rounded-lg overflow-hidden">
              {[
                { cols: 2, icon: <Rows3 className="h-4 w-4" /> },
                { cols: 3, icon: <LayoutGrid className="h-4 w-4" /> },
                { cols: 4, icon: <Grid3X3 className="h-4 w-4" /> },
                { cols: 5, icon: <List className="h-4 w-4 rotate-90" /> },
              ].map(({ cols, icon }) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`p-1.5 transition-colors cursor-pointer ${
                    gridCols === cols ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-200 hidden md:block" />

            <span className="text-xs text-slate-500">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-semibold text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer pr-6"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6 mt-4 pb-12">
          {/* ─── Sidebar Filters ─── */}
          {/* Desktop */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-[72px]">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-3">ALL FILTERS</h3>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              <FilterSection title="Brand" defaultOpen={false}>
                <CheckboxFilterList items={filters.brands} selectedIds={selBrands} onToggle={(id) => setSelBrands((p) => toggleSet(p, id))} nameKey="brandName" />
              </FilterSection>

              <FilterSection title="Category" defaultOpen={true}>
                <CategoryTree nodes={categoryTree} selectedIds={selCategories} onToggle={(id) => setSelCategories((p) => toggleSet(p, id))} flatCategories={filters.categories} />
              </FilterSection>

              <FilterSection title="Customers" defaultOpen={false}>
                <CheckboxFilterList items={filters.customers} selectedIds={selCustomers} onToggle={(id) => setSelCustomers((p) => toggleSet(p, id))} nameKey="customerName" />
              </FilterSection>

              <FilterSection title="Retailers" defaultOpen={false}>
                <CheckboxFilterList items={filters.retailers} selectedIds={selRetailers} onToggle={(id) => setSelRetailers((p) => toggleSet(p, id))} nameKey="retailerName" />
              </FilterSection>

              <FilterSection title="Suppliers" defaultOpen={false}>
                <CheckboxFilterList items={filters.suppliers} selectedIds={selSuppliers} onToggle={(id) => setSelSuppliers((p) => toggleSet(p, id))} nameKey="supplierName" />
              </FilterSection>

              <FilterSection title="Merchandisers" defaultOpen={false}>
                <CheckboxFilterList items={filters.merchandisers} selectedIds={selMerchandisers} onToggle={(id) => setSelMerchandisers((p) => toggleSet(p, id))} nameKey="merchandiserName" />
              </FilterSection>
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileSidebar && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebar(false)} />
              <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 tracking-wide">ALL FILTERS</h3>
                  <button onClick={() => setMobileSidebar(false)} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><X className="h-5 w-5" /></button>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>

                <FilterSection title="Brand" defaultOpen={false}>
                  <CheckboxFilterList items={filters.brands} selectedIds={selBrands} onToggle={(id) => setSelBrands((p) => toggleSet(p, id))} nameKey="brandName" />
                </FilterSection>

                <FilterSection title="Category" defaultOpen={true}>
                  <CategoryTree nodes={categoryTree} selectedIds={selCategories} onToggle={(id) => setSelCategories((p) => toggleSet(p, id))} flatCategories={filters.categories} />
                </FilterSection>

                <FilterSection title="Customers" defaultOpen={false}>
                  <CheckboxFilterList items={filters.customers} selectedIds={selCustomers} onToggle={(id) => setSelCustomers((p) => toggleSet(p, id))} nameKey="customerName" />
                </FilterSection>

                <FilterSection title="Retailers" defaultOpen={false}>
                  <CheckboxFilterList items={filters.retailers} selectedIds={selRetailers} onToggle={(id) => setSelRetailers((p) => toggleSet(p, id))} nameKey="retailerName" />
                </FilterSection>

                <FilterSection title="Suppliers" defaultOpen={false}>
                  <CheckboxFilterList items={filters.suppliers} selectedIds={selSuppliers} onToggle={(id) => setSelSuppliers((p) => toggleSet(p, id))} nameKey="supplierName" />
                </FilterSection>

                <FilterSection title="Merchandisers" defaultOpen={false}>
                  <CheckboxFilterList items={filters.merchandisers} selectedIds={selMerchandisers} onToggle={(id) => setSelMerchandisers((p) => toggleSet(p, id))} nameKey="merchandiserName" />
                </FilterSection>
              </aside>
            </div>
          )}

          {/* ─── Product Grid ─── */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="marketplace-grid grid grid-cols-2 gap-3 md:gap-4" style={{ '--grid-cols': gridCols }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-slate-100 rounded-lg" />
                    <div className="mt-2 h-3 bg-slate-100 rounded w-3/4" />
                    <div className="mt-1.5 h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No products found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">Try adjusting your filters or search criteria to find what you&apos;re looking for.</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer">Clear all filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="marketplace-grid grid grid-cols-2 gap-3 md:gap-4" style={{ '--grid-cols': gridCols }}>
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} inCart={cartIds.has(p.id)} onToggleCart={handleToggleCart} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <button
                      disabled={page <= 1}
                      onClick={() => fetchProducts(page - 1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pg;
                      if (totalPages <= 7) pg = i + 1;
                      else if (page <= 4) pg = i + 1;
                      else if (page >= totalPages - 3) pg = totalPages - 6 + i;
                      else pg = page - 3 + i;
                      return (
                        <button
                          key={pg}
                          onClick={() => fetchProducts(pg)}
                          className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer ${
                            pg === page ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => fetchProducts(page + 1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
