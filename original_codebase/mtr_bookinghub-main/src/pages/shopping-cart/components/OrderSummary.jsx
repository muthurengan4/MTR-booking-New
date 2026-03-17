import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const OrderSummary = ({ summary, onApplyPromo, onProceedCheckout }) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = () => {
    if (!promoCode?.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    const validCodes = ['WELCOME10', 'WILDLIFE20', 'SAFARI15'];
    if (validCodes?.includes(promoCode?.toUpperCase())) {
      setPromoApplied(true);
      setPromoError('');
      onApplyPromo(promoCode);
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoError('');
    onApplyPromo('');
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 sticky top-24">
      <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-6">
        Order Summary
      </h2>
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Accommodation ({summary?.accommodationCount})</span>
          <span className="text-sm font-medium text-foreground">₹{summary?.accommodationTotal?.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Activities ({summary?.activityCount})</span>
          <span className="text-sm font-medium text-foreground">₹{summary?.activityTotal?.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Products ({summary?.productCount})</span>
          <span className="text-sm font-medium text-foreground">₹{summary?.productTotal?.toLocaleString('en-IN')}</span>
        </div>

        <div className="h-px bg-border my-4" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-sm font-medium text-foreground">₹{summary?.subtotal?.toLocaleString('en-IN')}</span>
        </div>

        {summary?.discount > 0 && (
          <div className="flex items-center justify-between text-success">
            <span className="text-sm">Discount</span>
            <span className="text-sm font-medium">-₹{summary?.discount?.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">GST (18%)</span>
          <span className="text-sm font-medium text-foreground">₹{summary?.tax?.toLocaleString('en-IN')}</span>
        </div>

        <div className="h-px bg-border my-4" />

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">Total Amount</span>
          <span className="text-2xl font-bold text-primary">₹{summary?.total?.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">Promo Code</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter code"
            value={promoCode}
            onChange={(e) => setPromoCode(e?.target?.value?.toUpperCase())}
            disabled={promoApplied}
            error={promoError}
            className="flex-1"
          />
          {promoApplied ? (
            <Button
              variant="outline"
              size="default"
              iconName="X"
              onClick={handleRemovePromo}
            >
              Remove
            </Button>
          ) : (
            <Button
              variant="outline"
              size="default"
              onClick={handleApplyPromo}
            >
              Apply
            </Button>
          )}
        </div>
        {promoApplied && (
          <div className="flex items-center gap-2 mt-2 text-success">
            <Icon name="CheckCircle" size={16} strokeWidth={2} />
            <span className="text-sm">Promo code applied successfully!</span>
          </div>
        )}
      </div>
      {summary?.packageSavings > 0 && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="Gift" size={20} color="var(--color-success)" strokeWidth={2} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-success mb-1">Package Deal Applied!</p>
              <p className="text-xs text-foreground">You're saving ₹{summary?.packageSavings?.toLocaleString('en-IN')} with combined booking</p>
            </div>
          </div>
        </div>
      )}
      <Button
        variant="default"
        size="lg"
        fullWidth
        iconName="ArrowRight"
        iconPosition="right"
        onClick={onProceedCheckout}
      >
        Proceed to Checkout
      </Button>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Icon name="Shield" size={14} strokeWidth={2} />
        <span>Secure payment powered by Razorpay</span>
      </div>
    </div>
  );
};

export default OrderSummary;