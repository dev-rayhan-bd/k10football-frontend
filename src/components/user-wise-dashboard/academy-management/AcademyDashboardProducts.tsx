"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconPlus,
  IconEye,
  IconPencil,
  IconTrash,
  IconDotsVertical,
  IconArrowRight,
  IconBuildingStore,
} from "@tabler/icons-react";
import {
  useGetProductsQuery,
  useGetProductCategoriesQuery,
} from "@/redux/features/shop/shopApi";
import { IProductItem } from "@/types/shop.type";
import {
  ProductDetailsModal,
  EditProductModal,
  DeleteProductModal,
  CreateProductModal,
} from "./product-store/index";

export const AcademyDashboardProducts = () => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedProductForView, setSelectedProductForView] = useState<IProductItem | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<IProductItem | null>(null);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<IProductItem | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Queries
  const { data: categoriesResponse } = useGetProductCategoriesQuery();
  const categoriesList = categoriesResponse?.data || [];

  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
  } = useGetProductsQuery({ limit: 3 });

  const products: IProductItem[] = productsResponse?.data?.products || [];

  return (
    <div className="bg-[#111111] rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white font-orbitron">
            Product Store
          </h2>
          <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
            Match highlights &amp; training
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/academy/management/product-store"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white px-4 py-3 sm:py-2.5 rounded-xl transition-all"
          >
            <span>View All</span>
            <IconArrowRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex shrink-0 justify-center items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] border border-transparent text-[10px] font-black uppercase tracking-widest text-white px-4 py-3 sm:px-6 sm:py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(227,27,35,0.2)] cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product Grid / Skeleton / Empty State */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`product-skeleton-${idx}`}
              className="bg-white/2 border border-white/5 rounded-3xl p-4 flex flex-col gap-4 animate-pulse"
            >
              <div className="aspect-4/3 w-full bg-white/10 rounded-2xl shimmer" />
              <div className="flex flex-col gap-3">
                <div className="h-5 w-3/4 bg-white/10 rounded shimmer" />
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="h-6 w-20 bg-white/10 rounded shimmer" />
                  <div className="h-8 w-24 bg-white/10 rounded-xl shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-14 px-6 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center text-center gap-3">
          <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
            <IconBuildingStore size={28} />
          </div>
          <p className="text-base font-bold text-white">No Products In Store</p>
          <p className="text-xs text-white/50 max-w-sm">
            Add jerseys, match kits, football boots, and official accessories to your academy store.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#ff2d35] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(227,27,35,0.2)]"
          >
            <IconPlus size={16} />
            <span>Add First Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const rawImage =
              product.productImage ||
              product.image ||
              product.images?.[0] ||
              "/placeholder_img.jpg";

            const isInStock =
              product.stockStatus === "IN_STOCK" ||
              (product.stockQuantity !== undefined && product.stockQuantity > 0);

            const regularPrice =
              product.regularPrice !== undefined
                ? product.regularPrice
                : product.price !== undefined
                ? product.price
                : 0;

            const salePrice = product.salePrice;
            const hasDiscount =
              salePrice !== undefined && salePrice > 0 && salePrice < regularPrice;

            const productName =
              product.productName || product.name || product.title || "Product";
            const categoryName = product.category || "General";
            const productId = product.slug || product._id || String(product.id || "");

            return (
              <div
                key={productId}
                className="bg-white/2 border border-white/5 rounded-3xl p-4 flex flex-col gap-4 group/card hover:border-white/15 transition-all relative overflow-hidden"
              >
                {/* Image Container with Badges */}
                <div
                  onClick={() => setSelectedProductForView(product)}
                  className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black/40 cursor-pointer"
                >
                  <Image
                    src={rawImage}
                    alt={productName}
                    fill
                    className="object-contain group-hover/card:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.srcset = "";
                      target.src = "/placeholder_img.jpg";
                    }}
                  />

                  {/* Actions Dropdown Button (top right) */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === productId ? null : productId);
                      }}
                      className="size-7 rounded-full bg-black/70 hover:bg-black/90 border border-white/15 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition-all shadow-md backdrop-blur-xs"
                      aria-label="Product actions"
                    >
                      <IconDotsVertical size={14} />
                    </button>
                    {activeDropdownId === productId && (
                      <>
                        <div
                          className="fixed inset-0 z-20 cursor-default"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(null);
                          }}
                        />
                        <div className="absolute right-0 mt-1 w-34 bg-[#161616] border border-white/15 rounded-xl shadow-2xl py-1.5 z-30 flex flex-col">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              setSelectedProductForView(product);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-bold uppercase text-white/80 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <IconEye size={13} className="text-zinc-400" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              setSelectedProductForEdit(product);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-bold uppercase text-white/80 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <IconPencil size={13} className="text-blue-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              setSelectedProductForDelete(product);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-bold uppercase text-destructive hover:text-destructive hover:bg-destructive/10 transition-all flex items-center gap-2 cursor-pointer border-t border-white/5"
                          >
                            <IconTrash size={13} className="text-destructive" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Badges on bottom of image */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center pointer-events-none z-10">
                    <span className="bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[9px] font-black text-white/90 uppercase tracking-widest border border-white/10">
                      {categoryName}
                    </span>
                    {isInStock ? (
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                        {product.stockQuantity !== undefined
                          ? `${product.stockQuantity} IN STOCK`
                          : "IN STOCK"}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-rose-400 bg-rose-500/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Area */}
                <div className="flex flex-col gap-3 min-w-0">
                  <h3
                    onClick={() => setSelectedProductForView(product)}
                    className="text-lg font-bold text-white uppercase tracking-tight group-hover/card:text-[#E31B23] transition-colors font-orbitron truncate cursor-pointer"
                  >
                    {productName}
                  </h3>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-baseline gap-2">
                      {hasDiscount ? (
                        <>
                          <span className="text-2xl font-black text-[#E31B23] font-orbitron">
                            ${Number(salePrice).toFixed(0)}
                          </span>
                          <span className="text-xs font-bold text-white/40 line-through font-orbitron">
                            ${Number(regularPrice).toFixed(0)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-[#E31B23] font-orbitron">
                          ${Number(regularPrice).toFixed(0)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProductForView(product)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <ProductDetailsModal
        isOpen={!!selectedProductForView}
        onClose={() => setSelectedProductForView(null)}
        product={selectedProductForView}
        onEdit={(p) => {
          setSelectedProductForView(null);
          setSelectedProductForEdit(p);
        }}
        onDelete={(p) => {
          setSelectedProductForView(null);
          setSelectedProductForDelete(p);
        }}
      />

      <EditProductModal
        isOpen={!!selectedProductForEdit}
        onClose={() => setSelectedProductForEdit(null)}
        product={selectedProductForEdit}
      />

      <DeleteProductModal
        isOpen={!!selectedProductForDelete}
        onClose={() => setSelectedProductForDelete(null)}
        product={selectedProductForDelete}
      />
    </div>
  );
};

export default AcademyDashboardProducts;
