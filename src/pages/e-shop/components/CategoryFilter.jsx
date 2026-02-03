import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, onClearFilters }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg md:text-xl text-foreground">
          Categories
        </h3>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={onClearFilters}
          >
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => onCategoryChange(category?.id)}
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
              <span className="font-medium text-sm md:text-base">
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
    </div>
  );
};

export default CategoryFilter;