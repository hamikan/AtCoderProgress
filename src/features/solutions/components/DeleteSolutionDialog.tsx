'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteSolutionDialogProps {
  label: string;
  onCancel: () => void;
  onDelete: () => Promise<boolean>;
}

export default function DeleteSolutionDialog({
  label,
  onCancel,
  onDelete,
}: DeleteSolutionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    setFailed(false);
    const ok = await onDelete();
    if (!ok) {
      setIsDeleting(false);
      setFailed(true);
    }
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">「{label}」を消しますか？</AlertDialogTitle>
          <AlertDialogDescription>消した記録は元に戻せません。</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-red-600">
            記録を消せませんでした。少し待ってから、もう一度試してください。
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>やめる</AlertDialogCancel>
          <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            消す
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
