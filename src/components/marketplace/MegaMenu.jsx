"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { api } from "@/Lib/Api";

/* --- Build full tree from flat API list ------------------------------------
 * The flat endpoint returns all categories with parentCategoryID.
 * We build the tree client-side — 100% reliable regardless of backend issues.
 */
function buildTree(flat) {
  const map = {};
  flat.forEach((n) => { map[n.id] = { ...n, children: [] }; });
  const roots = [];
  flat.forEach((n) => {
    if (n.parentCategoryID == null) {
      roots.push(map[n.id]);
    } else if (map[n.parentCategoryID]) {
      map[n.parentCategoryID].children.push(map[n.id]);
    }
  });
  // Sort each level by sortOrder then name
  function sort(nodes) {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.categoryName.localeCompare(b.categoryName));
    nodes.forEach((n) => sort(n.children));
  }
  sort(roots);
  return roots;
}

/* --- Recursive node renderer -----------------------------------------------
 *
 * Tree structure by category:
 *
 * KNIT / SWEATER:
 *   Nav (L0) → Column = L1 (Women/Men/Kid>Girl/Boy/Baby)
 *               Bold header = L2 (Tops / Bottom)
 *               Regular link = L3 (T-Shirt / Polo / Pant …)
 *
 * WOVEN:
 *   Nav (L0) → Column = L1 (Denim / Non-Denim)
 *               Section label = L2 (Women / Men / Kid…)
 *               Bold header = L3 (Tops / Bottom)
 *               Regular link = L4 (Jeans / Chino …)
 *
 * LOOKBOOK:
 *   Nav (L0) → Column = L1 (Women / Men / Kid)
 *               Regular link = L2 (Trend Book / Mood Board …)
 *
 * depth=0 → first child-level inside a column
 * depth=1 → second child-level
 * depth=2+ → leaf
 */
function CategoryNode({ node, depth }) {
  const hasKids = node.children.length > 0;

  if (depth === 0 && hasKids) {
    /* Bold group heading (e.g. Tops, Bottom, Women, Trend Book) */
    return (
      <div className="mb-5">
        <p className="text-[13px] font-bold text-slate-900 mb-1.5 leading-snug">
          {node.categoryName}
        </p>
        <ul>
          {node.children.map((child) => (
            <li key={child.id}>
              <CategoryNode node={child} depth={1} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (depth === 1 && hasKids) {
    /* Sub-heading for deep trees – e.g. Woven: Tops/Bottom under Women */
    return (
      <div className="mb-3">
        <p className="text-[12px] font-semibold text-slate-600 mb-1 leading-snug">
          {node.categoryName}
        </p>
        <ul className="pl-2 border-l border-slate-100">
          {node.children.map((child) => (
            <li key={child.id}>
              <CategoryNode node={child} depth={2} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* Leaf link — depth 0 with no kids, depth 1 with no kids, or depth 2+ */
  return (
    <Link
      href="#"
      className="block py-[3px] text-[13px] text-slate-500 hover:text-indigo-600 transition-colors leading-snug"
    >
      {node.categoryName}
    </Link>
  );
}

/* --- Main component ------------------------------------------------------ */
export default function MegaMenu() {
  const [roots, setRoots] = useState([]);           // Level-0 nav items
  const [activeId, setActiveId] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    /* Fetch FLAT list → build tree client-side */
    api
      .get("/api/categories")
      .then((r) => {
        const tree = buildTree(r.data);
        setRoots(tree);
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback((id) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  if (!roots.length) return null;

  const active = roots.find((r) => r.id === activeId);

  return (
    <>
      {/* ══ Desktop Nav Triggers ══ */}
      <nav className="hidden lg:flex items-stretch">
        {roots.map((cat) => (
          <div
            key={cat.id}
            className="relative flex items-stretch"
          >
            <button
              onClick={() => toggle(cat.id)}
              className={`flex items-center gap-1 px-4 text-[13px] font-semibold tracking-wide transition-colors duration-150 ${
                activeId === cat.id
                  ? "text-indigo-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.categoryName.toUpperCase()}
              <ChevronDown
                className={`h-3 w-3 ml-0.5 transition-transform duration-200 ${
                  activeId === cat.id
                    ? "rotate-180 text-indigo-500"
                    : "text-slate-400"
                }`}
              />
            </button>
            {activeId === cat.id && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-indigo-600 rounded-full" />
            )}
          </div>
        ))}
      </nav>

      {/* ══ Desktop Mega Panel — rendered in <body> via portal so CSS transforms
           on the header's centering wrapper don't break fixed positioning ══ */}
      {mounted && active && active.children.length > 0 && createPortal(
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            width: "100vw",
            zIndex: 100,
          }}
        >
          {/* Solid white full-width panel */}
          <div
            className="animate-slide-down"
            style={{
              width: "100vw",
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px -8px rgba(0,0,0,0.14)",
            }}
          >
            {/* Center columns horizontally */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "28px 40px",
              }}
            >
              <div style={{ display: "flex" }}>
                {active.children.map((col, idx) => (
                  <div
                    key={col.id}
                    style={{
                      width: 260,
                      flexShrink: 0,
                      paddingLeft: idx === 0 ? 0 : 32,
                      paddingRight: 32,
                      borderLeft: idx > 0 ? "1px solid #f1f5f9" : "none",
                    }}
                  >
                    {/* Column header = Level-1 name */}
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        marginBottom: 14,
                        paddingBottom: 10,
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      {col.categoryName}
                    </p>

                    {col.children.length > 0 ? (
                      <div
                        className="styled-scroll"
                        style={{ maxHeight: "calc(100vh - 180px)", overflowY: "auto" }}
                      >
                        {col.children.map((node) => (
                          <CategoryNode key={node.id} node={node} depth={0} />
                        ))}
                      </div>
                    ) : (
                      <Link
                        href="#"
                        className="text-[13px] text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        {col.categoryName}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Backdrop overlay behind page content */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: -1,
              backgroundColor: "rgba(0,0,0,0.06)",
            }}
            onClick={() => setActiveId(null)}
          />
        </div>,
        document.body
      )}

      {/* ══ Mobile Accordion ══ */}
      <div className="lg:hidden space-y-0.5">
        {roots.map((cat) => {
          const isOpen = mobileExpanded === cat.id;
          return (
            <div key={cat.id}>
              <button
                onClick={() => setMobileExpanded(isOpen ? null : cat.id)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-[13px] font-semibold tracking-wide text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/50 transition-colors"
              >
                {cat.categoryName.toUpperCase()}
                {cat.children.length > 0 && (
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
              {isOpen && cat.children.length > 0 && (
                <MobileAccordion items={cat.children} depth={0} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* --- Mobile recursive accordion ------------------------------------------ */
function MobileAccordion({ items, depth }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div
      className={`space-y-0.5 animate-fade-in ${
        depth === 0 ? "pl-3" : depth === 1 ? "pl-5" : "pl-7"
      }`}
    >
      {items.map((item) => {
        const hasKids = item.children.length > 0;
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors hover:text-indigo-600 ${
                depth === 0
                  ? "text-[12px] font-bold text-slate-700"
                  : depth === 1
                  ? "text-[12px] font-semibold text-slate-600"
                  : "text-[11px] text-slate-500"
              }`}
            >
              {item.categoryName}
              {hasKids && (
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
            {isOpen && hasKids && (
              <MobileAccordion items={item.children} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}
