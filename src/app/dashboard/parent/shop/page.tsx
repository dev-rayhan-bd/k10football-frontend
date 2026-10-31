"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  IconShoppingCart,
  IconTrash,
  IconPlus,
  IconMinus,
  IconLoader2,
  IconPackage,
  IconMapPin,
  IconX,
} from "@tabler/icons-react";
import {
  useGetProductsQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  useClearCartMutation,
  useCreateOrderMutation,
} from "@/redux/features/shop/shopApi";
import { IProductItem, ICartItem } from "@/types/shop.type";

const ParentShop = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("Flat 4B, Road 12, London, UK");
  const [addressError, setAddressError] = useState("");

  // Queries
  const { data: productsResponse, isLoading: isProductsLoading, isError: isProductsError, refetch: refetchProducts } =
    useGetProductsQuery({
      category: activeCategory === "All" ? undefined : activeCategory,
      limit: 50,
    });

  const { data: cartResponse, isLoading: isCartLoading } = useGetCartQuery();

  // Mutations
  const [addToCart] = useAddToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();
  const [clearCart, { isLoading: isClearingCart }] = useClearCartMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  const products: IProductItem[] = useMemo(() => {
    return productsResponse?.data?.products || [];
  }, [productsResponse]);

  const categories = useMemo(() => {
    const apiCategories = productsResponse?.data?.stats?.categories?.map((c) => c.name) || [];
    const combined = ["All", ...apiCategories, "Jerseys", "Kits", "Accessories"];
    return Array.from(new Set(combined));
  }, [productsResponse]);

  const cartItems: ICartItem[] = useMemo(() => {
    return cartResponse?.data?.items || [];
  }, [cartResponse]);

  const cartCount = cartResponse?.data?.itemCount ?? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal =
    cartResponse?.data?.subtotal ??
    cartItems.reduce((total, item) => {
      const price = item.price ?? 0;
      return total + price * (item.quantity || 1);
    }, 0);

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = async (product: IProductItem) => {
    const availableSizes =
      product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes : ["M"];
    const size = selectedSizes[product._id] || availableSizes[0] || "M";

    try {
      setAddingProductId(product._id);
      await addToCart({
        productId: product._id,
        quantity: 1,
        size,
      }).unwrap();
    } catch {
      // Handled via onQueryStarted toast in shopApi
    } finally {
      setAddingProductId(null);
    }
  };

  const handleUpdateQuantity = async (item: ICartItem, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(item._id);
      return;
    }
    try {
      setUpdatingItemId(item._id);
      await updateCartItem({
        itemId: item._id,
        body: { quantity: newQty, size: item.size },
      }).unwrap();
    } catch {
      // Handled in shopApi
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setDeletingItemId(itemId);
      await deleteCartItem(itemId).unwrap();
    } catch {
      // Handled in shopApi
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
    } catch {
      // Handled in shopApi
    }
  };

  const handleProceedToPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!shippingAddress.trim()) {
      setAddressError("Please enter your shipping address");
      return;
    }
    setAddressError("");

    try {
      const res = await createOrder({
        shippingAddress: shippingAddress.trim(),
      }).unwrap();

      if (res?.data?.checkoutUrl) {
        if (res.data._id) {
          localStorage.setItem("last_order_id", res.data._id);
        }
        if (res.data.orderNumber) {
          localStorage.setItem("last_order_number", res.data.orderNumber);
        }
        if (res.data.stripeSessionId || res.data.sessionId) {
          localStorage.setItem(
            "last_session_id",
            res.data.stripeSessionId || res.data.sessionId || ""
          );
        }

        // Redirect directly to Stripe checkout session URL
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error("Could not obtain checkout session URL. Please try again.");
      }
    } catch {
      // Handled in shopApi onQueryStarted
    }
  };

  const getItemDetails = (item: ICartItem) => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const prodObj = typeof item.productId === "object" && item.productId !== null ? item.productId : item.product;
    const name = prodObj?.productName || (prodObj as any)?.name || (prodObj as any)?.title || "Academy Item";
    const image =
      prodObj?.productImage ||
      (prodObj?.images && prodObj.images[0]) ||
      (prodObj as any)?.image ||
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=400";
    const category = prodObj?.category || "";
    const unitPrice = item.price ?? prodObj?.salePrice ?? prodObj?.regularPrice ?? 0;
    return { name, image, category, unitPrice };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            Academy <span className="text-primary italic">Shop</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 leading-relaxed">
            Buy jerseys, kits, and accessories for your youth player
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Products List (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Filters */}
          <div className="flex gap-1 sm:gap-2 bg-black/40 border border-white/5 p-1 rounded-xl w-full overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-1 sm:flex-none text-center cursor-pointer",
                  activeCategory === cat
                    ? "bg-[#E31B23] text-white"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Error State */}
          {isProductsError && !isProductsLoading && (
            <div className="p-8 rounded-3xl bg-black/40 border border-white/5 text-center flex flex-col items-center justify-center gap-3">
              <IconPackage className="size-12 text-muted-foreground" />
              <p className="text-sm font-semibold text-white">Failed to load shop products</p>
              <Button variant="outline" size="sm" onClick={() => refetchProducts()}>
                Retry
              </Button>
            </div>
          )}

          {/* Skeleton Loading State */}
          {isProductsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#0D0D0D]/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between"
                >
                  <Skeleton className="aspect-4/3 w-full bg-white/5" />
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-3/4 bg-white/10" />
                      <Skeleton className="h-3 w-1/4 bg-white/5" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16 bg-white/10" />
                      <Skeleton className="h-6 w-24 bg-white/5" />
                    </div>
                    <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty Products State */}
          {!isProductsLoading && !isProductsError && products.length === 0 && (
            <div className="p-12 rounded-3xl bg-[#0D0D0D]/40 border border-white/5 text-center flex flex-col items-center justify-center gap-3">
              <IconPackage className="size-12 text-muted-foreground" />
              <p className="text-sm font-semibold text-white">No products found in this category</p>
              <p className="text-xs text-muted-foreground">Please check back soon or browse another category</p>
            </div>
          )}

          {/* Products Grid */}
          {!isProductsLoading && !isProductsError && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((prod) => {
                const availableSizes =
                  prod.availableSizes && prod.availableSizes.length > 0
                    ? prod.availableSizes
                    : ["S", "M", "L", "XL"];
                const currentSize = selectedSizes[prod._id] || availableSizes[0] || "M";
                const isInStock =
                  prod.stockStatus === "IN_STOCK" || (prod.stockQuantity !== undefined && prod.stockQuantity > 0);
                const displayPrice = prod.salePrice ?? prod.regularPrice ?? prod.price ?? 0;
                const hasDiscount =
                  prod.salePrice !== undefined &&
                  prod.regularPrice !== undefined &&
                  prod.salePrice < prod.regularPrice;
                const imageSrc =
                  prod.productImage ||
                  (prod.images && prod.images[0]) ||
                  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=400";
                const isAdding = addingProductId === prod._id;

                return (
                  <div
                    key={prod._id}
                    className="bg-[#0D0D0D]/40 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between group"
                  >
                    <div className="aspect-4/3 w-full bg-neutral-900 relative overflow-hidden">
                      <Image
                        src={imageSrc}
                        alt={prod.productName || "Product image"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      {!isInStock && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                          <span className="text-xs font-black uppercase tracking-widest text-destructive">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight truncate">
                          {prod.productName}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                          {prod.category}
                        </p>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-white font-orbitron">
                            ${displayPrice.toFixed(2)}
                          </span>
                          {hasDiscount && prod.regularPrice && (
                            <span className="text-xs text-muted-foreground line-through font-orbitron">
                              ${prod.regularPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {prod.category?.toLowerCase() !== "accessories" && availableSizes.length > 0 && isInStock && (
                          <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5 flex-wrap">
                            {availableSizes.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleSizeSelect(prod._id, sz)}
                                className={cn(
                                  "size-6 rounded-md text-[10px] font-bold transition-all flex items-center justify-center",
                                  currentSize === sz
                                    ? "bg-white text-black font-black"
                                    : "text-muted-foreground hover:text-white"
                                )}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={!isInStock || isAdding}
                        onClick={() => handleAddToCart(prod)}
                        className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isAdding ? (
                          <>
                            <IconLoader2 size={14} className="animate-spin" /> Adding...
                          </>
                        ) : (
                          <>
                            <IconShoppingCart size={14} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D0D0D]/40 border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between h-fit min-h-125 min-w-0">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-black uppercase text-white font-orbitron flex items-center gap-2">
                <IconShoppingCart className="text-primary" /> Shopping Cart
              </h2>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    disabled={isClearingCart}
                    onClick={handleClearCart}
                    className="text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    title="Clear entire cart"
                  >
                    {isClearingCart ? (
                      <IconLoader2 size={12} className="animate-spin text-destructive" />
                    ) : (
                      <IconTrash size={12} />
                    )}
                    Clear
                  </button>
                )}
                <Badge className="bg-primary text-black font-black font-orbitron">
                  {cartCount}
                </Badge>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
              {isCartLoading && (
                <div className="flex flex-col gap-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-3 rounded-xl bg-black/20 border border-white/5 items-center"
                    >
                      <Skeleton className="size-10 rounded-lg bg-white/10" />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-3/4 bg-white/10" />
                        <Skeleton className="h-2 w-1/2 bg-white/5" />
                      </div>
                      <Skeleton className="h-4 w-12 bg-white/10" />
                    </div>
                  ))}
                </div>
              )}

              {!isCartLoading &&
                cartItems.map((item) => {
                  const details = getItemDetails(item);
                  const isUpdating = updatingItemId === item._id;
                  const isDeleting = deletingItemId === item._id;

                  return (
                    <div
                      key={item._id}
                      className="flex gap-3 p-3 rounded-xl bg-black/20 border border-white/5 items-center justify-between"
                    >
                      <div className="flex gap-3 items-center min-w-0 flex-1">
                        <div className="size-10 rounded-lg overflow-hidden relative shrink-0 bg-neutral-900 border border-white/5">
                          <Image
                            src={details.image}
                            alt={details.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{details.name}</h4>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5 truncate">
                            {details.category !== "Accessories" && item.size ? `Size: ${item.size} • ` : ""}
                            ${details.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-1 border border-white/5">
                          <button
                            type="button"
                            disabled={isUpdating || isDeleting}
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
                            title="Decrease quantity"
                          >
                            <IconMinus size={12} />
                          </button>
                          <span className="text-[11px] font-bold text-white min-w-4 text-center font-orbitron">
                            {isUpdating ? <IconLoader2 size={10} className="animate-spin inline" /> : item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isUpdating || isDeleting}
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
                            title="Increase quantity"
                          >
                            <IconPlus size={12} />
                          </button>
                        </div>

                        <span className="text-xs font-black text-white font-orbitron min-w-12 text-right">
                          ${(details.unitPrice * item.quantity).toFixed(2)}
                        </span>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          {isDeleting ? (
                            <IconLoader2 size={14} className="animate-spin text-destructive" />
                          ) : (
                            <IconTrash size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {!isCartLoading && cartItems.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
                  <IconShoppingCart className="size-8 text-muted-foreground/40" />
                  <span>Your cart is empty. Add products to get started.</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col gap-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Subtotal</span>
              <span className="text-xl font-black text-white font-orbitron">${cartTotal.toFixed(2)}</span>
            </div>
            <Button
              disabled={cartItems.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
              className="w-full bg-[#E31B23] hover:bg-[#C2181F] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#E31B23]/10 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              Checkout Now
            </Button>
          </div>
        </div>
      </div>

      {/* Shipping Address & Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
          <div className="bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 rounded-3xl max-w-lg w-full flex flex-col gap-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <IconMapPin className="size-5 text-primary" />
                <h3 className="text-xl font-black text-white uppercase font-orbitron">
                  Shipping Address
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Order Summary Strip */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Items to Order ({cartCount})
                </span>
                <span className="text-xs font-semibold text-emerald-400">Free Academy Delivery</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Total Charge
                </span>
                <span className="text-2xl font-black text-white font-orbitron">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleProceedToPayment} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Delivery Destination Address <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    if (addressError) setAddressError("");
                  }}
                  placeholder="e.g. Flat 4B, Road 12, London, UK"
                  className={cn(
                    "w-full bg-white/5 border rounded-xl p-3.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 resize-none",
                    addressError
                      ? "border-destructive focus:ring-destructive"
                      : "border-white/10 focus:ring-primary"
                  )}
                />
                {addressError && (
                  <p className="text-[11px] text-destructive font-medium">{addressError}</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Please provide the full residential address where your items should be dispatched.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  disabled={isCreatingOrder}
                  className="border-white/10 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="bg-[#E31B23] hover:bg-[#C2181F] text-white font-orbitron font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E31B23]/20"
                >
                  {isCreatingOrder ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentShop;
