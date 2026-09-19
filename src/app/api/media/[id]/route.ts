import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/apiAuth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

const BEST_LIMIT = 5;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { description, date, details, isBest } = body as {
      description?: string | null;
      date?: string | null;
      details?: string | null;
      isBest?: boolean;
    };

    if (isBest === true) {
      const existing = await prisma.media.findUnique({ where: { id: params.id } });
      if (existing && !existing.isBest) {
        const bestCount = await prisma.media.count({ where: { isBest: true } });
        if (bestCount >= BEST_LIMIT) {
          return NextResponse.json(
            { error: `لا يمكن تجاوز الحد الأقصى (${BEST_LIMIT}) لعناصر Best Media` },
            { status: 400 }
          );
        }
      }
    }

    const media = await prisma.media.update({
      where: { id: params.id },
      data: {
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        ...(details !== undefined && { details }),
        ...(isBest !== undefined && { isBest }),
      },
    });

    return NextResponse.json({ media });
  } catch (err) {
    console.error('Media update error:', err);
    return NextResponse.json({ error: 'فشل تحديث الوسائط' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const media = await prisma.media.findUnique({ where: { id: params.id } });
    if (!media) {
      return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
    }

    await deleteFromCloudinary(media.publicId, media.type === 'VIDEO' ? 'video' : 'image');
    await prisma.media.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Media delete error:', err);
    return NextResponse.json({ error: 'فشل حذف الوسائط' }, { status: 500 });
  }
}
