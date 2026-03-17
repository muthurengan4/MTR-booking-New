import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ActivityFilters = ({ filters, onFilterChange }) => {
  const priceRangeOptions = [
    { value: 'all', label: 'All Prices' },
    { value: '0-1000', label: 'Under ₹1,000' },
    { value: '1000-2000', label: '₹1,000 - ₹2,000' },
    { value: '2000-3000', label: '₹2,000 - ₹3,000' },
    { value: '3000+', label: 'Above ₹3,000' }
  ];

  const durationOptions = [
    { value: 'all', label: 'Any Duration' },
    { value: '0-2', label: 'Under 2 hours' },
    { value: '2-4', label: '2-4 hours' },
    { value: '4-6', label: '4-6 hours' },
    { value: '6+', label: '6+ hours' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration' }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="SlidersHorizontal" size={24} strokeWidth={2} color="var(--color-primary)" />
        <h3 className="font-heading text-xl font-semibold text-foreground">Filters</h3>
      </div>
      <div className="space-y-6">
        <Select
          label="Sort By"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => onFilterChange('sortBy', value)}
        />

        <Select
          label="Price Range"
          options={priceRangeOptions}
          value={filters?.priceRange}
          onChange={(value) => onFilterChange('priceRange', value)}
        />

        <Select
          label="Duration"
          options={durationOptions}
          value={filters?.duration}
          onChange={(value) => onFilterChange('duration', value)}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Availability
          </label>
          <div className="space-y-2">
            <Checkbox
              label="Show only available"
              checked={filters?.onlyAvailable}
              onChange={(e) => onFilterChange('onlyAvailable', e?.target?.checked)}
            />
            <Checkbox
              label="Include limited slots"
              checked={filters?.includeLimited}
              onChange={(e) => onFilterChange('includeLimited', e?.target?.checked)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Activity Type
          </label>
          <div className="space-y-2">
            <Checkbox
              label="Safari Activities"
              checked={filters?.showSafari}
              onChange={(e) => onFilterChange('showSafari', e?.target?.checked)}
            />
            <Checkbox
              label="Wildlife Encounters"
              checked={filters?.showEncounters}
              onChange={(e) => onFilterChange('showEncounters', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilters;