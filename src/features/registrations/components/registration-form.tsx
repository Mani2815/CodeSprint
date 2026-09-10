'use client';
/* eslint-disable @next/next/no-img-element */

import { type FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const fields = ['name', 'email', 'phone', 'className', 'regNo'] as const;
type Profile = {
  username: string;
  displayName: string;
  avatarUrl: string;
  publicRepositoryCount: number;
  profileUrl: string;
};
type Verification = {
  username: string;
  loading: boolean;
  error: string | null;
  profile: Profile | null;
};
const emptyVerifications = (): Verification[] =>
  [0, 1].map(() => ({ username: '', loading: false, error: null, profile: null }));

export function RegistrationForm() {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifications, setVerifications] = useState<Verification[]>(emptyVerifications);

  function updateUsername(index: number, username: string) {
    setVerifications((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index && item.username !== username
          ? { username, loading: false, error: null, profile: null }
          : item
      )
    );
  }
  async function verify(index: number) {
    const username = verifications[index]?.username.trim().replace(/^@/, '');
    if (!username || verifications[index]?.loading || verifications[index]?.profile) return;
    setVerifications((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, loading: true, error: null } : item
      )
    );
    const response = await fetch(`/api/github/users/${encodeURIComponent(username)}`);
    const json = await response.json().catch(() => ({}));
    setVerifications((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index && item.username.trim().replace(/^@/, '') === username
          ? {
              ...item,
              loading: false,
              error: response.ok
                ? null
                : (json.error ?? 'GitHub user not found. Please check the username.'),
              profile: response.ok ? json.data : null,
            }
          : item
      )
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const members = [0, 1].map((index) => ({
      name: form.get(`member-${index}-name`) as string,
      email: form.get(`member-${index}-email`) as string,
      phone: form.get(`member-${index}-phone`) as string,
      className: form.get(`member-${index}-className`) as string,
      regNo: form.get(`member-${index}-regNo`) as string,
      githubUsername: (form.get(`member-${index}-githubUsername`) as string)
        .trim()
        .replace(/^@/, ''),
      isLeader: index === 0,
    }));
    if (members.some((member) => !/^\d{10}$/.test(member.phone))) {
      setError('Please enter exactly 10 digits for all phone numbers.');
      setSaving(false);
      return;
    }
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: form.get('teamName'),
        projectName: 'CodeSprint Weekly Projects',
        projectDescription: 'Building 2 new projects over 2 weeks for the CodeSprint competition.',
        college: 'N/A',
        repositoryUrl: '',
        members,
      }),
    });
    if (response.ok) setSuccess(true);
    else {
      const json = await response.json().catch(() => ({}));
      setError(json.error ?? 'Unable to submit registration.');
    }
    setSaving(false);
  }
  if (success)
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/20 text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground">
          Registration Submitted Successfully!
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Your registration has been received and is pending organizer approval.
        </p>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      className="space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <section className="space-y-4">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-foreground">
          Team Information
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="teamName">
            Team Name <span className="text-error">*</span>
          </Label>
          <Input
            id="teamName"
            name="teamName"
            required
            placeholder="e.g. Code Ninjas"
            className="max-w-md"
          />
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-foreground">
          Team Members
        </h2>
        {[0, 1].map((index) => {
          const verification = verifications[index]!;
          return (
            <div
              key={index}
              className="grid gap-4 rounded-xl border border-border/50 bg-surface/30 p-5 sm:grid-cols-2"
            >
              <h3 className="font-medium text-foreground sm:col-span-2">
                {index === 0 ? 'Member 1 (Team Leader)' : `Member ${index + 1}`}
              </h3>
              {fields.map((field) => (
                <div key={field} className={field === 'name' ? 'sm:col-span-2' : ''}>
                  <Label htmlFor={`member-${index}-${field}`} className="mb-1.5 block">
                    {field === 'name'
                      ? 'Full Name'
                      : field === 'email'
                        ? 'Christ Email Address'
                        : field === 'phone'
                          ? 'Phone Number'
                          : field === 'className'
                            ? 'Class'
                            : 'Registration Number'}
                    <span className="ml-1 text-error">*</span>
                  </Label>
                  {field === 'className' ? (
                    <Select name={`member-${index}-${field}`} required>
                      <SelectTrigger id={`member-${index}-${field}`}>
                        <SelectValue placeholder="Select your class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 MCA A">1 MCA A</SelectItem>
                        <SelectItem value="1 MCA B">1 MCA B</SelectItem>
                        <SelectItem value="1 M.Sc AIM">1 M.Sc AIM</SelectItem>
                        <SelectItem value="4 MCA A">4 MCA A</SelectItem>
                        <SelectItem value="4 MCA B">4 MCA B</SelectItem>
                        <SelectItem value="4 M.Sc AIM">4 M.Sc AIM</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`member-${index}-${field}`}
                      name={`member-${index}-${field}`}
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      required
                      maxLength={field === 'phone' ? 10 : undefined}
                      minLength={field === 'phone' ? 10 : undefined}
                      pattern={field === 'phone' ? '\\d{10}' : undefined}
                      placeholder={
                        field === 'phone'
                          ? 'e.g. 9876543210'
                          : field === 'regNo'
                            ? 'e.g. 2547201'
                            : field === 'name'
                              ? 'Full Name'
                              : 'Email Address'
                      }
                    />
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <Label htmlFor={`member-${index}-githubUsername`} className="mb-1.5 block">
                  GitHub Username <span className="text-error">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`member-${index}-githubUsername`}
                    name={`member-${index}-githubUsername`}
                    required
                    placeholder="e.g. octocat"
                    value={verification.username}
                    onChange={(event) => updateUsername(index, event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => verify(index)}
                    disabled={
                      !verification.username.trim() ||
                      verification.loading ||
                      Boolean(verification.profile)
                    }
                  >
                    {verification.loading ? (
                      <>
                        <Loader2 className="animate-spin" /> Verifying
                      </>
                    ) : verification.profile ? (
                      'Verified'
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
                {verification.error && (
                  <p role="alert" className="mt-2 text-sm text-error">
                    {verification.error}
                  </p>
                )}
                {verification.profile && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
                    <CheckCircle2 className="size-5 text-success" />
                    <img
                      src={verification.profile.avatarUrl}
                      alt=""
                      className="size-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-success">Profile Verified</p>
                      <p>
                        {verification.profile.displayName}{' '}
                        <span className="text-muted-foreground">
                          @{verification.profile.username}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        {verification.profile.publicRepositoryCount} public repositories ·{' '}
                        <a
                          className="underline"
                          href={verification.profile.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub profile
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
      <section className="space-y-4 rounded-xl border border-border/50 bg-surface/30 p-5">
        <h2 className="font-semibold text-foreground">Declaration</h2>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" required className="mt-1 accent-primary" />
          <span>
            I confirm that all information provided is accurate.{' '}
            <span className="text-error">*</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" required className="mt-1 accent-primary" />
          <span>
            I agree to the CodeSprint Rules and Code of Conduct.{' '}
            <span className="text-error">*</span>
          </span>
        </label>
      </section>
      {error && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-3 rounded-md border p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Please double-check all information before submitting.
        </p>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? 'Submitting…' : 'Register Team'}
        </Button>
      </div>
    </form>
  );
}
