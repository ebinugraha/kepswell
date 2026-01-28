"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import z from "zod";
import { signInSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LockIcon, MailIcon, Loader2, CheckCircle2 } from "lucide-react";

export type SignInTypes = z.infer<typeof signInSchema>;

export const AuthView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SignInTypes>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();

  const handleSubmit = async (data: SignInTypes) => {
    setIsLoading(true);
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          setIsLoading(false);
          // Opsi: Tambahkan toast error di sini jika ada library toast
          alert(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      {/* Sisi Kiri: Form Login */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="flex flex-col text-center lg:text-left gap-2 mb-4">
            {/* Logo Mobile (hanya muncul di layar kecil) */}
            <div className="flex justify-center lg:justify-start lg:hidden mb-4">
              <Image
                src="/logo.svg"
                alt="Kepswell Logo"
                width={60}
                height={60}
              />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Selamat Datang Kembali
            </h1>
            <p className="text-muted-foreground text-sm">
              Masukan kredensial akun Kepswell Anda untuk melanjutkan.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <div className="grid gap-2">
                    <FormItem>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute size-4 left-3 top-3 text-muted-foreground" />
                        <Input
                          id="email"
                          placeholder="nama@perusahaan.com"
                          className="pl-9 h-11"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <FormItem>
                      <div className="relative">
                        <LockIcon className="absolute size-4 left-3 top-3 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          className="pl-9 h-11"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </Button>
            </form>
          </Form>

          {/* Demo Credentials Section - Styled Professional */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Demo Access
              </span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  Manager Account
                </span>
                <span>manager@test.com / password123</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  HRD Account
                </span>
                <span>hrd@test.com / password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Branding / Hero Section */}
      <div className="hidden bg-zinc-900 lg:flex flex-col justify-between p-10 text-white dark:border-r">
        <div className="flex items-center gap-2 font-medium text-lg">
          <div className="bg-white/10 p-2 rounded-md">
            <Image src="/logo.svg" alt="Kepswell Logo" width={30} height={30} />
          </div>
          <span>Toko Kepswell</span>
        </div>

        <div className="space-y-4 max-w-lg">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium leading-relaxed">
              &ldquo;Sistem penilaian kinerja karyawan menggunakan metode SMART
              di toko kepswell&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">
              Penilaian Kinerja karyawan berbasis Metode SMART
            </footer>
          </blockquote>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>© 2026 Kepswell. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};
