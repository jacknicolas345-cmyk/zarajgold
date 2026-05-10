import React from "react";
import { Link } from "react-router-dom";
import { formatPrice, CATEGORY_FA } from "../lib/api";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card group block"
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-square overflow-hidden bg-[#F5EDD9]/40">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-5">
        <div className="overline text-[10px] mb-2">{CATEGORY_FA[product.category] || "محصول"}</div>
        <h3 className="text-base font-medium text-slate-900 line-clamp-1">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-gold font-semibold text-lg">{formatPrice(product.price)}</div>
          {product.karat && <span className="text-xs text-slate-500">{product.karat}</span>}
        </div>
      </div>
    </Link>
  );
}
