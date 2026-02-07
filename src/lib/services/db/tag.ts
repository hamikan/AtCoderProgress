import { prisma } from '@/lib/prisma';

export interface AvailableTag {
  id: string;
  name: string;
}

export async function getAvailableTagsFromDB(userId?: string): Promise<Array<AvailableTag>> {
  const [allMasterTags, userTags] = await Promise.all([
    prisma.tag.findMany(),
    userId 
      ? prisma.userTag.findMany({ where: { createdById: userId } }) 
      : [],
  ]);

  const linkedMasterTagIds = new Set(userTags.map(ut => ut.tagId));

  const combined = [
    ...allMasterTags.filter(t => !linkedMasterTagIds.has(t.id)),
    ...userTags
  ];

  return combined
    .map(({ id, name }) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
