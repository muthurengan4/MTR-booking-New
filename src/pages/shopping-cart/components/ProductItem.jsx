import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductItem = ({ item, onQuantityChange, onRemove }) => {
  const [quantity, setQuantity] = useState(item?.quantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item?.maxQuantity) {
      setQuantity(newQuantity);
      onQuantityChange(item?.id, newQuantity);
    }
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 transition-organic hover:shadow-md">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={item?.image}
            alt={item?.imageAlt}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground mb-1 line-clamp-1">
                {item?.productName}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item?.description}</p>
              {item?.variant && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Variant:</span>
                  <span className="text-sm font-medium text-foreground">{item?.variant}</span>
                </div>
              )}
            </div>

            <div className="flex md:flex-col items-center md:items-end gap-2">
              <span className="text-2xl md:text-3xl font-bold text-secondary whitespace-nowrap">
                ₹{(item?.price * quantity)?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground">₹{item?.price?.toLocaleString('en-IN')} each</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-organic hover:bg-background active-press disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Icon name="Minus" size={16} strokeWidth={2} />
                </button>
                <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= item?.maxQuantity}
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-organic hover:bg-background active-press disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Icon name="Plus" size={16} strokeWidth={2} />
                </button>
              </div>
              {item?.maxQuantity <= 10 && (
                <span className="text-xs text-warning">Only {item?.maxQuantity} left</span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={() => onRemove(item?.id)}
              className="text-destructive hover:text-destructive"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;