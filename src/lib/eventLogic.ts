import type { Event } from '@prisma/client';

export type HomeEvents = {
  completed: Event[]; // up to 2, most recent first
  upcoming: Event | null; // nearest upcoming, or null
};

/**
 * Selects which events show on the home page:
 * - The two most recent Completed events (by date, descending).
 * - The single nearest Upcoming event (by date, ascending). Null if none exists.
 */
export function selectHomeEvents(events: Event[]): HomeEvents {
  const completed = events
    .filter((e) => e.status === 'COMPLETED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const upcomingCandidates = events
    .filter((e) => e.status === 'UPCOMING')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcoming = upcomingCandidates.length > 0 ? upcomingCandidates[0] : null;

  return { completed, upcoming };
}
