import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCard = ({ icon, label, value, trend, trendValue, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/5 border-primary/20';
      case 'success':
        return 'bg-success/5 border-success/20';
      case 'accent':
        return 'bg-accent/5 border-accent/20';
      default:
        return 'bg-card border-border';
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
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          variant === 'primary' ? 'bg-primary/10' :
          variant === 'success' ? 'bg-success/10' :
          variant === 'accent'? 'bg-accent/10' : 'bg-muted'
        }`}>
          <Icon name={icon} size={24} strokeWidth={2} color={getIconColor()} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} strokeWidth={2} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-heading font-bold text-foreground">{value}</p>
    </div>
  );
};

export default StatsCard;