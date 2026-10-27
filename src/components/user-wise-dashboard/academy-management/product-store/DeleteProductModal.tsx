/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { IconLoader2, IconTrash, IconX, IconAlertTriangle } from "@tabler/icons-react";
import { IProductItem } from "@/types/shop.type";
import { useDeleteProductMutation } from "@/redux/features/shop/shopApi";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProductItem | null;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [deleteProduct, { isLoading }] = useDeleteProductMutation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !product) return null;

  const slugOrId = product.slug || product._id || (product.id ? String(product.id) : "");
  const productName = product.productName || product.name || product.title || "Product";
  const imageSrc =
    product.productImage || product.image || product.images?.[0] || "/placeholder_img.jpg";

  const handleDelete = async () => {
    if (!slugOrId) return;
    try {
      const res = await deleteProduct(slugOrId).unwrap();
      if (res?.success || !res?.error) {
        onClose();
      }
    } catch {
      // Handled in shopApi onQueryStarted with ErrorToast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0D0D0D] border border-white/15 rounded-3xl p-6 sm:p-7 flex flex-col gap-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 size-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <IconX size={16} />
        </button>

        {/* Header & Warning */}
        <div className="flex items-start gap-4 pr-6">
          <div className="size-12 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/25 flex items-center justify-center text-[#E31B23] shrink-0">
            <IconAlertTriangle size={24} />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-orbitron tracking-wide">
              Delete Product
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Product Snapshot Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="size-14 rounded-xl overflow-hidden bg-black/40 relative shrink-0 border border-white/10">
            <Image
              fill
              src={imageSrc}
              alt={productName}
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder_img.jpg";
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-black uppercase text-white truncate font-orbitron">
              {productName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-white/50 uppercase">
                {product.category || "General"}
              </span>
              {product.sku && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {product.sku}
                  </span>
                </>
              )}
            </div>
            {product.regularPrice !== undefined && (
              <p className="text-xs font-black text-[#E31B23] mt-1">
                ${Number(product.salePrice || product.regularPrice).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDelete}
            className="px-6 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#E31B23]/25 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <IconLoader2 size={15} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <IconTrash size={15} />
                <span>Delete Product</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
