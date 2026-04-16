"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronRight, ChevronDown, FolderTree, FolderOpen, Folder, FileText,
  Loader2, Pencil, Plus, Trash2, X, Search, Home, ArrowLeft, MoreHorizontal,
  GripVertical, Check, Layers, Tag, Palette, Ruler, Beaker, Users2, Leaf, Droplets
} from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
import { Badge } from "@/Components/Ui/Badge";
import { api } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import { useAuthStore } from "@/store/AuthStore";

const TABS = [
  { id: "brands", label: "Brands", icon: Tag },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "sizes", label: "Sizes", icon: Ruler },
  { id: "sampleTypes", label: "Sample Types", icon: Beaker },
  { id: "sustainability", label: "Sustainability", icon: Leaf },
  { id: "washes", label: "Washes", icon: Droplets },
  { id: "fabricCodes", label: "Fabric Codes", icon: Layers },
];

const TAB_CONFIG = {
  brands: {
    endpoint: "/api/brands",
    fields: [
      { key: "brandName", label: "Brand Name", required: true },
      { key: "brandDescription", label: "Description" },
      { key: "brandLogoUrl", label: "Logo URL" },
    ],
    columns: ["brandName", "brandDescription", "brandLogoUrl"],
    displayName: (item) => item.brandName,
  },
  categories: {
    endpoint: "/api/categories",
    fields: [
      { key: "categoryName", label: "Category Name", required: true },
      { key: "categoryCode", label: "Category Code" },
      { key: "categoryDescription", label: "Description" },
      { key: "parentCategoryID", label: "Parent Category", type: "parentSelect" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
    ],
    columns: ["categoryName", "categoryCode", "categoryDescription", "sortOrder"],
    displayName: (item) => item.categoryName,
  },
  colors: {
    endpoint: "/api/colors",
    fields: [
      { key: "colorName", label: "Color Name", required: true },
      { key: "colorHexCode", label: "Hex Code" },
      { key: "colorCode", label: "Color Code" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
    ],
    columns: ["colorName", "colorHexCode", "colorCode", "sortOrder"],
    displayName: (item) => item.colorName,
  },
  sizes: {
    endpoint: "/api/sizes",
    fields: [
      { key: "sizeName", label: "Size Name", required: true },
      { key: "sizeCode", label: "Size Code" },
      { key: "sizeGroup", label: "Size Group" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
    ],
    columns: ["sizeName", "sizeCode", "sizeGroup", "sortOrder"],
    displayName: (item) => item.sizeName,
  },
  sampleTypes: {
    endpoint: "/api/sample-types",
    fields: [
      { key: "sampleTypeName", label: "Sample Type Name", required: true },
      { key: "sampleTypeCode", label: "Sample Type Code" },
    ],
    columns: ["sampleTypeName", "sampleTypeCode"],
    displayName: (item) => item.sampleTypeName,
  },
  sustainability: {
    endpoint: "/api/sustainability",
    fields: [
      { key: "certificationName", label: "Certification Name", required: true },
      { key: "certificationCode", label: "Certification Code" },
      { key: "certificationDescription", label: "Description" },
      { key: "certificationLogoUrl", label: "Logo URL" },
      { key: "userID", label: "User ID", type: "number", fromSession: "userID" },
      { key: "companyID", label: "Company ID", type: "number", fromSession: "companyID" },
    ],
    columns: ["certificationName", "certificationCode", "certificationDescription", "certificationLogoUrl"],
    displayName: (item) => item.certificationName,
  },
  washes: {
    endpoint: "/api/washes",
    fields: [
      { key: "washName", label: "Wash Name", required: true },
      { key: "userID", label: "User ID", type: "number", fromSession: "userID" },
      { key: "companyID", label: "Company ID", type: "number", fromSession: "companyID" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
    ],
    columns: ["washName", "sortOrder"],
    displayName: (item) => item.washName,
  },
  fabricCodes: {
    endpoint: "/api/fabriccodes",
    fields: [
      { key: "fabricCode", label: "Fabric Code", required: true },
      { key: "fabricComposition", label: "Composition" },
      { key: "fabricWeave", label: "Weave" },
      { key: "fabricWeight", label: "Weight" },
      { key: "fabricWidth", label: "Width" },
      { key: "fabricColor", label: "Color" },
    ],
    columns: ["fabricCode", "fabricComposition", "fabricWeave", "fabricWeight", "fabricWidth", "fabricColor"],
    displayName: (item) => item.fabricCode,
  },
};

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data) return Array.isArray(data.items) ? data.items : [];
  return [];
}

const LEVEL_LABELS = ["Category", "Sub Category", "Type", "Item", "Item"];
const LEVEL_COLORS = [
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "text-indigo-500", badge: "bg-indigo-100 text-indigo-700" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "text-violet-500", badge: "bg-violet-100 text-violet-700" },
  { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: "text-cyan-500", badge: "bg-cyan-100 text-cyan-700" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "text-amber-500", badge: "bg-amber-100 text-amber-700" },
];

function getLevelColor(level) {
  return LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];
}

