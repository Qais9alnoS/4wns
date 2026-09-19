import type { Event } from '@prisma/client';
import Reveal from './Reveal';

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(d)
  );
}

function EventCard({ event }: { event: Event }) {
  const className =
    'flex aspect-square w-full flex-col overflow-hidden border border-[var(--line)] bg-panel hover:border-gold transition-colors group';
  const content = (
    <>
      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-bg-soft">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="shrink-0 p-5">
        <div
          className={`inline-block text-xs tracking-widest mb-2 px-2 py-0.5 border ${
            event.status === 'UPCOMING' ? 'border-gold text-gold-light' : 'border-[var(--line)] text-cream-dim'
          }`}
        >
          {event.status === 'UPCOMING' ? 'قادم' : 'منتهي'}
        </div>
        <h3 className="font-display text-lg md:text-xl leading-[1.2] mb-1">{event.name}</h3>
        <p className="text-cream-dim text-sm mb-2">
          {formatDate(event.date)}
          {event.time ? ` - ${event.time}` : ''}
          {event.location ? ` · ${event.location}` : ''}
        </p>
        <p className="text-cream-dim text-sm leading-relaxed line-clamp-2 min-h-[2.5em]">
          {event.description ?? ''}
        </p>
      </div>
    </>
  );

  const card = event.instagramDmUrl ? (
    <a href={event.instagramDmUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );

  return <Reveal className="w-full">{card}</Reveal>;
}

function ComingSoonCard() {
  return (
    <Reveal className="w-full">
      <div className="flex aspect-square w-full flex-col items-center justify-center border border-dashed border-gold p-8 text-center bg-[repeating-linear-gradient(135deg,rgba(180,141,87,0.05)_0_2px,transparent_2px_10px)]">
        <div className="font-display text-2xl mb-2">قريباً</div>
        <p className="text-cream-dim text-sm max-w-[28ch]">
          عم نحضّر لأول حفلة. تابعونا على انستغرام تلاقوا كل التفاصيل.
        </p>
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
      <div className="w-full px-5 md:px-8 lg:px-10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display text-xl md:text-2xl tracking-wide">الحفلات</h2>
          <div className="flex-1 h-px bg-[var(--line)]" />
        </div>

        {!hasAny ? (
          <ComingSoonCard />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
