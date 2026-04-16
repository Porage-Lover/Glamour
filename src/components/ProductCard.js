'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: parseFloat(product.price),
      image_url: product.image_url,
      category: product.category,
    });
  };

  return (
    <Link href={`/shop/${product.id}`} className="product-card" id={`product-${product.id}`}>
      <span className="product-card-category">{product.category}</span>
      <div className="product-card-image">
        <img
          src={product.image_url || '/images/products/prod-1.jpg'}
          alt={product.name}
          loading="lazy"
        />
        <div className="product-card-overlay">
          <button className="btn-add-cart" onClick={handleAdd}>Add to Cart</button>
        </div>
      </div>
      <div className="product-card-info">
        <div className="product-card-brand">{product.brand}</div>
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</div>
      </div>
    </Link>
  );
}
