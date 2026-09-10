'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Loader2, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginInput } from '@/features/auth/validations/login-schema';
import { ROUTES } from '@/lib/constants';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    setIsSubmitting(true);

    const result = await signIn('credentials', {
      username: values.username,
      password: values.password,
      rememberMe: String(values.rememberMe),
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      // Same generic message NextAuth's authorize() throws — never reveals
      // whether the username or password was the problem.
      setFormError('Invalid username or password.');
      return;
    }

    const callbackUrl = searchParams?.get('callbackUrl') ?? ROUTES.ADMIN_DASHBOARD;
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="organizer"
            className="pl-10"
            aria-invalid={Boolean(errors.username)}
            {...register('username')}
          />
        </div>
        {errors.username && <p className="text-sm text-error">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </div>
        {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          type="checkbox"
          className="size-4 rounded border-border bg-surface accent-primary"
          {...register('rememberMe')}
        />
        <Label htmlFor="rememberMe" className="cursor-pointer font-normal text-muted-foreground">
          Remember me for 30 days
        </Label>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error"
        >
          {formError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
