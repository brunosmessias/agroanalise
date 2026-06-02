"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, FileText, User } from "lucide-react";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  createClientSchema,
  updateClientSchema,
} from "~/shared/schemas/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ImageUploader } from "~/components/image-uploader";

type ClientData = RouterOutputs["clients"]["getById"];

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientData;
  onSuccess?: (client: NonNullable<ClientData>) => void;
}

type FormValues = {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  image: string | null;
};

const emptyValues: FormValues = {
  name: "",
  document: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  notes: "",
  image: null,
};

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: ClientFormDialogProps) {
  const utils = api.useUtils();
  const isEditing = !!client;

  const formSchema = isEditing ? updateClientSchema : createClientSchema;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: emptyValues,
  });

  const image = watch("image");

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          name: client.name,
          document: client.document ?? "",
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: client.address ?? "",
          city: client.city ?? "",
          state: client.state ?? "",
          notes: client.notes ?? "",
          image: client.image ?? null,
        });
      } else {
        reset(emptyValues);
      }
    }
  }, [client, open, reset]);

  const createMutation = api.clients.create.useMutation({
    onSuccess: async (result) => {
      toast.success("Fazenda cadastrada com sucesso!");
      await utils.clients.list.invalidate();
      if (result) {
        onSuccess?.(result);
        onOpenChange(false);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    },
  });

  const updateMutation = api.clients.update.useMutation({
    onSuccess: async (result) => {
      toast.success("Fazenda atualizada com sucesso!");
      await Promise.all([
        utils.clients.list.invalidate(),
        client?.id ? utils.clients.getById.invalidate({ id: client.id }) : Promise.resolve(),
      ]);
      if (result) {
        onSuccess?.(result);
        onOpenChange(false);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      document: data.document || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      notes: data.notes || null,
      image: data.image,
    };

    if (isEditing && client) {
      updateMutation.mutate({ id: client.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar fazenda" : "Nova fazenda"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize as informações da fazenda."
                : "Cadastre uma nova fazenda para começar a registrar análises."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-center">
            <ImageUploader
              value={image}
              onChange={(url) => setValue("image", url, { shouldDirty: true })}
              name={watch("name") || "Agricultor"}
              purpose="avatar"
              size="lg"
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da fazenda *</Label>
              <Input
                id="name"
                placeholder="Ex: Fazenda São José"
                {...register("name")}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="document">CPF / CNPJ</Label>
                <div className="relative">
                  <FileText className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="document"
                    placeholder="000.000.000-00"
                    className="pl-9"
                    {...register("document")}
                  />
                </div>
                {errors.document && (
                  <p className="text-sm text-destructive">
                    {errors.document.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    className="pl-9"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@exemplo.com"
                  className="pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Endereço
              </Label>
              <Input
                placeholder="Rua, número, bairro"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Ex: Uberlândia" {...register("city")} />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  placeholder="MG"
                  maxLength={2}
                  {...register("state")}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Observações
              </Label>
              <Textarea
                placeholder="Informações adicionais: cultura principal, área total, proprietário, infraestrutura..."
                rows={3}
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Cadastrar fazenda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
