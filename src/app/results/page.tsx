"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEventSearch } from '@/hooks/useEventSearch';
import { ResultsTable } from '@/components/results/ResultsTable';
import { EventCard } from '@/components/results/EventCard';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Search, X, SlidersHorizontal, Calendar, DollarSign, Tag, RefreshCw, Loader2 } from 'lucide-react';
import { AnswerValue } from '@/types';
import { cn } from '@/lib/utils';

const STORAGE_KEYS = {
  ANSWERS: 'event-discovery-answers',
};

type SortOption = 'date' | 'price' | 'relevance';

const priceFilters = [
  { id: 'all', label: 'All Prices' },
  { id: 'free', label: 'Free', max: 0 },
  { id: 'under-50', label: 'Under $50', max: 50 },
  { id: 'under-100', label: 'Under $100', max: 100 },
  { id: '100-plus', label: '$100+', min: 100 },
];

const dateFilters = [
  { id: 'all', label: 'Any Date' },
  { id: 'today', label: 'Today', days: 0 },
  { id: 'week', label: 'This Week', days: 7 },
  { id: 'month', label: 'This Month', days: 30 },
];

export default function ResultsPage() {
  const router = useRouter();
  const [answers] = useLocalStorage<Record<string, AnswerValue>>(STORAGE_KEYS.ANSWERS, {});
  const { events, loading, error } = useEventSearch(answers);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

  // Get unique categories from events
  const availableCategories = useMemo(() => {
    if (!events) return [];
    const cats = new Set(events.map(e => e.category));
    return Array.from(cats);
  }, [events]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    let result = [...events];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(event => selectedCategories.includes(event.category));
    }

    // Price filter
    if (selectedPrice !== 'all') {
      const priceFilter = priceFilters.find(p => p.id === selectedPrice);
      if (priceFilter) {
        result = result.filter(event => {
          if (!event.priceRange) return selectedPrice === 'free';
          const minPrice = event.priceRange.min;
          if ('max' in priceFilter && priceFilter.max !== undefined) {
            return minPrice <= priceFilter.max;
          }
          if ('min' in priceFilter && priceFilter.min !== undefined) {
            return minPrice >= priceFilter.min;
          }
          return true;
        });
      }
    }

    // Date filter
    if (selectedDate !== 'all') {
      const dateFilter = dateFilters.find(d => d.id === selectedDate);
      if (dateFilter && 'days' in dateFilter) {
        const now = new Date();
        const maxDate = new Date();
        maxDate.setDate(now.getDate() + (dateFilter.days || 0) + 1);
        
        result = result.filter(event => {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          if (dateFilter.days === 0) {
            // Today only
            return eventDate.toDateString() === now.toDateString();
          }
          return eventDate >= now && eventDate <= maxDate;
        });
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      }
      if (sortBy === 'price') {
        return (a.priceRange?.min || 0) - (b.priceRange?.min || 0);
      }
      if (sortBy === 'relevance') {
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
      return 0;
    });

    return result;
  }, [events, sortBy, selectedCategories, selectedPrice, selectedDate]);

  const activeFilterCount = [
    selectedCategories.length > 0,
    selectedPrice !== 'all',
    selectedDate !== 'all'
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPrice('all');
    setSelectedDate('all');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleEditSearch = () => {
    router.push('/');
  };

  const handleStartOver = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEYS.ANSWERS);
      window.localStorage.removeItem('event-discovery-step');
    }
    router.push('/');
  };

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-gray-50)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-gray-600)] font-medium text-lg">
            Finding the best events for you...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-mesh p-4">
        <div className="text-center max-w-md card-glass rounded-2xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-[var(--color-error)]" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-[var(--color-gray-900)] mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-[var(--color-error)] mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-[var(--color-gray-200)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleEditSearch}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
              <div>
                <h1 className="text-xl font-bold font-heading text-[var(--color-gray-900)]">
                  {filteredEvents.length} Events Found
            </h1>
                {filteredEvents.length !== events.length && (
                  <p className="text-sm text-[var(--color-gray-500)]">
                    Showing {filteredEvents.length} of {events.length} results
                  </p>
                )}
              </div>
          </div>
          
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditSearch}
                className="hidden sm:flex"
              >
                <Search className="w-4 h-4 mr-2" />
                Edit Search
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleStartOver}
                className="hidden sm:flex"
              >
              Start Over
            </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b border-[var(--color-gray-200)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "sm:hidden flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200",
                showFilters 
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                  : "border-[var(--color-gray-200)] text-[var(--color-gray-600)]"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[var(--color-primary)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className={cn(
              "w-full sm:w-auto sm:flex items-center gap-3 flex-wrap",
              showFilters ? "flex" : "hidden sm:flex"
            )}>
              {/* Category Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[var(--color-gray-400)] hidden sm:block" />
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200",
                      selectedCategories.includes(category)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-gray-200)] text-[var(--color-gray-600)] hover:border-[var(--color-primary)]"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-gray-400)] hidden sm:block" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-[var(--color-gray-200)] bg-white text-[var(--color-gray-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {dateFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>{filter.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--color-gray-400)] hidden sm:block" />
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-[var(--color-gray-200)] bg-white text-[var(--color-gray-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {priceFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>{filter.label}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)] transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-[var(--color-gray-500)] hidden sm:inline">Sort by:</span>
            <select 
                className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-[var(--color-gray-200)] bg-white text-[var(--color-gray-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
                <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="price">Price (Low to High)</option>
            </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-live="polite">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 card-glass rounded-2xl p-8">
            <div className="mx-auto h-20 w-20 bg-[var(--color-gray-100)] rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-[var(--color-gray-400)]" />
            </div>
            <h3 className="text-xl font-bold font-heading text-[var(--color-gray-900)] mb-2">
              {events.length > 0 ? 'No events match your filters' : 'No events found'}
            </h3>
            <p className="text-[var(--color-gray-500)] max-w-md mx-auto mb-8">
              {events.length > 0 
                ? 'Try adjusting your filters to see more results.'
                : 'We couldn\'t find any events matching your criteria. Try adjusting your search.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {events.length > 0 && activeFilterCount > 0 && (
                <Button onClick={clearAllFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
              <Button onClick={handleEditSearch} variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Modify Search
              </Button>
              <Button onClick={handleStartOver}>Start Over</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block card-glass rounded-2xl overflow-hidden">
              <ResultsTable events={filteredEvents} />
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
