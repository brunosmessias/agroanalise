"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Sprout,
  UserPlus,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { updateProfileSchema, type UpdateProfileInput } from "~/shared/schemas/user";
import { ClientFormDialog } from "~/components/clients/client-form-dialog";
import { ImageUploader } from "~/components/image-uploader";

type User = NonNullable<RouterOutputs["user"]["me"]>;

interface OnboardingWizardProps {
  user: User;
}

const steps = [
  { id: 1, title: "Boas-vindas", icon: Sparkles },
  { id: 2, title: "Seu perfil", icon: UserPlus },
  { id: 3, title: "Primeira fazenda", icon: Sprout },
  { id: 4, title: "Pronto!", icon: Rocket },
] as const;

export function OnboardingWizard({ user }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(user.image);
  const [farmerDialogOpen, setFarmerDialogOpen] = useState(false);
  const utils = api.useUtils();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      company: user.company ?? "",
      bio: user.bio ?? "",
      image: user.image,
    },
  });

  const name = watch("name");

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.user.me.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar perfil: ${error.message}`);
    },
  });

  const completeOnboardingMutation = api.user.completeOnboarding.useMutation({
    onSuccess: async () => {
      toast.success("Onboarding concluído! Bem-vindo ao AgroAnalise!");
      await utils.user.me.invalidate();
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Erro ao finalizar: ${error.message}`);
    },
  });

  const skipOnboardingMutation = api.user.skipOnboarding.useMutation({
    onSuccess: async () => {
      router.push("/dashboard");
      router.refresh();
    },
  });

  const handleProfileSubmit = async (data: UpdateProfileInput) => {
    await updateProfileMutation.mutateAsync({
      ...data,
      image: profileImage,
    });
    setCurrentStep(3);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === 3) {
      handleNext();
    } else {
      skipOnboardingMutation.mutate();
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-foreground flex items-center gap-2 text-lg font-semibold"
          >
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Sprout className="h-4 w-4" />
            </div>
            AgroAnalise
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipOnboardingMutation.mutate()}
            disabled={skipOnboardingMutation.isPending}
          >
            Pular onboarding
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              return (
                <div
                  key={step.id}
                  className="flex flex-1 items-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        isActive && "border-primary bg-primary text-primary-foreground scale-110 shadow-md",
                        isComplete && "border-primary bg-primary text-primary-foreground",
                        !isActive && !isComplete && "border-muted-foreground/30 bg-background text-muted-foreground",
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "hidden text-xs font-medium sm:block",
                        isActive && "text-foreground",
                        !isActive && "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 flex-1 transition-colors",
                        currentStep > step.id
                          ? "bg-primary"
                          : "bg-muted-foreground/30",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 shadow-sm sm:p-10">
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                <Sparkles className="text-primary h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Bem-vindo ao AgroAnalise, {user.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">
                  Vamos configurar sua conta em poucos passos para que você
                  comece a gerenciar suas fazendas e análises.
                </p>
              </div>
              <div className="mx-auto grid max-w-md gap-3 pt-4 text-left sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <UserPlus className="text-primary mb-2 h-5 w-5" />
                  <p className="text-xs font-medium">Personalize seu perfil</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <Sprout className="text-primary mb-2 h-5 w-5" />
                  <p className="text-xs font-medium">Cadastre fazendas</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <Rocket className="text-primary mb-2 h-5 w-5" />
                  <p className="text-xs font-medium">Registre análises</p>
                </div>
              </div>
              <Button size="lg" onClick={handleNext} className="mt-2">
                Começar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <form
              onSubmit={handleSubmit(handleProfileSubmit)}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Conte-nos sobre você
                </h2>
                <p className="text-muted-foreground mt-2">
                  Essas informações ajudam a personalizar sua experiência
                </p>
              </div>

              <div className="flex justify-center">
                <ImageUploader
                  value={profileImage}
                  onChange={setProfileImage}
                  name={name || user.name}
                  purpose="avatar"
                  size="xl"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa / Consultoria</Label>
                <Input
                  id="company"
                  placeholder="Ex: Consultoria Agrícola Sul"
                  {...register("company")}
                />
                {errors.company && (
                  <p className="text-sm text-destructive">
                    {errors.company.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre você (opcional)</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Engenheiro agrônomo, especialista em..."
                  {...register("bio")}
                />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting || updateProfileMutation.isPending}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || updateProfileMutation.isPending}
                >
                  {(isSubmitting || updateProfileMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                <Sprout className="text-primary h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Cadastre sua primeira fazenda
                </h2>
                <p className="text-muted-foreground mt-2">
                  Adicione uma fazenda para começar a registrar análises.
                  Você pode pular esta etapa e adicionar depois.
                </p>
              </div>
              <div className="mx-auto flex max-w-sm flex-col gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => setFarmerDialogOpen(true)}
                >
                  <Sprout className="mr-2 h-4 w-4" />
                  Cadastrar fazenda
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={skipOnboardingMutation.isPending}
                >
                  Pular por enquanto
                </Button>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                <Rocket className="text-primary h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Tudo pronto!
                </h2>
                <p className="text-muted-foreground mt-2">
                  Sua conta está configurada. Vamos começar a gerenciar suas
                  fazendas e análises.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => completeOnboardingMutation.mutate()}
                disabled={completeOnboardingMutation.isPending}
                className="mt-2"
              >
                {completeOnboardingMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Ir para o dashboard
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ClientFormDialog
        open={farmerDialogOpen}
        onOpenChange={(open) => {
          setFarmerDialogOpen(open);
          if (!open) {
            setCurrentStep(4);
          }
        }}
      />
    </div>
  );
}
