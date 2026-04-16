"use client";

import { useCallback, useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Image, Upload, X, Star, Package, ChevronRight, ChevronDown, Folder } from "lucide-react";
import { api } from "@/Lib/Api";
import { TopBar } from "@/Components/Layout/TopBar";
import { Button } from "@/Components/Ui/Button";

/* -- Style tokens ---------------------------------------------------------- */
const fieldLabelClass = "block text-[12px] font-medium text-slate-500 mb-1";
const inp =
  "w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 disabled:opacity-50";
const sel =
  "w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 disabled:opacity-50 cursor-pointer";
const ta =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 resize-none";

/* -- Field wrapper --------------------------------------------------------- */
function Field({ label: lbl, required, children, className = "" }) {
  return (
    <div className={className}>
      <label className={fieldLabelClass}>
        {lbl} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/* -- Category Tree --------------------------------------------------------- */
function CategoryTree({ categories, selectedId, onSelect }) {
  const [expanded, setExpanded] = useState(new Set());

  // Auto-expand to selected category on load
  useEffect(() => {
    if (selectedId && categories.length > 0) {
      const pathToSelected = [];
      const findPath = (id) => {
        const cat = categories.find(c => c.id === id);
        if (!cat) return false;
        if (cat.parentCategoryID != null) {
          pathToSelected.push(cat.parentCategoryID);
          findPath(cat.parentCategoryID);
        }
        return true;
      };
      findPath(selectedId);
      setExpanded(new Set(pathToSelected));
    }
  }, [selectedId, categories]);

  const buildTree = useCallback((parentId) => {
    return categories
      .filter(c => c.parentCategoryID === parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories]);

  const getChildCount = useCallback((id) => {
    return categories.filter(c => c.parentCategoryID === id).length;
  }, [categories]);

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const TreeNode = ({ node, depth = 0 }) => {
    const children = buildTree(node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <div>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => onSelect(node.id, node.categoryName)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="shrink-0 p-0.5 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <input
            type="radio"
            name="category-radio"
            checked={isSelected}
            onChange={() => onSelect(node.id, node.categoryName)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
          />
          <span className="text-sm flex-1">{node.categoryName}</span>
          {hasChildren && (
            <span className="text-xs text-slate-400">({children.length})</span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div>
            {children.map(child => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const roots = buildTree(null);

  return (
    <div className="border border-slate-200 rounded-lg bg-white max-h-[400px] overflow-y-auto p-2">
      {roots.map(node => (
        <TreeNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}

/* -- Image upload card ----------------------------------------------------- */
function ImageUpload({ label: lbl, required, multiple = false, name, onChange, icon: IconComp, color = "indigo", existingImage = null }) {
  const ref = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Update previews when existingImage changes
  useEffect(() => {
    if (existingImage && !hasLoaded) {
      console.log(`Loading existing image for ${name}:`, existingImage);
      setPreviews([existingImage]);
      setHasLoaded(true);
    }
  }, [existingImage, hasLoaded, name]);

  const colorClasses = {
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-600", hover: "hover:bg-indigo-100", icon: "text-indigo-500" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", hover: "hover:bg-purple-100", icon: "text-purple-500" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", hover: "hover:bg-blue-100", icon: "text-blue-500" },
    cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-600", hover: "hover:bg-cyan-100", icon: "text-cyan-500" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", hover: "hover:bg-emerald-100", icon: "text-emerald-500" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", hover: "hover:bg-amber-100", icon: "text-amber-500" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", hover: "hover:bg-rose-100", icon: "text-rose-500" },
  };
  const cc = colorClasses[color] || colorClasses.indigo;

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);
    setFiles(multiple ? newFiles : [newFiles[0]]);
    
    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => multiple ? [...prev, reader.result] : [reader.result]);
      };
      reader.readAsDataURL(file);
    });
    
    if (onChange) onChange(name, multiple ? fileList : fileList[0]);
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    if (onChange) {
      if (multiple) {
        const dt = new DataTransfer();
        newFiles.forEach((f) => dt.items.add(f));
        onChange(name, dt.files);
      } else {
        onChange(name, null);
      }
    }
  };

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {IconComp && <IconComp className={`h-4 w-4 ${cc.icon}`} />}
        <span className={`text-sm font-medium ${cc.text}`}>
          {lbl} {required && <span className="text-red-500">*</span>}
        </span>
      </div>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => ref.current && ref.current.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
          ${isDragging ? `${cc.border} ${cc.bg} scale-[1.02]` : `border-slate-200 bg-slate-50/50 ${cc.hover}`}
          ${previews.length > 0 ? 'p-3' : 'p-6'}`}
      >
        {previews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className={`p-3 rounded-xl ${cc.bg} transition-transform group-hover:scale-110`}>
              <Upload className={`h-6 w-6 ${cc.icon}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Drop {multiple ? "files" : "file"} or <span className={cc.text}>browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-2 ${multiple ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {previews.map((preview, idx) => (
              <div key={idx} className="relative group/img rounded-lg overflow-hidden border border-slate-200 bg-white">
                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
                {files[idx] && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[10px] text-white truncate">{files[idx].name}</p>
                  </div>
                )}
              </div>
            ))}
            {multiple && (
              <div
                className={`flex items-center justify-center h-24 rounded-lg border-2 border-dashed ${cc.border} ${cc.bg} ${cc.hover} transition-colors`}
              >
                <Upload className={`h-5 w-5 ${cc.icon}`} />
              </div>
            )}
          </div>
        )}
        
        <input
          ref={ref}
          type="file"
          multiple={multiple}
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

/* -- Page ------------------------------------------------------------------ */
export default function EditProductPage({ params }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const [refs, setRefs] = useState({
    brands: [], customers: [], retailers: [], allCategories: [],
    suppliers: [], merchandisers: [], sampleTypes: [],
    fabricCodes: [], washes: [], sustainabilities: [],
  });
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [refsLoading, setRefsLoading] = useState(true);

  const [form, setForm] = useState({
    styleID: "", productStyleID: "",
    styleNo: "", styleDescription: "",
    brandID: "", customerID: "", retailerID: "",
    fabricCodeID: "", mainFabrication: "",
    fabricWeight: "", fabricComposition: "", mainFabricColor: "",
    trimComposition: "", contrastTrimFabrication: "", contrastTrimColor: "",
    washID: "", sustainabilityID: "", treatmentsFinishing: "",
    supplierID: "", shipmentDate: "", orderQuantity: "", laundryDetails: "",
    merchandiserID: "", unitPrice: "20", link3D: "", shortDescription: "",
    categoryID: "", subCategoryID: "", sampleTypeID: "",
  });

  const [images, setImages] = useState({});
  const [existingImages, setExistingImages] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /* -- Load all reference data -------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const get = (url, params) =>
      api.get(url, params ? { params } : undefined)
         .catch(() => ({ data: { items: [] } }));

    (async () => {
      setRefsLoading(true);
      try {
        const [bRes, cRes, custRes, retRes, supRes, merRes, stRes, fcRes, wRes, susRes] =
          await Promise.all([
            get("/api/brands",        { page: 1, pageSize: 500 }),
            get("/api/categories"),
            get("/api/customers",     { page: 1, pageSize: 500 }),
            get("/api/retailers",     { page: 1, pageSize: 500 }),
            get("/api/suppliers",     { page: 1, pageSize: 500 }),
            get("/api/merchandisers", { page: 1, pageSize: 500 }),
            get("/api/sample-types"),
            get("/api/fabriccodes",   { page: 1, pageSize: 500 }),
            get("/api/washes",        { page: 1, pageSize: 500 }),
            get("/api/sustainability", { page: 1, pageSize: 500 }),
          ]);

        if (cancelled) return;

        const flat = Array.isArray(cRes.data) ? cRes.data : [];

        setRefs({
          brands:           bRes.data.items   ?? [],
          allCategories:    flat,
          customers:        custRes.data.items  ?? [],
          retailers:        retRes.data.items   ?? [],
          suppliers:        supRes.data.items   ?? [],
          merchandisers:    merRes.data.items   ?? [],
          sampleTypes:      Array.isArray(stRes.data) ? stRes.data : (stRes.data.items ?? []),
          fabricCodes:      fcRes.data.items   ?? [],
          washes:           wRes.data.items    ?? [],
          sustainabilities: susRes.data.items  ?? [],
        });
      } catch (e) {
        /* silent */
      } finally {
        if (!cancelled) setRefsLoading(false);
      }

      // Load existing product data for edit mode
      try {
        const { data } = await api.get(`/api/products/${productId}`);
        if (cancelled) return;
        
        console.log('=== EDIT MODE: Loading Product ===');
        console.log('Product data:', data);
        console.log('Product images:', data.productImage);
        
        setForm({
          productStyleID: data.productStyleID || "",
          styleNo: data.productStyleNo || "",
          styleDescription: data.productStyleDescription || "",
          brandID: String(data.brandID || ""),
          customerID: String(data.customerID || ""),
          retailerID: String(data.retailerID || ""),
          fabricCodeID: String(data.fabricCodeID || ""),
          mainFabrication: data.mainFabrication || "",
          fabricWeight: data.fabricWeight || "",
          fabricComposition: data.fabricComposition || "",
          mainFabricColor: data.mainFabricColor || "",
          trimComposition: data.trimComposition || "",
          contrastTrimFabrication: data.contrastTrimFabrication || "",
          contrastTrimColor: data.contrastTrimColor || "",
          washID: String(data.washID || ""),
          sustainabilityID: String(data.sustainabilityCertificationID || ""),
          treatmentsFinishing: data.treatmentsFinishing || "",
          supplierID: String(data.supplierID || ""),
          shipmentDate: data.shipmentDate ? data.shipmentDate.split('T')[0] : "",
          orderQuantity: String(data.orderQuantity || ""),
          laundryDetails: data.laundryDetails || "",
          merchandiserID: String(data.merchandiserID || ""),
          unitPrice: String(data.unitPrice || "20"),
          link3D: data.link3D || "",
          shortDescription: data.productShortDescription || "",
          categoryID: String(data.categoryID || ""),
          subCategoryID: String(data.subCategoryID || ""),
          sampleTypeID: String(data.sampleTypeID || ""),
        });
        
        if (data.category) {
          setSelectedCategoryName(data.category.categoryName);
        }
        
        // Set existing images
        if (data.productImage) {
          const companyId = data.companyID || 1;
          const imgBase = `/img/products/${companyId}/`;
          const imgs = {
            front: data.productImage.productFrontImage ? imgBase + data.productImage.productFrontImage : null,
            back: data.productImage.productBackImage ? imgBase + data.productImage.productBackImage : null,
            leftSide: data.productImage.productLeftImage ? imgBase + data.productImage.productLeftImage : null,
            rightSide: data.productImage.productRightImage ? imgBase + data.productImage.productRightImage : null,
            zoomed: data.productImage.productZoomImage ? imgBase + data.productImage.productZoomImage : null,
          };
          console.log('Setting existing images:', imgs);
          setExistingImages(imgs);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError("Failed to load product data");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /* -- Category selection handler ----------------------------------------- */
  const handleCategorySelect = (id, name) => {
    setForm(f => ({ ...f, categoryID: String(id), subCategoryID: "" }));
    setSelectedCategoryName(name);
  };

  /* -- Helpers ------------------------------------------------------------- */
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImageChange = (name, file) =>
    setImages((i) => ({ ...i, [name]: file }));

  const handleFabricCodeChange = (e) => {
    const id = e.target.value;
    const fc = refs.fabricCodes.find((f) => String(f.id) === id);
    setForm((prev) => ({
      ...prev,
      fabricCodeID:      id,
      mainFabrication:   fc ? (fc.fabricWeave       || prev.mainFabrication)   : prev.mainFabrication,
      fabricWeight:      fc ? (fc.fabricWeight      || prev.fabricWeight)       : prev.fabricWeight,
      fabricComposition: fc ? (fc.fabricComposition || prev.fabricComposition)  : prev.fabricComposition,
      mainFabricColor:   fc ? (fc.fabricColor        || prev.mainFabricColor)   : prev.mainFabricColor,
    }));
  };

  /* -- Submit -------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.styleNo.trim()) { setError("Style Number is required."); return; }
    setError(null);
    setSaving(true);

    try {
      const n = (v) => (v ? Number(v) : null);

      const body = {
        ProductStyleNo:                form.styleNo.trim(),
        ProductStyleID:                form.productStyleID         || null,
        ProductStyleDescription:       form.styleDescription       || null,
        ProductShortDescription:       form.shortDescription       || null,
        BrandID:                       n(form.brandID),
        CustomerID:                    n(form.customerID),
        RetailerID:                    n(form.retailerID),
        CategoryID:                    n(form.categoryID),
        SubCategoryID:                 n(form.subCategoryID),
        SampleTypeID:                  n(form.sampleTypeID),
        SupplierID:                    n(form.supplierID),
        MerchandiserID:                n(form.merchandiserID),
        FabricCodeID:                  n(form.fabricCodeID),
        MainFabrication:               form.mainFabrication        || null,
        FabricWeight:                  form.fabricWeight            || null,
        FabricComposition:             form.fabricComposition       || null,
        MainFabricColor:               form.mainFabricColor         || null,
        TrimComposition:               form.trimComposition         || null,
        ContrastTrimFabrication:       form.contrastTrimFabrication || null,
        ContrastTrimColor:             form.contrastTrimColor       || null,
        WashID:                        n(form.washID),
        TreatmentsFinishing:           form.treatmentsFinishing     || null,
        SustainabilityCertificationID: n(form.sustainabilityID),
        LaundryDetails:                form.laundryDetails          || null,
        ShipmentDate:                  form.shipmentDate             || null,
        OrderQuantity:                 n(form.orderQuantity),
        UnitPrice:                     form.unitPrice ? Number(form.unitPrice) : null,
        Link3D:                        form.link3D                  || null,
      };

      await api.put(`/api/products/${productId}`, body);

      /* Upload images */
      const typeMap = {
        front: "Front", back: "Back",
        leftSide: "LeftSide", rightSide: "RightSide",
        zoomed: "Zoomed",
      };

      for (const [key, apiType] of Object.entries(typeMap)) {
        const fileOrFiles = images[key];
        if (!fileOrFiles) {
          console.log(`Skipping ${apiType}: no file selected`);
          continue;
        }
        
        const fileList = fileOrFiles instanceof FileList
          ? Array.from(fileOrFiles) : [fileOrFiles];
          
        console.log(`Uploading ${apiType}:`, fileList.length, 'file(s)');
        
        for (const f of fileList) {
          if (!f) {
            console.warn(`Skipping null file for ${apiType}`);
            continue;
          }
          
          console.log(`File details: name=${f.name}, size=${f.size}, type=${f.type}`);
          
          const fd = new FormData();
          fd.append("file", f);
          
          try {
            console.log(`Attempting upload: ${apiType}`, {
              url: `/api/files/product-image/${productId}?imageType=${apiType}`,
              fileName: f.name,
              fileSize: f.size,
              fileType: f.type
            });
            
            const res = await api.post(`/api/files/product-image/${productId}?imageType=${apiType}`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(`✓ ${apiType} uploaded successfully:`, res.data);
          } catch (uploadErr) {
            console.log('=== UPLOAD ERROR DETAILS ===');
            console.log('Error object:', uploadErr);
            console.log('Error type:', typeof uploadErr);
            console.log('Error keys:', Object.keys(uploadErr));
            console.log('Has response?', !!uploadErr.response);
            console.log('Response:', uploadErr.response);
            console.log('Status:', uploadErr.response?.status);
            console.log('Data:', uploadErr.response?.data);
            console.log('Message:', uploadErr.message);
            console.log('Code:', uploadErr.code);
            console.log('Config:', uploadErr.config);
            console.log('===========================');
          }
        }
      }

      router.push("/products");
    } catch (err) {
      const msg = err && err.response && err.response.data && err.response.data.message;
      setError(msg || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  /* -- Render -------------------------------------------------------------- */
  return (
    <div className="min-h-full bg-white">
      <TopBar title="Edit Product" />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-0 min-h-[calc(100vh-64px)]">

          {/* == LEFT ========================================================== */}
          <div className="col-span-7 border-r border-slate-100 p-6 overflow-y-auto space-y-4">

            <div className="flex items-center gap-2 mb-4">
              <Link href="/products" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Products
              </Link>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Row 1: Product Style ID / Style No */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product Style ID">
                <input
                  className={`${inp} bg-slate-50 text-indigo-600 font-semibold cursor-not-allowed`}
                  value={form.productStyleID || "Auto-generating..."}
                  readOnly
                  title="System-generated Product Style ID"
                />
              </Field>
              <Field label="Style Number" required>
                <input className={inp} placeholder="Special Character is Not Allowed Except -" value={form.styleNo} onChange={setField("styleNo")} />
              </Field>
            </div>

            {/* Style Description */}
            <Field label="Style Description" required>
              <input className={inp} placeholder="Style Description" value={form.styleDescription} onChange={setField("styleDescription")} />
            </Field>

            {/* Brand / Customer / Retailer */}
            <div className="grid grid-cols-3 gap-4">
              <Field label="Brand" required>
                <select className={sel} disabled={refsLoading} value={form.brandID} onChange={setField("brandID")}>
                  <option value="">Select</option>
                  {refs.brands.map((b) => <option key={b.id} value={b.id}>{b.brandName || b.name}</option>)}
                </select>
              </Field>
              <Field label="Customer">
                <select className={sel} disabled={refsLoading} value={form.customerID} onChange={setField("customerID")}>
                  <option value="">Select</option>
                  {refs.customers.map((c) => <option key={c.id} value={c.id}>{c.customerName || c.name}</option>)}
                </select>
              </Field>
              <Field label="Retailer">
                <select className={sel} disabled={refsLoading} value={form.retailerID} onChange={setField("retailerID")}>
                  <option value="">Select</option>
                  {refs.retailers.map((r) => <option key={r.id} value={r.id}>{r.retailerName || r.name}</option>)}
                </select>
              </Field>
            </div>

            {/* Fabric Code / Main Fabrication */}
            <div className="grid grid-cols-12 gap-4">
              <Field label="Fabric Code (if any)" className="col-span-4">
                <select className={sel} disabled={refsLoading} value={form.fabricCodeID} onChange={handleFabricCodeChange}>
                  <option value="">Select</option>
                  {refs.fabricCodes.map((f) => <option key={f.id} value={f.id}>{f.fabricCode}</option>)}
                </select>
              </Field>
              <Field label="Main Fabrication" className="col-span-8">
                <input
                  className={`${inp}${form.fabricCodeID && form.mainFabrication ? " bg-indigo-50/50 border-indigo-200" : ""}`}
                  placeholder="Main Fabrication"
                  value={form.mainFabrication}
                  onChange={setField("mainFabrication")}
                />
              </Field>
            </div>

            {/* Fabric Weight / Composition / Color */}
            <div className="grid grid-cols-3 gap-4">
              <Field label="Fabric Weight">
                <input
                  className={`${inp}${form.fabricCodeID && form.fabricWeight ? " bg-indigo-50/50 border-indigo-200" : ""}`}
                  placeholder="Fabric Weight"
                  value={form.fabricWeight}
                  onChange={setField("fabricWeight")}
                />
              </Field>
              <Field label="Fabric Composition">
                <input
                  className={`${inp}${form.fabricCodeID && form.fabricComposition ? " bg-indigo-50/50 border-indigo-200" : ""}`}
                  placeholder="Fabric Composition"
                  value={form.fabricComposition}
                  onChange={setField("fabricComposition")}
                />
              </Field>
              <Field label="Main Fabric Color">
                <input
                  className={`${inp}${form.fabricCodeID && form.mainFabricColor ? " bg-indigo-50/50 border-indigo-200" : ""}`}
                  placeholder="Main Fabric Color"
                  value={form.mainFabricColor}
                  onChange={setField("mainFabricColor")}
                />
              </Field>
            </div>

            {/* col-4 grid: Trim → Unit Price */}
            <div className="grid grid-cols-12 gap-4">

              <Field label="Trim Composition" className="col-span-4">
                <input className={inp} placeholder="Composition" value={form.trimComposition} onChange={setField("trimComposition")} />
              </Field>

              <Field label="Contrast/Trim Fabrication" className="col-span-4">
                <input className={inp} placeholder="Contrast/Trim Fabrication" value={form.contrastTrimFabrication} onChange={setField("contrastTrimFabrication")} />
              </Field>

              <Field label="Contrast Trim Color" className="col-span-4">
                <input className={inp} placeholder="Contrast Trim Color" value={form.contrastTrimColor} onChange={setField("contrastTrimColor")} />
              </Field>

              <Field label="Wash" className="col-span-4">
                <select className={sel} disabled={refsLoading} value={form.washID} onChange={setField("washID")}>
                  <option value="">Select</option>
                  {refs.washes.map((w) => <option key={w.id} value={w.id}>{w.washName}</option>)}
                </select>
              </Field>

              <Field label="Sustainability" className="col-span-4">
                <select className={sel} disabled={refsLoading} value={form.sustainabilityID} onChange={setField("sustainabilityID")}>
                  <option value="">Select</option>
                  {refs.sustainabilities.map((s) => <option key={s.id} value={s.id}>{s.certificationName}</option>)}
                </select>
              </Field>

              <Field label="Treatments/Finishing (if any)" className="col-span-4">
                <input className={inp} placeholder="Treatments/Finishing" value={form.treatmentsFinishing} onChange={setField("treatmentsFinishing")} />
              </Field>

              <Field label="Supplier" className="col-span-4">
                <select className={sel} disabled={refsLoading} value={form.supplierID} onChange={setField("supplierID")}>
                  <option value="">Select</option>
                  {refs.suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplierName || s.name}</option>)}
                </select>
              </Field>

              <Field label="Shipment Date" className="col-span-4">
                <input type="date" className={inp} value={form.shipmentDate} onChange={setField("shipmentDate")} />
              </Field>

              <Field label="Order Quantity" className="col-span-4">
                <input type="number" className={inp} placeholder="Order Quantity" value={form.orderQuantity} onChange={setField("orderQuantity")} />
              </Field>

              <Field label="Laundry Details" className="col-span-4">
                <input className={inp} placeholder="Laundry Details" value={form.laundryDetails} onChange={setField("laundryDetails")} />
              </Field>

              <Field label="Merchandiser" className="col-span-4">
                <select className={sel} disabled={refsLoading} value={form.merchandiserID} onChange={setField("merchandiserID")}>
                  <option value="">Select</option>
                  {refs.merchandisers.map((m) => (
                    <option key={m.id} value={m.id}>{m.merchandiserName || m.name || `Merchandiser ${m.id}`}</option>
                  ))}
                </select>
              </Field>

              <Field label="Unit Price $" className="col-span-4">
                <input type="number" step="0.01" min="0" className={inp} value={form.unitPrice} onChange={setField("unitPrice")} />
              </Field>

            </div>

            {/* 3D Link */}
            <Field label="Insert 3D link">
              <input className={inp} placeholder="https://example.com/3d-view" value={form.link3D} onChange={setField("link3D")} />
            </Field>

            {/* Short Description */}
            <Field label="Product Short Description">
              <textarea
                className={`${ta} min-h-[120px]`}
                placeholder="Enter product description..."
                value={form.shortDescription}
                onChange={setField("shortDescription")}
              />
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button type="submit" disabled={saving} className="min-w-[120px]">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : "Update Product"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/products">Cancel</Link>
              </Button>
            </div>
          </div>

          {/* == RIGHT ========================================================= */}
          <div className="col-span-5 bg-white p-6 overflow-y-auto space-y-4 border-l border-slate-100">

            <Field label="Category" required>
              <div className="text-xs text-slate-500 mb-2">
                {selectedCategoryName || "Click a category below to select"}
              </div>
              <CategoryTree
                categories={refs.allCategories}
                selectedId={form.categoryID ? parseInt(form.categoryID) : null}
                onSelect={handleCategorySelect}
              />
            </Field>

            <Field label="Sample Type">
              <select className={sel} disabled={refsLoading} value={form.sampleTypeID} onChange={setField("sampleTypeID")}>
                <option value="">Collection</option>
                {refs.sampleTypes.map((s) => <option key={s.id} value={s.id}>{s.sampleTypeName || s.name}</option>)}
              </select>
            </Field>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Image className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-700">Product Images</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload label="Front Image" required name="front" onChange={handleImageChange} icon={Package} color="purple" existingImage={existingImages.front} />
                <ImageUpload label="Back Image" required name="back" onChange={handleImageChange} icon={Package} color="blue" existingImage={existingImages.back} />
                <ImageUpload label="Left Side" required name="leftSide" onChange={handleImageChange} icon={Package} color="cyan" existingImage={existingImages.leftSide} />
                <ImageUpload label="Right Side" required name="rightSide" onChange={handleImageChange} icon={Package} color="emerald" existingImage={existingImages.rightSide} />
                <ImageUpload label="Zoomed Image" required name="zoomed" onChange={handleImageChange} icon={Image} color="amber" existingImage={existingImages.zoomed} />
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}