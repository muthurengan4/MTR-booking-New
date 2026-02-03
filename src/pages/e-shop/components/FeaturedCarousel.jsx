import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeaturedCarousel = ({ products, onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products?.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products?.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + products?.length) % products?.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % products?.length);
  };

  const handleDotClick = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentProduct = products?.[currentIndex];

  return (
    <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-xl overflow-hidden border border-border">
      <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 p-6 md:p-8 lg:p-10">
        <div className="relative aspect-square lg:aspect-auto overflow-hidden rounded-xl bg-background">
          <Image
            src={currentProduct?.image}
            alt={currentProduct?.imageAlt}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-4 left-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold text-sm md:text-base">
            Featured
          </div>

          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-organic hover:bg-background active-press"
            aria-label="Previous product"
          >
            <Icon name="ChevronLeft" size={24} strokeWidth={2} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-organic hover:bg-background active-press"
            aria-label="Next product"
          >
            <Icon name="ChevronRight" size={24} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col justify-center gap-4 md:gap-5 lg:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Sparkles" size={20} color="var(--color-accent)" strokeWidth={2} />
              <span className="text-sm font-semibold text-accent uppercase tracking-wide">
                {currentProduct?.tag}
              </span>
            </div>
            
            <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
              {currentProduct?.name}
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground mb-4 max-measure">
              {currentProduct?.description}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
              ₹{currentProduct?.price?.toLocaleString('en-IN')}
            </span>
            {currentProduct?.originalPrice && (
              <>
                <span className="text-xl md:text-2xl text-muted-foreground line-through">
                  ₹{currentProduct?.originalPrice?.toLocaleString('en-IN')}
                </span>
                <span className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm font-semibold">
                  Save {Math.round(((currentProduct?.originalPrice - currentProduct?.price) / currentProduct?.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              size="lg"
              iconName="ShoppingCart"
              iconPosition="left"
              onClick={() => onProductClick(currentProduct)}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="lg"
              iconName="Heart"
              iconPosition="left"
              className="flex-1 sm:flex-initial"
            >
              Add to Wishlist
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-4">
            {products?.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-organic ${
                  index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel;