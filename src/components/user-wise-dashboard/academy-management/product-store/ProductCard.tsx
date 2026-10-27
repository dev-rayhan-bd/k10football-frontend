"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IProductItem } from "@/types/shop.type";
import { IconEye, IconPencil, IconTrash } from "@tabler/icons-react";

interface ProductCardProps {
  product: IProductItem;
  onViewDetails: (product: IProductItem) => void;
  onEdit?: (product: IProductItem) => void;
  onDelete?: (product: IProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const rawImage =
    product.productImage ||
    product.image ||
    product.images?.[0] ||
    "/placeholder_img.jpg";

  const [imgSrc, setImgSrc] = useState<string>(rawImage || "/placeholder_img.jpg");

  // Keep image in sync if product prop updates
  useEffect(() => {
    setImgSrc(rawImage || "/placeholder_img.jpg");
  }, [rawImage]);

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

  const productName = product.productName || product.name || product.title || "Product";
  const categoryName = product.category || "General";

  return (
    <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-4 md:p-6 flex flex-col gap-4 md:gap-5 hover:border-white/25 transition-all shadow-xl group relative overflow-hidden min-w-0">
      {/* Product Image Area */}
      <div 
        onClick={() => onViewDetails(product)}
        className="aspect-4/3 rounded-2xl overflow-hidden bg-black/40 relative group-hover:scale-[1.02] transition-transform duration-500 w-full cursor-pointer"
      >
        <Image
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={imgSrc || "/placeholder_img.jpg"}
          alt={productName}
          className="object-cover"
          onError={() => {
            setImgSrc("/placeholder_img.jpg");
          }}
        />

        {/* Category Badge & Featured */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-white/90 uppercase tracking-widest border border-white/10">
            {categoryName}
          </span>
          {product.isFeatured && (
            <span className="bg-[#E31B23]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
              Featured
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isInStock ? (
            <span className="bg-[#4ADE80]/15 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-[#4ADE80] uppercase tracking-widest border border-[#4ADE80]/30 shadow-sm">
              {product.stockQuantity !== undefined ? `${product.stockQuantity} in stock` : "In Stock"}
            </span>
          ) : (
            <span className="bg-[#E31B23]/15 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-[#E31B23] uppercase tracking-widest border border-[#E31B23]/30 shadow-sm">
              Out of stock
            </span>
          )}
        </div>

        {/* Quick action buttons overlay on image hover */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="size-10 rounded-xl bg-black/70 hover:bg-black border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
            title="View Details"
          >
            <IconEye size={18} />
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="size-10 rounded-xl bg-[#E31B23]/80 hover:bg-[#E31B23] border border-[#E31B23] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Edit Product"
            >
              <IconPencil size={18} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
              className="size-10 rounded-xl bg-white/10 hover:bg-[#E31B23] border border-white/20 hover:border-[#E31B23] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Delete Product"
            >
              <IconTrash size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-3 min-w-0">
        <div>
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-base md:text-lg font-black uppercase text-white font-orbitron leading-tight truncate hover:text-white/80 transition-colors cursor-pointer"
          >
            {productName}
          </h3>
          {product.sku && (
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">
              SKU: <span className="text-white/60">{product.sku}</span>
            </p>
          )}
        </div>

        {/* Sizes Preview */}
        {product.availableSizes && product.availableSizes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 mr-1">
              Sizes:
            </span>
            {product.availableSizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/5 border border-white/10 text-white/70"
              >
                {size}
              </span>
            ))}
            {product.availableSizes.length > 5 && (
              <span className="text-[9px] text-white/40 font-bold">
                +{product.availableSizes.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price & Action Button */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 mt-auto">
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <p className="text-xl md:text-2xl font-black text-[#E31B23] font-orbitron leading-none">
                  ${Number(salePrice).toFixed(2)}
                </p>
                <p className="text-xs font-bold text-white/40 line-through leading-none">
                  ${Number(regularPrice).toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-xl md:text-2xl font-black text-[#E31B23] font-orbitron leading-none">
                ${Number(regularPrice).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Edit Product"
              >
                <IconPencil size={15} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="size-8 rounded-lg bg-white/5 hover:bg-[#E31B23]/20 border border-white/10 hover:border-[#E31B23]/30 text-white/70 hover:text-[#E31B23] flex items-center justify-center transition-all cursor-pointer"
                title="Delete Product"
              >
                <IconTrash size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <IconEye size={13} />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
