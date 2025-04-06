// /api/manga/[id]/share/route.ts
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(request);
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const manga = await db.manga.findFirst({
      where: { id, userId },
    });

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    // Se já tiver shareId, retorna o existente
    if (manga.shareId) {
      return NextResponse.json({ shareId: manga.shareId });
    }

    const newShareId = nanoid(12);

    const updated = await db.manga.update({
      where: { id },
      data: { shareId: newShareId },
    });

    return NextResponse.json({ shareId: updated.shareId });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to share manga' }, { status: 500 });
  }
}