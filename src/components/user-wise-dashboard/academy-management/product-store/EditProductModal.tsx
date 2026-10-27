/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconDeviceFloppy,
  IconChevronDown,
  IconAlertCircle,
  IconLoader2,
  IconUpload,
  IconTrash,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { useUpdateProductMutation } from "@/redux/features/shop/shopApi";
import { IProductItem, IProductCategoryItem } from "@/types/shop.type";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProductItem | null;
  categoriesList: IProductCategoryItem[];
}

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const COMMON_COLORS = ["BLACK", "WHITE", "RED", "BLUE", "GREEN", "NAVY", "YELLOW"];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categoriesList,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  // Form State
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minStockLevel, setMinStockLevel] = useState("5");
  const [maxOrderQuantity, setMaxOrderQuantity] = useState("10");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Custom size/color input
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [customColorInput, setCustomColorInput] = useState("");

  // Image State
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Inline Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill Form when modal opens or product changes
  useEffect(() => {
    if (!product || !isOpen) return;

    setProductName(product.productName || product.name || product.title || "");
    setCategory(product.category || "");
    setSku(product.sku || "");
    setRegularPrice(
      product.regularPrice !== undefined
        ? String(product.regularPrice)
        : product.price !== undefined
        ? String(product.price)
        : ""
    );
    setSalePrice(product.salePrice !== undefined ? String(product.salePrice) : "");
    setProductDescription(product.productDescription || product.description || "");
    setStockQuantity(product.stockQuantity !== undefined ? String(product.stockQuantity) : "0");
    setMinStockLevel(product.minStockLevel !== undefined ? String(product.minStockLevel) : "5");
    setMaxOrderQuantity(product.maxOrderQuantity !== undefined ? String(product.maxOrderQuantity) : "10");

    setSelectedSizes(
      Array.isArray(product.availableSizes) && product.availableSizes.length > 0
        ? product.availableSizes
        : ["M", "L", "XL"]
    );

    setSelectedColors(
      Array.isArray(product.availableColors) && product.availableColors.length > 0
        ? product.availableColors
        : ["BLACK", "WHITE"]
    );

    setIsActive(product.isActive !== undefined ? Boolean(product.isActive) : true);
    setIsFeatured(product.isFeatured !== undefined ? Boolean(product.isFeatured) : false);

    setCurrentImageUrl(
      product.productImage || product.image || product.images?.[0] || "/placeholder_img.jpg"
    );
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setErrors({});
  }, [product, isOpen]);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size must not exceed 5MB" }));
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Only image files (JPG, PNG, WebP) are allowed" }));
      return;
    }

    setSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.image;
      return rest;
    });
  };

  const handleRemoveNewImage = () => {
    setSelectedImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Toggle Size
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    if (errors.sizes) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.sizes;
        return rest;
      });
    }
  };

  // Add Custom Size
  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput("");
  };

  // Toggle Color
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    if (errors.colors) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.colors;
        return rest;
      });
    }
  };

  // Add Custom Color
  const handleAddCustomColor = () => {
    const trimmed = customColorInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!selectedColors.includes(trimmed)) {
      setSelectedColors((prev) => [...prev, trimmed]);
    }
    setCustomColorInput("");
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!productName.trim()) {
      newErrors.productName = "Product name is required";
    } else if (productName.trim().length < 3) {
      newErrors.productName = "Product name must be at least 3 characters";
    }

    if (!category.trim()) {
      newErrors.category = "Please select a category";
    }

    const regPriceNum = parseFloat(regularPrice);
    if (!regularPrice.trim()) {
      newErrors.regularPrice = "Regular price is required";
    } else if (isNaN(regPriceNum) || regPriceNum <= 0) {
      newErrors.regularPrice = "Regular price must be greater than 0";
    }

    if (salePrice.trim()) {
      const salePriceNum = parseFloat(salePrice);
      if (isNaN(salePriceNum) || salePriceNum < 0) {
        newErrors.salePrice = "Sale price cannot be negative";
      } else if (!isNaN(regPriceNum) && salePriceNum > regPriceNum) {
        newErrors.salePrice = "Sale price cannot exceed regular price";
      }
    }

    const stockNum = parseInt(stockQuantity, 10);
    if (!stockQuantity.trim()) {
      newErrors.stockQuantity = "Stock quantity is required";
    } else if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stockQuantity = "Stock quantity must be 0 or greater";
    }

    if (minStockLevel.trim()) {
      const minStockNum = parseInt(minStockLevel, 10);
      if (isNaN(minStockNum) || minStockNum < 0) {
        newErrors.minStockLevel = "Min stock must be 0 or greater";
      }
    }

    if (maxOrderQuantity.trim()) {
      const maxOrderNum = parseInt(maxOrderQuantity, 10);
      if (isNaN(maxOrderNum) || maxOrderNum < 1) {
        newErrors.maxOrderQuantity = "Max order quantity must be at least 1";
      }
    }

    if (selectedSizes.length === 0) {
      newErrors.sizes = "Please select at least one available size";
    }

    if (selectedColors.length === 0) {
      newErrors.colors = "Please select at least one available color";
    }

    if (!productDescription.trim()) {
      newErrors.productDescription = "Product description is required";
    } else if (productDescription.trim().length < 10) {
      newErrors.productDescription = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !product) return;

    const slugOrId = product.slug || product._id || (product.id ? String(product.id) : "");
    if (!slugOrId) return;

    const dataPayload = {
      productName: productName.trim(),
      category: category.trim(),
      sku: sku.trim() || undefined,
      regularPrice: parseFloat(regularPrice),
      salePrice: salePrice.trim() ? parseFloat(salePrice) : undefined,
      productDescription: productDescription.trim(),
      availableSizes: selectedSizes,
      availableColors: selectedColors,
      stockQuantity: parseInt(stockQuantity, 10),
      minStockLevel: minStockLevel.trim() ? parseInt(minStockLevel, 10) : 5,
      maxOrderQuantity: maxOrderQuantity.trim() ? parseInt(maxOrderQuantity, 10) : 10,
      isActive,
      isFeatured,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(dataPayload));
    if (selectedImageFile) {
      formData.append("productImage", selectedImageFile);
    }

    try {
      const res = await updateProduct({
        slugOrId,
        data: formData,
      }).unwrap();

      if (res?.success || !res?.error) {
        onClose();
      }
    } catch {
      // Handled in RTK Query onQueryStarted with ErrorToast
    }
  };

  if (!isOpen || !product) return null;

  const displayImage = imagePreviewUrl || currentImageUrl || "/placeholder_img.jpg";

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Product"
      subtitle={`Update details for "${product.productName || product.name || "Product"}"`}
      maxWidth="max-w-4xl"
      showBackButton
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg shadow-[#E31B23]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
        {/* Top: Image Section & Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Upload & Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
              Product Image
            </label>
            <div className="bg-[#111111] border border-white/15 rounded-2xl p-3 flex flex-col gap-3">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-black/60 relative border border-white/10 group">
                <Image
                  fill
                  src={displayImage}
                  alt={productName || "Product"}
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder_img.jpg";
                  }}
                />
                {selectedImageFile && (
                  <button
                    type="button"
                    onClick={handleRemoveNewImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#E31B23] text-white hover:bg-[#C2181F] transition-all cursor-pointer shadow-md"
                    title="Remove selected image"
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/25 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <IconUpload size={15} />
                <span>{selectedImageFile ? "Change Image" : "Upload New Image"}</span>
              </button>

              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest text-center">
                JPG, PNG, WebP up to 5MB
              </p>
              {errors.image && (
                <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
                  <IconAlertCircle size={12} /> {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* Basic Details: Name, Category, SKU */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Product Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Product Name <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  if (errors.productName) {
                    setErrors((prev) => {
                      const rest = { ...prev };
                      delete rest.productName;
                      return rest;
                    });
                  }
                }}
                placeholder="e.g., Official Home Jersey 2024"
                className={`w-full bg-[#111111] border rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all ${
                  errors.productName ? "border-[#E31B23]" : "border-white/15 focus:border-white/30"
                }`}
              />
              {errors.productName && (
                <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
                  <IconAlertCircle size={12} /> {errors.productName}
                </p>
              )}
            </div>

            {/* Category & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Category <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category) {
                        setErrors((prev) => {
                          const rest = { ...prev };
                          delete rest.category;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full bg-[#111111] border rounded-xl py-3 px-4 text-sm text-white appearance-none focus:outline-none transition-all cursor-pointer ${
                      errors.category ? "border-[#E31B23]" : "border-white/15 focus:border-white/30"
                    }`}
                  >
                    <option value="" disabled className="text-white/40">
                      Select category
                    </option>
                    {categoriesList
                      .filter((c) => c.slug?.toLowerCase() !== "all")
                      .map((c) => (
                        <option key={c.slug} value={c.name} className="bg-[#111111] text-white">
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    size={16}
                  />
                </div>
                {errors.category && (
                  <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
                    <IconAlertCircle size={12} /> {errors.category}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g., JER-HOME-2024"
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all uppercase"
                />
              </div>
            </div>

            {/* Featured & Active Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="size-4 accent-[#E31B23] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Featured Product</span>
                  <span className="text-[10px] text-white/40">Highlight in store showcases</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 accent-[#E31B23] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Active for Sale</span>
                  <span className="text-[10px] text-white/40">Visible to buyers in shop</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="flex flex-col gap-3 bg-[#0A0A0A] border border-white/15 rounded-2xl p-5">
          <h4 className="text-sm font-black uppercase text-white font-orbitron tracking-wide">
            Pricing
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Regular Price ($) <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={regularPrice}
                onChange={(e) => {
                  setRegularPrice(e.target.value);
                  if (errors.regularPrice) {
                    setErrors((prev) => {
                      const rest = { ...prev };
                      delete rest.regularPrice;
                      return rest;
                    });
                  }
                }}
                placeholder="89.99"
                className={`w-full bg-[#111111] border rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all ${
                  errors.regularPrice ? "border-[#E31B23]" : "border-white/15 focus:border-white/30"
                }`}
              />
              {errors.regularPrice && (
                <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
                  <IconAlertCircle size={12} /> {errors.regularPrice}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Sale Price ($) <span className="text-white/40 text-[9px]">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => {
                  setSalePrice(e.target.value);
                  if (errors.salePrice) {
                    setErrors((prev) => {
                      const rest = { ...prev };
                      delete rest.salePrice;
                      return rest;
                    });
                  }
                }}
                placeholder="69.99"
                className={`w-full bg-[#111111] border rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all ${
                  errors.salePrice ? "border-[#E31B23]" : "border-white/15 focus:border-white/30"
                }`}
              />
              {errors.salePrice && (
                <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
                  <IconAlertCircle size={12} /> {errors.salePrice}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5 bg-[#0A0A0A] border border-white/15 rounded-2xl p-5">
          <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
            Product Description <span className="text-[#E31B23]">*</span>
          </label>
          <textarea
            rows={3}
            value={productDescription}
            onChange={(e) => {
              setProductDescription(e.target.value);
              if (errors.productDescription) {
                setErrors((prev) => {
                  const rest = { ...prev };
                  delete rest.productDescription;
                  return rest;
                });
              }
            }}
            placeholder="Official high-performance home match jersey engineered with breathable moisture-wicking fabric..."
            className={`w-full bg-[#111111] border rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all resize-none ${
              errors.productDescription ? "border-[#E31B23]" : "border-white/15 focus:border-white/30"
            }`}
          />
          {errors.productDescription && (
            <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
              <IconAlertCircle size={12} /> {errors.productDescription}
            </p>
          )}
        </div>

        {/* Sizes Selection */}
        <div className="flex flex-col gap-3 bg-[#0A0A0A] border border-white/15 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
              Available Sizes <span className="text-[#E31B23]">*</span>
            </label>
            <span className="text-[10px] text-white/40 font-bold uppercase">
              {selectedSizes.length} Selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_SIZES.map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#E31B23] border-[#E31B23] text-white shadow-md shadow-[#E31B23]/25"
                      : "bg-[#111111] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  {size}
                </button>
              );
            })}

            {/* Custom sizes that aren't in common list */}
            {selectedSizes
              .filter((s) => !COMMON_SIZES.includes(s))
              .map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#E31B23] border border-[#E31B23] text-white shadow-md shadow-[#E31B23]/25 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{size}</span>
                  <IconX size={12} />
                </button>
              ))}
          </div>

          {/* Add Custom Size Input */}
          <div className="flex items-center gap-2 max-w-xs mt-1">
            <input
              type="text"
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSize();
                }
              }}
              placeholder="Custom size (e.g. 4XL)"
              className="bg-[#111111] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 flex-1 uppercase"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <IconPlus size={14} />
              <span>Add</span>
            </button>
          </div>

          {errors.sizes && (
            <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
              <IconAlertCircle size={12} /> {errors.sizes}
            </p>
          )}
        </div>

        {/* Colors Selection */}
        <div className="flex flex-col gap-3 bg-[#0A0A0A] border border-white/15 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
              Available Colors <span className="text-[#E31B23]">*</span>
            </label>
            <span className="text-[10px] text-white/40 font-bold uppercase">
              {selectedColors.length} Selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_COLORS.map((col) => {
              const isSelected = selectedColors.includes(col);
              return (
                <button
                  type="button"
                  key={col}
                  onClick={() => toggleColor(col)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#E31B23] border-[#E31B23] text-white shadow-md shadow-[#E31B23]/25"
                      : "bg-[#111111] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  {col}
                </button>
              );
            })}

            {/* Custom colors */}
            {selectedColors
              .filter((c) => !COMMON_COLORS.includes(c))
              .map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => toggleColor(col)}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#E31B23] border border-[#E31B23] text-white shadow-md shadow-[#E31B23]/25 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{col}</span>
                  <IconX size={12} />
                </button>
              ))}
          </div>

          {/* Add Custom Color Input */}
          <div className="flex items-center gap-2 max-w-xs mt-1">
            <input
              type="text"
              value={customColorInput}
              onChange={(e) => setCustomColorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomColor();
                }
              }}
              placeholder="Custom color (e.g. GOLD)"
              className="bg-[#111111] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 flex-1 uppercase"
            />
            <button
              type="button"
              onClick={handleAddCustomColor}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <IconPlus size={14} />
              <span>Add</span>
            </button>
          </div>

          {errors.colors && (
            <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
              <IconAlertCircle size={12} /> {errors.colors}
            </p>
          )}
        </div>

        {/* Inventory Controls */}
        <div className="flex flex-col gap-3 bg-[#0A0A0A] border border-white/15 rounded-2xl p-5">
          <h4 className="text-sm font-black uppercase text-white font-orbitron tracking-wide">
            Inventory & Stock
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Stock Quantity <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => {
                  setStockQuantity(e.target.value);
                  if (errors.stockQuantity) {
                    setErrors((prev) => {
                      const rest = { ...prev };
                      delete rest.stockQuantity;
                      return rest;
                    });
                  }
                }}
                placeholder="45"
                className={`w-full bg-[#111111] border rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all ${
                  errors.stockQuantity ? "border-[#E31B23]" : "border-white/15 focus:border-white/30"
                }`}
              />
              {errors.stockQuantity && (
                <p className="text-[11px] text-[#E31B23] font-bold flex items-center gap-1">
                  <IconAlertCircle size={12} /> {errors.stockQuantity}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Min Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                placeholder="5"
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Max Order Quantity
              </label>
              <input
                type="number"
                min="1"
                value={maxOrderQuantity}
                onChange={(e) => setMaxOrderQuantity(e.target.value)}
                placeholder="10"
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
          </div>
        </div>
      </form>
    </DashboardModal>
  );
};

export default EditProductModal;
