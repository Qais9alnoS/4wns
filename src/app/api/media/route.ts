import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/apiAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

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

type MediaType = 'IMAGE' | 'VIDEO';

type ParsedUpload = {
  buffer: Buffer;
  type: MediaType;
  description: string;
  date: string;
  details: string;
  isBest: boolean;
};

function isUploadBlob(value: FormDataEntryValue | null): value is Blob {
  return !!value && typeof value === 'object' && typeof (value as Blob).arrayBuffer === 'function';
}

function dataUriToBuffer(dataUri: string): Buffer {
  const comma = dataUri.indexOf(',');
  const encoded = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
  return Buffer.from(encoded, 'base64');
}

async function parseUpload(request: NextRequest): Promise<ParsedUpload> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as {
      file?: string;
      type?: MediaType;
      description?: string;
      date?: string;
      details?: string;
      isBest?: boolean;
    };
    if (!body.file || !body.type) {
      throw new Error('MISSING_FIELDS');
    }
    return {
      buffer: dataUriToBuffer(body.file),
      type: body.type,
      description: body.description || '',
      date: body.date || '',
      details: body.details || '',
      isBest: !!body.isBest,
    };
  }

  const form = await request.formData();
  const uploadedFile = form.get('file');
  const type = String(form.get('type') || '') as MediaType;
  if (!isUploadBlob(uploadedFile) || !type) {
    throw new Error('MISSING_FIELDS');
  }

  return {
    buffer: Buffer.from(await uploadedFile.arrayBuffer()),
    type,
    description: String(form.get('description') || ''),
    date: String(form.get('date') || ''),
    details: String(form.get('details') || ''),
    isBest: form.get('isBest') === 'true',
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { buffer, type, description, date, details, isBest } = await parseUpload(request);

    if (isBest) {
      const bestCount = await prisma.media.count({ where: { isBest: true } });
      if (bestCount >= BEST_LIMIT) {
        return NextResponse.json(
          { error: `لا يمكن تجاوز الحد الأقصى (${BEST_LIMIT}) لعناصر Best Media` },
          { status: 400 }
        );
      }
    }

    const uploaded = await uploadToCloudinary(buffer, 'gallery', type === 'VIDEO' ? 'video' : 'image');

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
    if (err instanceof Error && err.message === 'MISSING_FIELDS') {
      return NextResponse.json({ error: 'الملف والنوع مطلوبان' }, { status: 400 });
    }
    console.error('Media create error:', err);
    return NextResponse.json({ error: 'فشل رفع الوسائط' }, { status: 500 });
  }
}
