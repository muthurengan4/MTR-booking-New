import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SearchBar = ({ onSearch, onSortChange, sortValue }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-5 lg:p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-12"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="Search" size={20} color="var(--color-muted-foreground)" strokeWidth={2} />
          </div>
        </div>

        <Select
          options={sortOptions}
          value={sortValue}
          onChange={onSortChange}
          placeholder="Sort by"
        />
      </div>
    </div>
  );
};

export default SearchBar;