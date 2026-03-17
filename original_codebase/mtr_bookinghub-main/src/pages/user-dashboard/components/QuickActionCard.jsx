import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionCard = ({ icon, title, description, actionLabel, onClick, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/5 border-primary/20 hover:bg-primary/10';
      case 'success':
        return 'bg-success/5 border-success/20 hover:bg-success/10';
      case 'accent':
        return 'bg-accent/5 border-accent/20 hover:bg-accent/10';
      default:
        return 'bg-card border-border hover:bg-muted/50';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'var(--color-primary)';
      case 'success':
        return 'var(--color-success)';
      case 'accent':
        return 'var(--color-accent)';
      default:
        return 'var(--color-foreground)';
    }
  };

  return (
    <div className={`border rounded-xl p-4 md:p-6 transition-organic hover-lift ${getVariantStyles()}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
          variant === 'primary' ? 'bg-primary/10' :
          variant === 'success' ? 'bg-success/10' :
          variant === 'accent'? 'bg-accent/10' : 'bg-muted'
        }`}>
          <Icon name={icon} size={24} strokeWidth={2} color={getIconColor()} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
          <Button
            variant={variant === 'primary' ? 'default' : 'outline'}
            size="sm"
            iconName="ArrowRight"
            iconPosition="right"
            onClick={onClick}
            className="w-full md:w-auto"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;