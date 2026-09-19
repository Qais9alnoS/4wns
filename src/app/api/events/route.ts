import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/apiAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { date: 'desc' } });
  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, date, time, location, description, instagramDmUrl, status, image } = body as {
      name: string;
      date: string;
      time?: string;
      location?: string;
      description?: string;
      instagramDmUrl: string;
      status?: 'UPCOMING' | 'COMPLETED';
      image?: string; // optional data URI
    };

    if (!name || !date || !instagramDmUrl) {
      return NextResponse.json({ error: 'الاسم والتاريخ ورابط Instagram DM مطلوبة' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;
    if (image) {
      const uploaded = await uploadToCloudinary(image, 'events', 'image');
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
        time: time || null,
        location: location || null,
        description: description || null,
        instagramDmUrl,
        status: status || 'UPCOMING',
        imageUrl,
        imagePublicId,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error('Event create error:', err);
    return NextResponse.json({ error: 'فشل إنشاء الحدث' }, { status: 500 });
  }
}
