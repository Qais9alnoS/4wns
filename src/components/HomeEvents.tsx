import { prisma } from '@/lib/prisma';
import { selectHomeEvents } from '@/lib/eventLogic';
import EventsSection from './EventsSection';

export default async function HomeEvents() {
  const events = await prisma.event.findMany();
  const { completed, upcoming } = selectHomeEvents(events);

  return <EventsSection completed={completed} upcoming={upcoming} />;
}
