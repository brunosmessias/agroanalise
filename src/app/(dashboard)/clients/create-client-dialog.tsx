"use client";

import { useRouter } from "next/navigation";
import { ClientFormDialog } from "~/components/clients/client-form-dialog";

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClientDialog({
  open,
  onOpenChange,
}: CreateClientDialogProps) {
  const router = useRouter();

  return (
    <ClientFormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={(created) => {
        router.push(`/clients/${created.id}/profile`);
      }}
    />
  );
}
