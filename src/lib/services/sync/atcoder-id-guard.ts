interface AtCoderIdGuardTransaction {
  user: {
    findUnique(args: {
      select: { atcoderId: true };
      where: { id: string };
    }): Promise<{ atcoderId: string | null } | null>;
  };
}

export async function isCurrentAtCoderId(
  transaction: AtCoderIdGuardTransaction,
  userId: string,
  expectedAtCoderId: string
): Promise<boolean> {
  const user = await transaction.user.findUnique({
    where: { id: userId },
    select: { atcoderId: true },
  });

  return user?.atcoderId === expectedAtCoderId;
}
