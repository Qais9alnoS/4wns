import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/apiAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';

const BEST_LIMIT = 5;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bestOnly = searchParams.get('best') === 'true';

  const media = await prisma.media.findMany({
    where: bestOnly ? { isBest: true } : undefined,
    orderBy: { createdAt: 'desc' },
    take: bestOnly ? BEST_LIMIT : undefined,
  });

  return NextResponse.json({ media });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { file, type, description, date, details, isBest } = body as {
      file: string; // data URI from the client
      type: 'IMAGE' | 'VIDEO';
      description?: string;
      date?: string;
      details?: string;
      isBest?: boolean;
    };

    if (!file || !type) {
      return NextResponse.json({ error: 'الملف والنوع مطلوبان' }, { status: 400 });
    }

    if (isBest) {
      const bestCount = await prisma.media.count({ where: { isBest: true } });
      if (bestCount >= BEST_LIMIT) {
        return NextResponse.json(
          { error: `لا يمكن تجاوز الحد الأقصى (${BEST_LIMIT}) لعناصر Best Media` },
          { status: 400 }
        );
      }
    }

    const uploaded = await uploadToCloudinary(file, 'gallery', type === 'VIDEO' ? 'video' : 'image');

    const media = await prisma.media.create({
      data: {
        type,
        cloudinaryUrl: uploaded.url,
        publicId: uploaded.publicId,
        description: description || null,
        date: date ? new Date(date) : null,
        details: details || null,
        isBest: !!isBest,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (err) {
    console.error('Media create error:', err);
    return NextResponse.json({ error: 'فشل رفع الوسائط' }, { status: 500 });
  }
}
