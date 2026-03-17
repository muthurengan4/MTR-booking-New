import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onAddToCart, onQuickView }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const handleWishlistToggle = (e) => {
    e?.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setImageIndex((prev) => (prev + 1) % product?.images?.length);
  };

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setImageIndex((prev) => (prev - 1 + product?.images?.length) % product?.images?.length);
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="bg-card rounded-xl border border-border overflow-hidden transition-organic hover-lift cursor-pointer group"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product?.images?.[imageIndex]?.url}
          alt={product?.images?.[imageIndex]?.alt}
          className="w-full h-full object-cover transition-organic group-hover:scale-105"
        />

        {product?.badge && (
          <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            product?.badge === 'New Arrival' ? 'bg-accent text-accent-foreground' :
            product?.badge === 'Best Seller' ? 'bg-primary text-primary-foreground' :
            product?.badge === 'Conservation' ? 'bg-success text-success-foreground' :
            'bg-secondary text-secondary-foreground'
          }`}>
            {product?.badge}
          </div>
        )}

        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-organic hover:bg-background active-press"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon
            name="Heart"
            size={20}
            strokeWidth={2}
            color={isWishlisted ? 'var(--color-error)' : 'var(--color-foreground)'}
            fill={isWishlisted ? 'var(--color-error)' : 'none'}
          />
        </button>

        {product?.images?.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-organic hover:bg-background opacity-0 group-hover:opacity-100 active-press"
              aria-label="Previous image"
            >
              <Icon name="ChevronLeft" size={20} strokeWidth={2} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-organic hover:bg-background opacity-0 group-hover:opacity-100 active-press"
              aria-label="Next image"
            >
              <Icon name="ChevronRight" size={20} strokeWidth={2} />
            </button>
          </>
        )}

        {product?.images?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product?.images?.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-organic ${
                  idx === imageIndex ? 'bg-primary w-4' : 'bg-background/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-4 md:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-semibold text-base md:text-lg lg:text-xl text-foreground line-clamp-2 flex-1">
            {product?.name}
          </h3>
          {product?.stock < 10 && product?.stock > 0 && (
            <span className="text-xs text-warning font-medium whitespace-nowrap">
              Only {product?.stock} left
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product?.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)]?.map((_, idx) => (
              <Icon
                key={idx}
                name="Star"
                size={14}
                strokeWidth={2}
                color={idx < Math.floor(product?.rating) ? 'var(--color-warning)' : 'var(--color-muted)'}
                fill={idx < Math.floor(product?.rating) ? 'var(--color-warning)' : 'none'}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product?.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold text-primary">
              ₹{product?.price?.toLocaleString('en-IN')}
            </span>
            {product?.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product?.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <Button
            variant="default"
            size="sm"
            iconName="ShoppingCart"
            iconPosition="left"
            onClick={handleAddToCart}
            disabled={product?.stock === 0}
            className="flex-shrink-0"
          >
            {product?.stock === 0 ? 'Out of Stock' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;