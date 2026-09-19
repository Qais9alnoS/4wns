import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/apiAuth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, date, time, location, description, instagramDmUrl, status, image } = body as {
      name?: string;
      date?: string;
      time?: string | null;
      location?: string | null;
      description?: string | null;
      instagramDmUrl?: string;
      status?: 'UPCOMING' | 'COMPLETED';
      image?: string; // optional new data URI to replace the event image
    };

    const existing = await prisma.event.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
    }

    let imageUrl = existing.imageUrl;
    let imagePublicId = existing.imagePublicId;
    if (image) {
      if (existing.imagePublicId) {
        await deleteFromCloudinary(existing.imagePublicId, 'image');
      }
      const uploaded = await uploadToCloudinary(image, 'events', 'image');
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(time !== undefined && { time }),
        ...(location !== undefined && { location }),
        ...(description !== undefined && { description }),
        ...(instagramDmUrl !== undefined && { instagramDmUrl: instagramDmUrl.trim() || null }),
        ...(status !== undefined && { status }),
        imageUrl,
        imagePublicId,
      },
    });

    return NextResponse.json({ event });
  } catch (err) {
    console.error('Event update error:', err);
    return NextResponse.json({ error: 'فشل تحديث الحدث' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
    }

    if (event.imagePublicId) {
      await deleteFromCloudinary(event.imagePublicId, 'image');
    }
    await prisma.event.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Event delete error:', err);
    return NextResponse.json({ error: 'فشل حذف الحدث' }, { status: 500 });
  }
}
