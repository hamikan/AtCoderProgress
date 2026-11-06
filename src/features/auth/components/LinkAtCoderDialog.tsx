'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AtCoderIdForm from '@/features/auth/components/AtCoderIdForm';

interface LinkAtCoderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAtCoderId?: string | null;
}

export default function LinkAtCoderDialog({
  open,
  onOpenChange,
  currentAtCoderId,
}: LinkAtCoderDialogProps) {
  const router = useRouter();
  const { update } = useSession();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AtCoder IDを設定</DialogTitle>
          <DialogDescription>
            あなたの分析に使うAtCoder IDを入力してください。
            {currentAtCoderId && `今のIDは ${currentAtCoderId} です。`}
          </DialogDescription>
        </DialogHeader>
        <AtCoderIdForm
          canSubmit
          submitLabel="設定する"
          onLinked={async () => {
            await update();
            onOpenChange(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
