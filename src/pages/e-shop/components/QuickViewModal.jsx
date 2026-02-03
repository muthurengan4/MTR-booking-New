import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]?.value || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.value || '');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
    onClose();
  };

  const handleQuantityChange = (delta) => {
    setQuantity(Math.max(1, Math.min(product?.stock, quantity + delta)));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal"
        onClick={onClose}
      />
      <div className="fixed inset-4 md:inset-8 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-5xl bg-card rounded-xl shadow-2xl z-modal overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
            <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground">
              Product Details
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-organic hover:bg-muted active-press"
              aria-label="Close modal"
            >
              <Icon name="X" size={24} strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={product?.images?.[selectedImage]?.url}
                    alt={product?.images?.[selectedImage]?.alt}
                    className="w-full h-full object-cover"
                  />
                  
                  {product?.badge && (
                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      product?.badge === 'New Arrival' ? 'bg-accent text-accent-foreground' :
                      product?.badge === 'Best Seller' ? 'bg-primary text-primary-foreground' :
                      product?.badge === 'Conservation' ? 'bg-success text-success-foreground' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {product?.badge}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {product?.images?.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-organic ${
                        selectedImage === idx ? 'border-primary' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <Image
                        src={img?.url}
                        alt={img?.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
                    {product?.name}
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)]?.map((_, idx) => (
                        <Icon
                          key={idx}
                          name="Star"
                          size={18}
                          strokeWidth={2}
                          color={idx < Math.floor(product?.rating) ? 'var(--color-warning)' : 'var(--color-muted)'}
                          fill={idx < Math.floor(product?.rating) ? 'var(--color-warning)' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product?.rating} ({product?.reviewCount} reviews)
                    </span>
                  </div>

                  <p className="text-base text-muted-foreground mb-6">
                    {product?.fullDescription || product?.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-3 pb-6 border-b border-border">
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    ₹{product?.price?.toLocaleString('en-IN')}
                  </span>
                  {product?.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{product?.originalPrice?.toLocaleString('en-IN')}
                      </span>
                      <span className="px-2 py-1 bg-success/10 text-success rounded-lg text-sm font-semibold">
                        {Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {product?.sizes && product?.sizes?.length > 0 && (
                  <div>
                    <Select
                      label="Size"
                      options={product?.sizes}
                      value={selectedSize}
                      onChange={setSelectedSize}
                      required
                    />
                  </div>
                )}

                {product?.colors && product?.colors?.length > 0 && (
                  <div>
                    <Select
                      label="Color"
                      options={product?.colors}
                      value={selectedColor}
                      onChange={setSelectedColor}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center transition-organic hover:bg-muted active-press disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Icon name="Minus" size={20} strokeWidth={2} />
                    </button>
                    <span className="text-xl font-semibold text-foreground min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product?.stock}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center transition-organic hover:bg-muted active-press disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Icon name="Plus" size={20} strokeWidth={2} />
                    </button>
                    <span className="text-sm text-muted-foreground ml-2">
                      {product?.stock} available
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    iconName="ShoppingCart"
                    iconPosition="left"
                    onClick={handleAddToCart}
                    disabled={product?.stock === 0}
                    fullWidth
                  >
                    {product?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    iconName="Heart"
                    iconPosition="left"
                    className="sm:w-auto"
                  >
                    Wishlist
                  </Button>
                </div>

                {product?.conservationInfo && (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="Leaf" size={20} color="var(--color-success)" strokeWidth={2} />
                      <div>
                        <h4 className="font-semibold text-success mb-1">
                          Conservation Impact
                        </h4>
                        <p className="text-sm text-foreground">
                          {product?.conservationInfo}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;