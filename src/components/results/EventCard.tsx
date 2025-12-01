import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import { NormalizedEvent } from '@/types';
import { Calendar, MapPin, DollarSign, ExternalLink, Star } from 'lucide-react';
import { format } from 'date-fns';

import { RelevanceBreakdown } from './RelevanceBreakdown';

interface EventCardProps {
  event: NormalizedEvent;
  index?: number;
}

export const EventCard = memo(function EventCard({ event, index = 0 }: EventCardProps) {
  const formattedDate = useMemo(
    () => event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'Date TBA',
    [event.date]
  );

  const formattedTime = useMemo(
    () => event.time ? format(new Date(`2000-01-01T${event.time}`), 'h:mm a') : '',
    [event.time]
  );

  const isHighRelevance = useMemo(
    () => (event.relevanceScore || 0) >= 80,
    [event.relevanceScore]
  );

  return (
    <div className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-[var(--color-gray-100)]">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={event.images.large}
          alt={event.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading={index < 4 ? "eager" : "lazy"}
          priority={index < 2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--color-gray-700)]">
          {event.category}
        </div>

        {/* Featured Badge */}
        {isHighRelevance && (
          <div className="absolute top-3 right-3 bg-[var(--color-accent)] px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--color-gray-900)] flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Relevance on image */}
        <div className="absolute bottom-3 left-3">
          <RelevanceBreakdown event={event} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold font-heading text-[var(--color-gray-900)] mb-3 line-clamp-2 min-h-[3.5rem] tracking-tight">
          {event.name}
        </h3>

        <div className="space-y-2.5 text-sm text-[var(--color-gray-600)]">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2.5 text-[var(--color-primary)]" />
            <span>{formattedDate} {formattedTime && `• ${formattedTime}`}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2.5 text-[var(--color-secondary)]" />
            <span className="truncate">{event.venue.name}, {event.venue.city}</span>
          </div>

          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2.5 text-[var(--color-accent)]" />
            <span>
              {event.priceRange
                ? `${event.priceRange.min} - ${event.priceRange.max} ${event.priceRange.currency}`
                : 'Price not available'}
            </span>
          </div>
        </div>

        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
          View Tickets
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
});
