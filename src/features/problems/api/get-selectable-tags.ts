import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SelectableTag } from '@/features/problems/types';

export async function getSelectableTags(userId?: string): Promise<SelectableTag[]> {
  const [allMasterTags, userTags] = await Promise.all([
    prisma.tag.findMany(),
    userId
      ? prisma.userTag.findMany({
          where: { createdById: userId },
          include: { _count: { select: { solutions: true } } },
        })
      : [],
  ]);

  const linkedMasterTagIds = new Set(userTags.map((userTag) => userTag.tagId));

  const combined: SelectableTag[] = [
    ...allMasterTags
      .filter((tag) => !linkedMasterTagIds.has(tag.id))
      .map(({ id, name }) => ({ id, name, usageCount: 0 })),
    ...userTags.map(({ id, name, _count }) => ({
      id,
      name,
      usageCount: _count.solutions,
    })),
  ];

  return combined.sort((a, b) => a.name.localeCompare(b.name));
}
