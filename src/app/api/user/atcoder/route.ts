
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { atcoderId } = await req.json();

  if (!atcoderId || typeof atcoderId !== 'string') {
    return NextResponse.json({ error: 'AtCoder ID is required' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { atcoderId: atcoderId },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user with AtCoder ID:', error);
    // Prismaのエラーコードをチェックして、ユニーク制約違反の場合のメッセージを返す
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if ((error as { code: string }).code === 'P2002') {
        return NextResponse.json({ error: 'This AtCoder ID is already taken.' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Failed to update AtCoder ID' }, { status: 500 });
  }
}
