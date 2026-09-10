import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RegistrationForm } from '@/features/registrations/components/registration-form';
import { H1, Muted } from '@/components/shared/typography';
export const metadata = { title: 'Register your team' };
export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-12">
        <H1>Register your team</H1>
        <Muted className="mt-2 text-base">
          Register your team for CodeSprint 2026. Each team must consist of exactly 2 members. Once
          your registration is approved by the organizers, your team will be eligible to participate
          in the weekly project challenges.
        </Muted>
        <div className="mt-8">
          <RegistrationForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
