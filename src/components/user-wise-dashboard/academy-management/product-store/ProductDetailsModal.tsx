/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { IProductItem } from "@/types/shop.type";
import {
  IconCheck,
  IconX,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProductItem | null;
  onEdit?: (product: IProductItem) => void;
  onDelete?: (product: IProductItem) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
}) => {
  const images =
    product?.images && product.images.length > 0
      ? product.images
      : product?.productImage
      ? [product.productImage]
      : product?.image
      ? [product.image]
      : ["/placeholder_img.jpg"];

  const [activeImage, setActiveImage] = useState<string>(images[0] || "/placeholder_img.jpg");

  useEffect(() => {
    setActiveImage(images[0] || "/placeholder_img.jpg");
  }, [product]);

  if (!product) return null;

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
  const hasDiscount = salePrice !== undefined && salePrice > 0 && salePrice < regularPrice;

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={onClose}
      title={product.productName || product.name || product.title || "Product Details"}
      subtitle={`Category: ${product.category || "General"} • SKU: ${product.sku || "N/A"}`}
      maxWidth="max-w-4xl"
      showBackButton
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(product);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E31B23]/30 text-xs font-bold uppercase tracking-wider text-[#E31B23] hover:bg-[#E31B23]/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <IconTrash size={15} />
                <span>Delete</span>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <IconPencil size={15} />
                <span>Edit Product</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Top: Image Gallery & Key Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Gallery Area */}
          <div className="flex flex-col gap-3">
            <div className="aspect-4/3 rounded-3xl overflow-hidden bg-black/60 relative border border-white/10">
              <Image
                fill
                src={activeImage}
                alt={product.productName || product.name || "Product"}
                className="object-contain"
                onError={() => setActiveImage("/placeholder_img.jpg")}
              />
            </div>

            {/* Thumbnail selector if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`size-16 rounded-xl overflow-hidden relative shrink-0 border-2 transition-all cursor-pointer ${
                      activeImage === img ? "border-[#E31B23]" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      fill
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder_img.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Stock Details */}
          <div className="flex flex-col gap-5">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/5 border border-white/15 px-3 py-1 rounded-full text-[10px] font-black text-white/80 uppercase tracking-widest">
                {product.category}
              </span>
              {isInStock ? (
                <span className="bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <IconCheck size={12} strokeWidth={3} />
                  {product.stockQuantity !== undefined ? `${product.stockQuantity} Units In Stock` : "In Stock"}
                </span>
              ) : (
                <span className="bg-[#E31B23]/15 border border-[#E31B23]/30 text-[#E31B23] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <IconX size={12} strokeWidth={3} />
                  Out of Stock
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-[#E31B23] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Featured
                </span>
              )}
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-white/2 border border-white/10">
              {hasDiscount ? (
                <>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                      Sale Price
                    </span>
                    <span className="text-3xl font-black text-[#E31B23] font-orbitron">
                      ${Number(salePrice).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                      Regular
                    </span>
                    <span className="text-lg font-bold text-white/40 line-through">
                      ${Number(regularPrice).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                    Price
                  </span>
                  <span className="text-3xl font-black text-[#E31B23] font-orbitron">
                    ${Number(regularPrice).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Available Sizes */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-white/60">
                  Available Sizes
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-bold"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Colors */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-white/60">
                  Available Colors
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SKU and Stock Specifications */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/2 border border-white/5">
                <span className="text-[10px] font-bold uppercase text-white/40 block">SKU Code</span>
                <span className="text-xs font-black text-white mt-0.5 block">{product.sku || "N/A"}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/2 border border-white/5">
                <span className="text-[10px] font-bold uppercase text-white/40 block">Max Order</span>
                <span className="text-xs font-black text-white mt-0.5 block">
                  {product.maxOrderQuantity ? `${product.maxOrderQuantity} units` : "No limit"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-5 rounded-2xl bg-white/2 border border-white/10 flex flex-col gap-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-white/80 font-orbitron">
            Product Description
          </h4>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {product.productDescription || product.description || "No description provided for this product."}
          </p>
        </div>
      </div>
    </DashboardModal>
  );
};

export default ProductDetailsModal;
