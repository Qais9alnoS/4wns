import { prisma } from '@/lib/prisma';
import BestMediaSlider from './BestMediaSlider';

export default async function HomeHighlights() {
  const bestMedia = await prisma.media.findMany({
    where: { isBest: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return <BestMediaSlider items={bestMedia} />;
}
