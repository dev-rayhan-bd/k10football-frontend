"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconPlus,
  IconChevronDown,
  IconUpload,
  IconBox,
  IconSearch,
  IconFilter,
  IconX,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconTag,
  IconCash,
  IconShoppingCart,
} from "@tabler/icons-react";
import {
  useGetProductsQuery,
  useGetProductCategoriesQuery,
} from "@/redux/features/shop/shopApi";
import { IProductItem } from "@/types/shop.type";
import {
  ProductCard,
  ProductDetailsModal,
  EditProductModal,
  DeleteProductModal,
  CreateProductModal,
} from "./product-store/index";
import OrdersTab from "./product-store/OrdersTab";

type ActiveTab = "products" | "orders";

export const ProductStoreManagement = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<IProductItem | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<IProductItem | null>(null);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<IProductItem | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [page, setPage] = useState(1);

  // Debounce search term by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Categories
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useGetProductCategoriesQuery();
  const categoriesList = categoriesResponse?.data || [];

  // Fetch Products with filters
  const { data: productsResponse, isLoading: isLoadingProducts } = useGetProductsQuery({
    category: selectedCategory && selectedCategory.toLowerCase() !== "all" ? selectedCategory : undefined,
    stockStatus: selectedStockStatus || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit: 20,
  });

  const products = productsResponse?.data?.products || [];
  const stats = productsResponse?.data?.stats;
  const meta = productsResponse?.data?.meta;

  const hasActiveFilters = Boolean(
    searchTerm ||
    (selectedCategory && selectedCategory.toLowerCase() !== "all") ||
    selectedStockStatus ||
    minPrice ||
    maxPrice
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategory("all");
    setSelectedStockStatus("");
    setMinPrice("");
    setMaxPrice("");
    setShowPriceFilter(false);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="min-w-0 w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none truncate md:whitespace-normal">
            Product Store
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 wrap-break-word">
            Manage store inventory and orders
          </p>
        </div>
        {activeTab === "products" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
          >
            <IconPlus size={20} className="shrink-0" />
            <span className="text-sm font-bold uppercase tracking-widest truncate">Add Product</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-[#111111] border border-white/10 rounded-2xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "products"
              ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/20"
              : "text-white/50 hover:text-white"
          }`}
        >
          <IconBox size={15} />
          Products
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/20"
              : "text-white/50 hover:text-white"
          }`}
        >
          <IconShoppingCart size={15} />
          Orders
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <div className="bg-[#0A0A0A] rounded-3xl md:rounded-4xl border border-white/5 p-5 md:p-8 flex flex-col gap-5 shadow-2xl min-w-0 w-full">
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase text-white font-orbitron">Order Management</h2>
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mt-1">Customer orders from your product store</p>
          </div>
          <OrdersTab />
        </div>
      )}

      {/* Products Tab Content */}
      {activeTab === "products" && (isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-4 flex items-center justify-between shadow-lg"
            >
              <div className="flex flex-col gap-2">
                <div className="h-3 w-20 bg-white/5 rounded" />
                <div className="h-7 w-12 bg-white/10 rounded-md" />
              </div>
              <div className="size-10 rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Products</p>
              <p className="text-2xl font-black text-white font-orbitron mt-0.5">{stats.totalProducts ?? 0}</p>
            </div>
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
              <IconBox size={20} />
            </div>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">In Stock</p>
              <p className="text-2xl font-black text-[#4ADE80] font-orbitron mt-0.5">{stats.inStockCount ?? 0}</p>
            </div>
            <div className="size-10 rounded-xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center text-[#4ADE80]">
              <IconTag size={20} />
            </div>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Out of Stock</p>
              <p className="text-2xl font-black text-[#E31B23] font-orbitron mt-0.5">{stats.outOfStockCount ?? 0}</p>
            </div>
            <div className="size-10 rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23]">
              <IconAlertCircle size={20} />
            </div>
          </div>
        </div>
      ) : null)}

      {/* Main Container — Products tab only */}
      {activeTab === "products" && <div className="bg-[#0A0A0A] rounded-3xl md:rounded-4xl border border-white/5 p-5 md:p-8 flex flex-col gap-6 md:gap-8 shadow-2xl min-w-0 w-full">
        {/* Top Controls: Title & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase text-white font-orbitron">
              All Products
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mt-1">
              {meta?.total !== undefined ? `${meta.total} products available` : "Store Catalog"}
            </p>
          </div>

          {/* Interactive Filter Controls matching API Query Specs */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[180px]">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-2 pl-10 pr-8 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <IconX size={14} />
                </button>
              )}
            </div>

            {/* Category Dropdown (Populated from /shop/products/categories) */}
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-[#111111] border border-white/15 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-white/80 hover:text-white focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-[#111111] text-white">
                  All Categories
                </option>
                {categoriesList
                  .filter((c) => c.slug?.toLowerCase() !== "all")
                  .map((c) => (
                    <option key={c.slug} value={c.name} className="bg-[#111111] text-white">
                      {c.name}
                    </option>
                  ))}
              </select>
              <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>

            {/* Stock Status Dropdown (IN_STOCK / OUT_OF_STOCK) */}
            <div className="relative shrink-0">
              <select
                value={selectedStockStatus}
                onChange={(e) => {
                  setSelectedStockStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-[#111111] border border-white/15 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-white/80 hover:text-white focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#111111] text-white">
                  All Stock
                </option>
                <option value="IN_STOCK" className="bg-[#111111] text-[#4ADE80]">
                  In Stock
                </option>
                <option value="OUT_OF_STOCK" className="bg-[#111111] text-[#E31B23]">
                  Out of Stock
                </option>
              </select>
              <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>

            {/* Price Range Filter Toggle Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowPriceFilter((prev) => !prev)}
                className={`border rounded-xl py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  minPrice || maxPrice
                    ? "bg-[#E31B23]/15 border-[#E31B23] text-white"
                    : "bg-[#111111] border-white/15 text-white/80 hover:text-white"
                }`}
              >
                <IconCash size={14} />
                <span>
                  {minPrice || maxPrice
                    ? `$${minPrice || 0} - $${maxPrice || "∞"}`
                    : "Price Range"}
                </span>
                <IconChevronDown size={14} />
              </button>

              {/* Price Filter Popover */}
              {showPriceFilter && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#111111] border border-white/20 rounded-2xl p-4 shadow-2xl z-30 flex flex-col gap-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    Filter by Price Range
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">
                        Min ($)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min={0}
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(e.target.value);
                          setPage(1);
                        }}
                        className="w-full bg-white/5 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-white/40 block mb-1">
                        Max ($)
                      </label>
                      <input
                        type="number"
                        placeholder="100"
                        min={0}
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(e.target.value);
                          setPage(1);
                        }}
                        className="w-full bg-white/5 border border-white/15 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                        setPage(1);
                      }}
                      className="text-[10px] font-bold text-white/40 hover:text-white uppercase transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPriceFilter(false)}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#E31B23] hover:text-[#C2181F] underline transition-all shrink-0 cursor-pointer px-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/10 p-5 flex flex-col gap-4 animate-pulse"
              >
                <div className="aspect-4/3 rounded-2xl bg-white/5 w-full" />
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-3/4 bg-white/5 rounded-lg" />
                  <div className="h-3 w-1/3 bg-white/5 rounded-md" />
                  <div className="h-6 w-1/2 bg-white/5 rounded-lg mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-12 text-center flex flex-col items-center justify-center gap-3">
            <IconBox size={36} className="text-white/20" />
            <p className="text-white text-base font-bold uppercase tracking-wider font-orbitron">
              No Products Found
            </p>
            <p className="text-white/40 text-xs max-w-md">
              {hasActiveFilters
                ? "No products match the selected filters. Try clearing some filters or searching for another term."
                : "The product store catalog is currently empty. Add your first item using the button above."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-2 px-5 py-2.5 rounded-xl border border-white/15 text-xs text-white hover:bg-white/5 font-bold transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          /* Products Grid with Fallback Image Handling */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onViewDetails={(p) => setSelectedProductForView(p)}
                onEdit={(p) => setSelectedProductForEdit(p)}
                onDelete={(p) => setSelectedProductForDelete(p)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
              Showing page <span className="text-white font-bold">{meta.page}</span> of{" "}
              <span className="text-white font-bold">{meta.totalPages}</span> ({meta.total} products)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Previous page"
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Next page"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>}

      {/* Product Details View Modal */}
      <ProductDetailsModal
        isOpen={Boolean(selectedProductForView)}
        product={selectedProductForView}
        onClose={() => setSelectedProductForView(null)}
        onEdit={(p) => {
          setSelectedProductForView(null);
          setSelectedProductForEdit(p);
        }}
        onDelete={(p) => {
          setSelectedProductForView(null);
          setSelectedProductForDelete(p);
        }}
      />

      {/* Create Product Modal (POST {{baseUrl}}/shop/products) */}
      <CreateProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Product Modal (PATCH {{baseUrl}}/shop/products/:slugOrId) */}
      <EditProductModal
        isOpen={Boolean(selectedProductForEdit)}
        product={selectedProductForEdit}
        onClose={() => setSelectedProductForEdit(null)}
      />

      {/* Delete Product Modal (DELETE {{baseUrl}}/shop/products/:slugOrId) */}
      <DeleteProductModal
        isOpen={Boolean(selectedProductForDelete)}
        product={selectedProductForDelete}
        onClose={() => setSelectedProductForDelete(null)}
      />
    </div>
  );
};

export default ProductStoreManagement;

