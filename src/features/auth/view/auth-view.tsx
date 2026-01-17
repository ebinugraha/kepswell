"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { LockIcon, MailIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export type SignInTypes = z.infer<typeof signInSchema>;

export const AuthView = () => {
  const form = useForm<SignInTypes>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();

  const handleSubmit = (data: SignInTypes) => {
    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <div className="flex flex-col items-center mb-8 space-y-4">
        <Image src="/logo.svg" alt="Kepswell Logo" width={80} height={80} />
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-2xl font-bold">Penilaian Kinerja</h1>
          <h1 className="font-bold text-muted-foreground">Toko Kepswell</h1>
        </div>
      </div>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Masuk Ke Kepswell</CardTitle>
          <CardDescription>Masukan akun anda untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <div className="grid gap-2">
                    <FormItem>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute size-4 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Email"
                          className="pl-10"
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
                    <FormItem>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <LockIcon className="absolute size-4 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Password"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
              <Button type="submit" className="w-full h-10">
                Masuk
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <CardDescription>
            <Separator />
            <div className=" mt-2 flex flex-col gap-2 text-xs">
              <span>Demo Credentials:</span>
              <span>Manager: manager@test.com / password123</span>
              <span>HRD: hrd@test.com / password123</span>
            </div>
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
};
