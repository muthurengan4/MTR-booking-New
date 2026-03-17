import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MobileFilterDrawer = ({ isOpen, onClose, categories, selectedCategory, onCategoryChange }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card shadow-2xl z-modal lg:hidden overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Filter Products
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-organic hover:bg-muted active-press"
            aria-label="Close filters"
          >
            <Icon name="X" size={24} strokeWidth={2} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Categories
          </h4>
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => {
                onCategoryChange(category?.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-organic ${
                selectedCategory === category?.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={category?.icon}
                  size={20}
                  strokeWidth={2}
                  color={selectedCategory === category?.id ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'}
                />
                <span className="font-medium text-sm">
                  {category?.name}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                selectedCategory === category?.id
                  ? 'bg-primary-foreground/20'
                  : 'bg-muted'
              }`}>
                {category?.count}
              </span>
            </button>
          ))}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <Button
            variant="outline"
            fullWidth
            iconName="RotateCcw"
            iconPosition="left"
            onClick={() => {
              onCategoryChange(null);
              onClose();
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;