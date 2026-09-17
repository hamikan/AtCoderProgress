import 'server-only';

import { prisma } from '@/lib/prisma';
import type { SelectableTag } from '@/features/problems/types';

export async function getSelectableTags(userId?: string): Promise<SelectableTag[]> {
  const [allMasterTags, userTags] = await Promise.all([
    prisma.tag.findMany(),
    userId
      ? prisma.userTag.findMany({ where: { createdById: userId } })
      : [],
  ]);

  const linkedMasterTagIds = new Set(userTags.map((userTag) => userTag.tagId));

  const combined = [
    ...allMasterTags.filter((tag) => !linkedMasterTagIds.has(tag.id)),
    ...userTags,
  ];

  return combined
    .map(({ id, name }) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
