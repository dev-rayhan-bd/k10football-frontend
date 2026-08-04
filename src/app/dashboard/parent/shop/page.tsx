"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconShoppingCart,
  IconTrash
} from "@tabler/icons-react";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  category: "Jerseys" | "Kits" | "Accessories";
  price: number;
  image: string;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
  size: string;
}

export default function ParentShop() {
  const products: Product[] = [
    {
      id: 1,
      name: "Academy Home Jersey",
      category: "Jerseys",
      price: 45.00,
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=400",
      inStock: true
    },
    {
      id: 2,
      name: "Academy Away Jersey",
      category: "Jerseys",
      price: 45.00,
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400",
      inStock: true
    },
    {
      id: 3,
      name: "Full Training Kit",
      category: "Kits",
      price: 35.00,
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400",
      inStock: true
    },
    {
      id: 4,
      name: "Nike Tiempo Soccer Boots",
      category: "Accessories",
      price: 85.00,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400",
      inStock: true
    },
    {
      id: 5,
      name: "Goalkeeper Pro Gloves",
      category: "Accessories",
      price: 30.00,
      image: "https://images.unsplash.com/photo-1518005020250-675f0403172c?auto=format&fit=crop&q=80&w=400",
      inStock: true
    },
    {
      id: 6,
      name: "Training Shorts",
      category: "Kits",
      price: 25.00,
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=400",
      inStock: false
    }
  ];

  const [activeCategory, setActiveCategory] = useState<"All" | "Jerseys" | "Kits" | "Accessories">("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [isCheckout, setIsCheckout] = useState(false);

  const filteredProducts = products.filter(p => {
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSizes({ ...selectedSizes, [productId]: size });
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id] || "M";
    const existing = cart.find(item => item.id === product.id && item.size === size);

    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, size }]);
    }
    toast.success(`Added ${product.name} (${size}) to cart!`);
  };

  const handleRemoveFromCart = (productId: number, size: string) => {
    setCart(cart.filter(item => !(item.id === productId && item.size === size)));
    toast.info("Item removed from cart.");
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleConfirmPurchase = async () => {
    const toastId = toast.loading("Processing transaction on Stripe...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCart([]);
    setIsCheckout(false);
    toast.success("Purchase completed successfully! Receipt sent to your email.", { id: toastId });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            Academy <span className="text-primary italic">Shop</span>
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[11px] mt-2">
            Buy jerseys, kits, and accessories for your youth player
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Products List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters */}
          <div className="flex gap-2 bg-black/40 border border-white/5 p-1 rounded-xl w-fit">
            {(["All", "Jerseys", "Kits", "Accessories"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? "bg-[#E31B23] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.map((prod) => {
              const currentSize = selectedSizes[prod.id] || "M";
              return (
                <div
                  key={prod.id}
                  className="bg-[#0D0D0D]/40 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-4/3 w-full bg-neutral-900 relative overflow-hidden">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-all"
                    />
                    {!prod.inStock && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-widest text-red-500">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{prod.name}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{prod.category}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-white font-orbitron">${prod.price.toFixed(2)}</span>

                      {prod.category !== "Accessories" && prod.inStock && (
                        <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
                          {["S", "M", "L"].map((sz) => (
                            <button
                              key={sz}
                              onClick={() => handleSizeSelect(prod.id, sz)}
                              className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                                currentSize === sz
                                  ? "bg-white text-black font-black"
                                  : "text-gray-500 hover:text-white"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      disabled={!prod.inStock}
                      onClick={() => handleAddToCart(prod)}
                      className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <IconShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col justify-between h-fit min-h-125">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-black uppercase text-white font-orbitron flex items-center gap-2">
                <IconShoppingCart className="text-primary" /> Shopping Cart
              </h2>
              <Badge className="bg-primary text-black font-black font-orbitron">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            </div>

            <div className="space-y-4 max-h-75 overflow-y-auto pr-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl bg-black/20 border border-white/5 items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">
                        Qty: {item.quantity} {item.category !== "Accessories" && `| Size: ${item.size}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-white font-orbitron">${(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => handleRemoveFromCart(item.id, item.size)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-xs font-light">
                  Your cart is empty. Add products to get started.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
              <span className="text-xl font-black text-white font-orbitron">${cartTotal.toFixed(2)}</span>
            </div>

            <Button
              disabled={cart.length === 0}
              onClick={() => setIsCheckout(true)}
              className="w-full bg-[#E31B23] hover:bg-[#C2181F] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#E31B23]/10 disabled:opacity-50"
            >
              Checkout Now
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-[#0D0D0D] border border-white/10 p-8 rounded-3xl max-w-md w-full mx-4 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white uppercase font-orbitron">Checkout Products</h3>
              <p className="text-xs text-gray-400">Pay using simulated Stripe card details</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black border border-white/5 flex flex-col gap-2">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Total Charge</span>
                <span className="text-3xl font-black text-white font-orbitron">${cartTotal.toFixed(2)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider ml-1">Card Details</label>
                <div className="px-4 py-3.5 rounded-xl border border-white/5 bg-black text-white text-xs select-none">
                  •••• •••• •••• 4242 (Stripe Purchase)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsCheckout(false)}
                className="py-3 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="py-3 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold uppercase tracking-wider transition-all"
              >
                Pay & Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
