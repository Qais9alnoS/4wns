import type { Event } from '@prisma/client';
import Reveal from './Reveal';

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(d)
  );
}

function EventCard({ event }: { event: Event }) {
  const card = (
    <a
      href={event.instagramDmUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative border border-[var(--line)] bg-panel p-5 hover:border-gold transition-colors group"
    >
      {event.imageUrl && (
        <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div
        className={`inline-block text-xs tracking-widest mb-2 px-2 py-0.5 border ${
          event.status === 'UPCOMING' ? 'border-gold text-gold-light' : 'border-[var(--line)] text-cream-dim'
        }`}
      >
        {event.status === 'UPCOMING' ? 'قادم' : 'منتهي'}
      </div>
      <h3 className="font-display text-lg md:text-xl mb-1">{event.name}</h3>
      <p className="text-cream-dim text-sm mb-2">
        {formatDate(event.date)}
        {event.time ? ` — ${event.time}` : ''}
        {event.location ? ` · ${event.location}` : ''}
      </p>
      {event.description && <p className="text-cream-dim text-sm line-clamp-2">{event.description}</p>}
    </a>
  );
  return <Reveal>{card}</Reveal>;
}

function ComingSoonCard() {
  return (
    <Reveal>
      <div className="relative border border-dashed border-gold p-10 md:p-14 text-center bg-[repeating-linear-gradient(135deg,rgba(180,141,87,0.05)_0_2px,transparent_2px_10px)]">
        <div className="font-display text-2xl mb-2">
          قريباً
        </div>
        <p className="text-cream-dim text-sm">عم نحضّر لأول حفلة. تابعونا على انستغرام تلاقوا كل التفاصيل.</p>
      </div>
    </Reveal>
  );
}

export default function EventsSection({
  completed,
  upcoming,
}: {
  completed: Event[];
  upcoming: Event | null;
}) {
  const hasAny = completed.length > 0 || upcoming;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1160px] mx-auto px-5 md:px-7">
        <h2 className="font-display text-xl md:text-2xl tracking-wide mb-8">الحفلات</h2>

        {!hasAny ? (
          <ComingSoonCard />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {completed.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {upcoming ? <EventCard event={upcoming} /> : <ComingSoonCard />}
          </div>
        )}
      </div>
    </section>
  );
}