// ─── Category Tree Explorer ──────────────────────────────────────────────────
function CategoryExplorer({ allItems, onReload }) {
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [viewMode, setViewMode] = useState("explorer");

  const byId = useMemo(() => {
    const m = new Map();
    allItems.forEach((c) => m.set(c.id, c));
    return m;
  }, [allItems]);

  const currentChildren = useMemo(() => {
    return allItems
      .filter((c) => {
        if (currentParentId === null) return c.parentCategoryID == null;
        return c.parentCategoryID === currentParentId;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.categoryName || "").localeCompare(b.categoryName || ""));
  }, [allItems, currentParentId]);

  const currentLevel = breadcrumb.length;

  const getChildCount = useCallback((id) => allItems.filter((c) => c.parentCategoryID === id).length, [allItems]);

  const navigateInto = (item) => {
    setBreadcrumb((prev) => [...prev, { id: item.id, name: item.categoryName, code: item.categoryCode }]);
    setCurrentParentId(item.id);
    setFormOpen(false);
    setEditingItem(null);
    setSearchQuery("");
  };

  const navigateTo = (index) => {
    if (index < 0) {
      setBreadcrumb([]);
      setCurrentParentId(null);
    } else {
      const newBreadcrumb = breadcrumb.slice(0, index + 1);
      setBreadcrumb(newBreadcrumb);
      setCurrentParentId(newBreadcrumb[newBreadcrumb.length - 1].id);
    }
    setFormOpen(false);
    setEditingItem(null);
    setSearchQuery("");
  };

  const goBack = () => {
    if (breadcrumb.length === 0) return;
    navigateTo(breadcrumb.length - 2);
  };

  const openNew = () => {
    setEditingItem(null);
    setFormData({ categoryName: "", categoryCode: "", categoryDescription: "", sortOrder: 0 });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      categoryName: item.categoryName || "",
      categoryCode: item.categoryCode || "",
      categoryDescription: item.categoryDescription || "",
      sortOrder: item.sortOrder ?? 0,
    });
    setFormOpen(true);
  };

  const closeForm = () => { setFormOpen(false); setEditingItem(null); };

  const saveItem = async () => {
    if (!formData.categoryName?.trim()) return;
    setSaving(true);
    try {
      const body = {
        categoryName: formData.categoryName.trim(),
        categoryCode: formData.categoryCode?.trim() || null,
        categoryDescription: formData.categoryDescription?.trim() || null,
        parentCategoryID: currentParentId,
        sortOrder: Number(formData.sortOrder) || 0,
      };
      if (editingItem) {
        await api.put(`/api/categories/${editingItem.id}`, body);
      } else {
        await api.post("/api/categories", body);
      }
      await onReload();
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    const children = getChildCount(item.id);
    const msg = children > 0
      ? `Delete "${item.categoryName}" and all its ${children} children?`
      : `Delete "${item.categoryName}"?`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/api/categories/${item.id}`);
      await onReload();
    } catch { /* noop */ }
  };

  const filteredChildren = useMemo(() => {
    if (!searchQuery.trim()) return currentChildren;
    const q = searchQuery.toLowerCase();
    return currentChildren.filter(
      (c) => c.categoryName?.toLowerCase().includes(q) || c.categoryCode?.toLowerCase().includes(q)
    );
  }, [currentChildren, searchQuery]);

  // Tree view helpers
  const buildTree = useCallback((parentId) => {
    return allItems
      .filter((c) => {
        if (parentId === null) return c.parentCategoryID == null;
        return c.parentCategoryID === parentId;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.categoryName || "").localeCompare(b.categoryName || ""));
  }, [allItems]);

  const toggleExpand = (id) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const TreeNode = ({ item, depth = 0 }) => {
    const children = buildTree(item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(item.id);
    const lc = getLevelColor(item.level ?? depth);

    return (
      <div>
        <div
          className={cn(
            "group flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-all duration-150 hover:bg-slate-50",
            isExpanded && hasChildren && "bg-slate-50/50"
          )}
          style={{ paddingLeft: 12 + depth * 24 }}
        >
          <button
            onClick={() => hasChildren && toggleExpand(item.id)}
            className={cn("shrink-0 p-0.5 rounded-md transition-colors", hasChildren ? "hover:bg-slate-200" : "invisible")}
          >
            {isExpanded
              ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
          </button>

          <div className={cn("shrink-0 flex h-7 w-7 items-center justify-center rounded-lg", lc.bg)}>
            {hasChildren
              ? (isExpanded ? <FolderOpen className={cn("h-3.5 w-3.5", lc.icon)} /> : <Folder className={cn("h-3.5 w-3.5", lc.icon)} />)
              : <FileText className={cn("h-3.5 w-3.5", lc.icon)} />}
          </div>

          <div className="flex-1 min-w-0" onClick={() => hasChildren ? toggleExpand(item.id) : null}>
            <span className="text-sm font-medium text-slate-800 truncate block">{item.categoryName}</span>
          </div>

          {item.categoryCode && (
            <span className="hidden sm:inline-flex text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {item.categoryCode}
            </span>
          )}

          {hasChildren && (
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", lc.badge)}>{children.length}</span>
          )}

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600">
              <Pencil className="h-3 w-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteItem(item); }} className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>{children.map((child) => <TreeNode key={child.id} item={child} depth={depth + 1} />)}</div>
        )}
      </div>
    );
  };

  const levelLabel = LEVEL_LABELS[Math.min(currentLevel, LEVEL_LABELS.length - 1)];
  const lc = getLevelColor(currentLevel);

  return (
    <div className="space-y-4">
      {/* View mode toggle + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("explorer")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", viewMode === "explorer" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <Layers className="h-3.5 w-3.5 inline mr-1.5" />Explorer
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", viewMode === "tree" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <FolderTree className="h-3.5 w-3.5 inline mr-1.5" />Tree
            </button>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">{allItems.length} total</Badge>
        </div>

        {viewMode === "explorer" && (
          <Button size="sm" onClick={openNew} disabled={formOpen}>
            <Plus className="h-3.5 w-3.5" /> Add {levelLabel}
          </Button>
        )}
      </div>

      {/* Tree View */}
      {viewMode === "tree" && (
        <Card>
          <CardHeader className="py-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Full Category Tree</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Expand nodes to browse the hierarchy</p>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => {
                  const allIds = new Set();
                  allItems.forEach((c) => { if (allItems.some((x) => x.parentCategoryID === c.id)) allIds.add(c.id); });
                  setExpandedNodes(allIds);
                }}>Expand All</Button>
                <Button size="sm" variant="outline" onClick={() => setExpandedNodes(new Set())}>Collapse</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            <div className="max-h-[600px] overflow-y-auto">
              {buildTree(null).map((item) => <TreeNode key={item.id} item={item} depth={0} />)}
              {buildTree(null).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-10">No categories yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explorer View */}
      {viewMode === "explorer" && (
        <>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => navigateTo(-1)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                breadcrumb.length === 0
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              )}
            >
              <Home className="h-3 w-3" /> Root
            </button>
            {breadcrumb.map((crumb, i) => {
              const isLast = i === breadcrumb.length - 1;
              const cl = getLevelColor(i + 1);
              return (
                <div key={crumb.id} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-300" />
                  <button
                    onClick={() => navigateTo(i)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                      isLast
                        ? cn(cl.bg, cl.text, "border", cl.border)
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {crumb.name}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Inline Form */}
          {formOpen && (
            <Card className="border-indigo-200 shadow-md ring-1 ring-indigo-100 animate-scale-in">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm">
                    {editingItem ? `Edit ${levelLabel}` : `New ${levelLabel}`}
                    {breadcrumb.length > 0 && !editingItem && (
                      <span className="font-normal text-slate-400"> in {breadcrumb[breadcrumb.length - 1].name}</span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">Fill in the details below</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={closeForm} className="h-7 w-7"><X className="h-3.5 w-3.5" /></Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">{levelLabel} Name <span className="text-red-500">*</span></label>
                    <Input value={formData.categoryName || ""} onChange={(e) => setFormData((p) => ({ ...p, categoryName: e.target.value }))} placeholder={`e.g. ${currentLevel === 0 ? "Knit" : currentLevel === 1 ? "Women" : currentLevel === 2 ? "Tops" : "T-Shirt"}`} autoFocus />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Code</label>
                    <Input value={formData.categoryCode || ""} onChange={(e) => setFormData((p) => ({ ...p, categoryCode: e.target.value }))} placeholder="Auto-generated if empty" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600">Description</label>
                    <Input value={formData.categoryDescription || ""} onChange={(e) => setFormData((p) => ({ ...p, categoryDescription: e.target.value }))} placeholder="Optional description" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Sort Order</label>
                    <Input type="number" value={formData.sortOrder ?? 0} onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
                  <Button size="sm" onClick={saveItem} disabled={saving || !formData.categoryName?.trim()}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          {currentChildren.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder={`Search ${LEVEL_LABELS[Math.min(currentLevel + 1, LEVEL_LABELS.length - 1)].toLowerCase()}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}

          {/* Items Grid */}
          <div className="space-y-2 stagger-children">
            {filteredChildren.length === 0 && !formOpen && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl mb-4", lc.bg)}>
                    <FolderTree className={cn("h-6 w-6", lc.icon)} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {breadcrumb.length === 0 ? "No categories yet" : `No items in "${breadcrumb[breadcrumb.length - 1].name}"`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Click the button above to add your first {levelLabel.toLowerCase()}
                  </p>
                  <Button size="sm" variant="outline" onClick={openNew}>
                    <Plus className="h-3.5 w-3.5" /> Add {levelLabel}
                  </Button>
                </CardContent>
              </Card>
            )}

            {filteredChildren.map((item) => {
              const childCount = getChildCount(item.id);
              const hasChildren = childCount > 0;
              const itemLevel = item.level ?? currentLevel;
              const ic = getLevelColor(itemLevel);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all duration-200",
                    "hover:shadow-md hover:-translate-y-px cursor-pointer border-slate-200/60"
                  )}
                  onClick={() => hasChildren ? navigateInto(item) : null}
                >
                  {/* Icon */}
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105", ic.bg)}>
                    {hasChildren
                      ? <Folder className={cn("h-5 w-5", ic.icon)} />
                      : <FileText className={cn("h-5 w-5", ic.icon)} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 truncate">{item.categoryName}</span>
                      {item.categoryCode && (
                        <span className="hidden sm:inline-flex text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{item.categoryCode}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {hasChildren && (
                        <span className="text-xs text-slate-500">{childCount} {childCount === 1 ? "child" : "children"}</span>
                      )}
                      {item.categoryDescription && (
                        <span className="text-xs text-slate-400 truncate max-w-[200px]">{item.categoryDescription}</span>
                      )}
                    </div>
                  </div>

                  {/* Level Badge */}
                  <span className={cn("hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full", ic.badge)}>
                    {LEVEL_LABELS[Math.min(itemLevel, LEVEL_LABELS.length - 1)]}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {hasChildren && (
                      <button onClick={() => navigateInto(item)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-500" title="Browse children">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteItem(item)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Chevron for navigable items */}
                  {hasChildren && (
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Back button */}
          {breadcrumb.length > 0 && (
            <button onClick={goBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors pt-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to {breadcrumb.length === 1 ? "Root" : breadcrumb[breadcrumb.length - 2].name}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Generic Tab Content ─────────────────────────────────────────────────────
function GenericTabContent({ tabId, config }) {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const visibleFields = config.fields.filter((f) => !f.fromSession);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(config.endpoint);
      setItems(extractList(data));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => { setFormOpen(false); setEditingItem(null); setFormData({}); void loadItems(); }, [loadItems]);

  const openNew = () => {
    setEditingItem(null);
    const empty = {};
    visibleFields.forEach((f) => { empty[f.key] = f.type === "number" ? 0 : ""; });
    setFormData(empty);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const data = {};
    visibleFields.forEach((f) => { data[f.key] = item[f.key] ?? (f.type === "number" ? 0 : ""); });
    setFormData(data);
    setFormOpen(true);
  };

  const closeForm = () => { setFormOpen(false); setEditingItem(null); setFormData({}); };

  const saveItem = async () => {
    const required = config.fields.find((f) => f.required);
    if (required && !String(formData[required.key] ?? "").trim()) return;
    setSaving(true);
    try {
      const body = {};
      visibleFields.forEach((f) => {
        const val = formData[f.key];
        if (f.type === "number") body[f.key] = Number(val) || 0;
        else { const str = String(val ?? "").trim(); if (str) body[f.key] = str; }
      });
      // Auto-inject session values for fields marked with fromSession
      config.fields.filter((f) => f.fromSession).forEach((f) => {
        body[f.key] = user?.[f.fromSession] ?? null;
      });
      if (editingItem) await api.put(`${config.endpoint}/${editingItem.id}`, body);
      else await api.post(config.endpoint, body);
      await loadItems();
      closeForm();
    } finally { setSaving(false); }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete "${config.displayName(item)}"?`)) return;
    try { await api.delete(`${config.endpoint}/${item.id}`); await loadItems(); } catch { /* noop */ }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => config.columns.some((col) => String(item[col] ?? "").toLowerCase().includes(q)));
  }, [items, searchQuery, config.columns]);

  const getLabel = (key) => config.fields.find((f) => f.key === key)?.label ?? key;

  const renderCell = (item, col) => {
    const val = item[col];
    if (col === "colorHexCode" && val) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: val }} />
          <span className="font-mono text-xs">{val}</span>
        </div>
      );
    }
    if (col.toLowerCase().includes("logourl") && val) {
      return <img src={val} alt="" className="h-8 w-8 rounded-lg border border-slate-200 object-cover" />;
    }
    return val ?? <span className="text-slate-300">—</span>;
  };

  return (
    <div className="space-y-4">
      {formOpen && (
        <Card className="border-indigo-200 shadow-md ring-1 ring-indigo-100 animate-scale-in">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm">{editingItem ? "Edit" : "Add New"}</CardTitle>
              <CardDescription className="text-xs">Fill in the details below</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={closeForm} className="h-7 w-7"><X className="h-3.5 w-3.5" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleFields.map((field) => (
                <div key={field.key} className={cn("space-y-1.5", visibleFields.length <= 2 || field.key.toLowerCase().includes("description") ? "sm:col-span-2" : "")}>
                  <label className="text-xs font-medium text-slate-600">{field.label}{field.required && <span className="text-red-500"> *</span>}</label>
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={formData[field.key] ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                    placeholder={field.label}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
              <Button size="sm" onClick={saveItem} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">{TABS.find((t) => t.id === tabId)?.label}</CardTitle>
            <Badge variant="secondary" className="text-xs font-normal">{items.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 5 && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 w-44 text-xs" />
              </div>
            )}
            <Button size="sm" onClick={openNew} disabled={formOpen}><Plus className="h-3.5 w-3.5" /> Add</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/50 text-xs font-medium uppercase tracking-wider text-slate-400">
                  {config.columns.map((col) => <th key={col} className="px-4 py-3">{getLabel(col)}</th>)}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={config.columns.length + 1} className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={config.columns.length + 1} className="px-4 py-16 text-center text-sm text-slate-400">No items found</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {config.columns.map((col, idx) => (
                        <td key={col} className="px-4 py-3.5 text-slate-700">
                          {idx === 0 ? <span className="font-medium text-slate-800">{renderCell(item, col)}</span> : renderCell(item, col)}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteItem(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const [categoryItems, setCategoryItems] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const { data } = await api.get("/api/categories");
      setCategoryItems(extractList(data));
    } catch {
      setCategoryItems([]);
    } finally {
      setCatLoading(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "categories") void loadCategories(); }, [activeTab, loadCategories]);

  return (
    <div className="min-h-screen">
      <TopBar title="Master Data" subtitle="Manage brands, categories, colors, sizes and more" />

      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1.5 border-b border-slate-200/60 pb-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  activeTab === t.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === "categories" ? (
          catLoading && categoryItems.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : (
            <CategoryExplorer allItems={categoryItems} onReload={loadCategories} />
          )
        ) : (
          <GenericTabContent key={activeTab} tabId={activeTab} config={TAB_CONFIG[activeTab]} />
        )}
      </div>
    </div>
  );
}
