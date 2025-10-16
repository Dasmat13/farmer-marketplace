import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, Star, MapPin, Leaf, Clock, SlidersHorizontal } from 'lucide-react';
import { searchService, SearchFilters, CropSearchResult } from '../services/searchService';

interface AdvancedSearchProps {
  onSearchResults: (results: CropSearchResult[], totalCount: number) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  defaultFilters?: SearchFilters;
  userId?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearchResults,
  onFiltersChange,
  defaultFilters = {},
  userId
}) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterOptions, setFilterOptions] = useState<any>({});
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load filter options
    const options = searchService.getFilterOptions();
    setFilterOptions(options);
  }, []);

  useEffect(() => {
    // Perform search when filters change
    const performSearch = async () => {
      if (loading) return;
      
      setLoading(true);
      try {
        const result = await searchService.searchCrops(filters);
        onSearchResults(result.results, result.totalCount);
        onFiltersChange?.(filters);
        
        // Save search if user is logged in
        if (userId && filters.query) {
          searchService.saveSearch(userId, filters);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [filters, userId, onSearchResults, onFiltersChange, loading]);

  const handleSearch = async (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleSuggestionSearch = async (query: string) => {
    if (query.length >= 2) {
      const suggestions = await searchService.getSearchSuggestions(query);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.value = suggestion;
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof SearchFilters];
      if (Array.isArray(value)) return value.length > 0;
      if (key === 'availability') return value !== 'all';
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search crops, farmers, categories..."
            defaultValue={filters.query}
            onChange={(e) => {
              handleSearch(e.target.value);
              handleSuggestionSearch(e.target.value);
            }}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-farm-green-600"></div>
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-farm-green-600 text-white text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category?.map(cat => (
            <span key={cat} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {cat}
              <button onClick={() => updateFilter('category', filters.category!.filter(c => c !== cat))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.location?.map(loc => (
            <span key={loc} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              {loc}
              <button onClick={() => updateFilter('location', filters.location!.filter(l => l !== loc))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.organic && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              <Leaf className="h-3 w-3" />
              Organic
              <button onClick={() => clearFilter('organic')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.localOnly && (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
              Local Only
              <button onClick={() => clearFilter('localOnly')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.categories?.map((category: string) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.category?.includes(category) || false}
                    onChange={(e) => {
                      const current = filters.category || [];
                      if (e.target.checked) {
                        updateFilter('category', [...current, category]);
                      } else {
                        updateFilter('category', current.filter(c => c !== category));
                      }
                    }}
                    className="rounded border-gray-300 text-farm-green-600 focus:ring-farm-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    min: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-farm-green-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    max: parseFloat(e.target.value) || 999
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-farm-green-500"
                />
              </div>
              {filterOptions.priceRange && (
                <div className="text-xs text-gray-500">
                  Range: ${filterOptions.priceRange.min} - ${filterOptions.priceRange.max}
                </div>
              )}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.locations?.map((location: string) => (
                <label key={location} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.location?.includes(location) || false}
                    onChange={(e) => {
                      const current = filters.location || [];
                      if (e.target.checked) {
                        updateFilter('location', [...current, location]);
                      } else {
                        updateFilter('location', current.filter(l => l !== location));
                      }
                    }}
                    className="rounded border-gray-300 text-farm-green-600 focus:ring-farm-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{location}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.certifications?.map((cert: string) => (
                <label key={cert} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.certifications?.includes(cert) || false}
                    onChange={(e) => {
                      const current = filters.certifications || [];
                      if (e.target.checked) {
                        updateFilter('certifications', [...current, cert]);
                      } else {
                        updateFilter('certifications', current.filter(c => c !== cert));
                      }
                    }}
                    className="rounded border-gray-300 text-farm-green-600 focus:ring-farm-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{cert}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              value={filters.availability || 'all'}
              onChange={(e) => updateFilter('availability', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-farm-green-500"
            >
              <option value="all">All</option>
              <option value="available">Available Now</option>
              <option value="low_stock">Low Stock</option>
              <option value="pre_order">Pre-order</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.organic || false}
                  onChange={(e) => updateFilter('organic', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-farm-green-600 focus:ring-farm-green-500"
                />
                <Leaf className="h-4 w-4 ml-2 mr-1 text-green-600" />
                <span className="text-sm text-gray-700">Organic Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.localOnly || false}
                  onChange={(e) => updateFilter('localOnly', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-farm-green-600 focus:ring-farm-green-500"
                />
                <MapPin className="h-4 w-4 ml-2 mr-1 text-blue-600" />
                <span className="text-sm text-gray-700">Local Only (&lt;100 miles)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-farm-green-500"
          >
            {filterOptions.sortOptions?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
