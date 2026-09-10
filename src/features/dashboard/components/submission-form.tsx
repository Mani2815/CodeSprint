'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Checkpoint } from '@prisma/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  checkpointId: z.string().min(1, 'Please select a week'),
  projectTitle: z.string().min(3, 'Title must be at least 3 characters'),
  projectDescription: z.string().min(10, 'Description must be at least 10 characters'),
  problemStatement: z.string().min(10, 'Problem statement is required'),
  keyFeatures: z.string().min(10, 'Key features are required'),
  technologyStack: z.string().min(2, 'Technology stack is required'),
  aiToolsUsed: z.string().optional(),
  repositoryUrl: z.string().url('Must be a valid URL'),
  demoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  demoVideoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  presentationUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SubmissionForm({ activeCheckpoints }: { activeCheckpoints: Checkpoint[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [repoStatus, setRepoStatus] = React.useState<
    | null
    | {
      isValid: true;
      name: string;
      owner: string;
      language: string;
      updatedAt: string;
      visibility: string;
    }
    | { isValid: false; error: string }
  >(null);

  const defaultCheckpointId =
    activeCheckpoints.find((c) => c.isActive)?.id ?? activeCheckpoints[0]?.id ?? '';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkpointId: defaultCheckpointId,
      projectTitle: '',
      projectDescription: '',
      problemStatement: '',
      keyFeatures: '',
      technologyStack: '',
      aiToolsUsed: '',
      repositoryUrl: '',
      demoUrl: '',
      demoVideoUrl: '',
      presentationUrl: '',
      additionalNotes: '',
    },
  });

  const repoUrl = useWatch({ control: form.control, name: 'repositoryUrl' });

  // Reset validation status if URL changes
  React.useEffect(() => {
    setRepoStatus(null);
  }, [repoUrl]);

  async function validateRepository() {
    if (!repoUrl) return;
    setIsValidating(true);
    try {
      const res = await fetch(`/api/github/repository?url=${encodeURIComponent(repoUrl)}`);
      const data = await res.json();
      if (!res.ok) {
        setRepoStatus({ isValid: false, error: data.error || 'Failed to validate repository' });
      } else {
        setRepoStatus({
          isValid: true,
          name: data.name,
          owner: data.owner,
          language: data.language,
          updatedAt: data.updatedAt,
          visibility: data.visibility,
        });
      }
    } catch {
      setRepoStatus({ isValid: false, error: 'Network error occurred during validation' });
    } finally {
      setIsValidating(false);
    }
  }

  async function onSubmit(data: FormValues) {
    if (!repoStatus?.isValid) {
      toast({
        variant: 'destructive',
        title: 'Validation Required',
        description: 'Please validate your GitHub repository before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit project');
      }

      toast({
        title: 'Submission Successful!',
        description: 'Your project has been queued for GitHub analysis.',
      });

      router.push(`/dashboard/history/${result.data.id}`);
      router.refresh();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Project</CardTitle>
        <CardDescription>
          Provide the details of your weekly deliverable. You can only submit once per week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="checkpointId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeCheckpoints.map((checkpoint) => (
                        <SelectItem key={checkpoint.id} value={checkpoint.id}>
                          {checkpoint.label} {checkpoint.isActive ? '(Current)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the week you are submitting for.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <h3 className="font-semibold">Repository Details</h3>
              <FormField
                control={form.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repository URL *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="https://github.com/owner/repo" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={validateRepository}
                        disabled={isValidating || !repoUrl}
                      >
                        {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Validate
                      </Button>
                    </div>
                    <FormDescription>
                      Must be a public repository. We will automatically analyze your commits.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {repoStatus && (
                <div
                  className={`rounded-md border p-4 ${repoStatus.isValid ? 'border-success/20 bg-success/10' : 'bg-destructive/10 border-destructive/20'}`}
                >
                  {repoStatus.isValid ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-medium text-success">
                        <CheckCircle2 className="h-4 w-4" /> Valid Repository
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span> {repoStatus.name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Owner:</span> {repoStatus.owner}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Language:</span>{' '}
                          {repoStatus.language}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Visibility:</span>{' '}
                          {repoStatus.visibility}
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Last Updated:</span>{' '}
                          {new Date(repoStatus.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-destructive flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4" /> {repoStatus.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <h3 className="font-semibold">Project Details</h3>
              <FormField
                control={form.control}
                name="projectTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Authentication Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="problemStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Statement *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What specific problem are you solving?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe what your team built this week..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keyFeatures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Features *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="- User authentication&#10;- Real-time chat&#10;..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="technologyStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technology Stack *</FormLabel>
                      <FormControl>
                        <Input placeholder="Next.js, Tailwind, Prisma..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aiToolsUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Tools Used (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ChatGPT, GitHub Copilot..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <h3 className="font-semibold">Media & Links</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="demoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployed Link (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-app.vercel.app" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="demoVideoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demo Video URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="presentationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Post (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/post/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any blockers or notes for the faculty..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between rounded-lg border bg-surface p-4">
              <div className="text-sm">
                <p className="font-medium">Declaration</p>
                <p className="text-muted-foreground">
                  By submitting, I confirm this repository belongs to our team.
                </p>
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting || !repoStatus?.isValid}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Project'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
