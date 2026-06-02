"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Camera,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "~/shared/schemas/user";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ImageUploader } from "~/components/image-uploader";

type User = NonNullable<RouterOutputs["user"]["me"]>;

export function ProfilePage({ user: initialUser }: { user: User }) {
  const [image, setImage] = useState<string | null>(initialUser.image);
  const utils = api.useUtils();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialUser.name,
      phone: initialUser.phone ?? "",
      company: initialUser.company ?? "",
      bio: initialUser.bio ?? "",
      image: initialUser.image,
    },
  });

  const name = watch("name");

  useEffect(() => {
    reset({
      name: initialUser.name,
      phone: initialUser.phone ?? "",
      company: initialUser.company ?? "",
      bio: initialUser.bio ?? "",
      image: initialUser.image,
    });
    setImage(initialUser.image);
  }, [initialUser, reset]);

  useEffect(() => {
    setValue("image", image);
  }, [image, setValue]);

  const updateMutation = api.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      toast.success("Perfil atualizado com sucesso!");
      await utils.user.me.invalidate();
      if (data) {
        reset({
          name: data.name,
          phone: data.phone ?? "",
          company: data.company ?? "",
          bio: data.bio ?? "",
          image: data.image,
        });
        setImage(data.image);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    updateMutation.mutate({
      ...data,
      image,
    });
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações profissionais
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="border-background h-32 w-32 border-4 shadow-lg">
                <AvatarImage
                  src={image ?? undefined}
                  alt={name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                  {initials || <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">
                {initialUser.name}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {initialUser.email}
              </p>
              <Badge variant="secondary" className="mt-3">
                <Shield className="mr-1 h-3 w-3" />
                Agricultor
              </Badge>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Conta criada em</span>
                <span>
                  {new Date(initialUser.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Última atualização</span>
                <span>
                  {new Date(initialUser.updatedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Camera className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Foto de Perfil</CardTitle>
                  <CardDescription>
                    Sua foto será exibida nos relatórios e na plataforma
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ImageUploader
                  value={image}
                  onChange={setImage}
                  name={name || "Agricultor"}
                  purpose="avatar"
                  size="md"
                />
                <div className="flex-1 text-sm text-muted-foreground">
                  <p>Formatos: JPG, PNG ou WebP.</p>
                  <p>Tamanho máximo: 5MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <User className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Seus dados profissionais como agricultor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <Input
                        id="email"
                        type="email"
                        value={initialUser.email}
                        disabled
                        className="pl-9"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Email não pode ser alterado
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa / Propriedade</Label>
                    <div className="relative">
                      <Building2 className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <Input
                        id="company"
                        placeholder="Nome da sua empresa ou propriedade"
                        className="pl-9"
                        {...register("company")}
                      />
                    </div>
                    {errors.company && (
                      <p className="text-sm text-destructive">
                        {errors.company.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    Sobre você
                  </Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    placeholder="Conte um pouco sobre sua experiência, especialidades..."
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">
                      {errors.bio.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || updateMutation.isPending}
                  >
                    {(isSubmitting || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
