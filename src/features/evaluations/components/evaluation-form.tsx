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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Evaluation } from '@prisma/client';

const score10 = z.coerce.number().int().min(0).max(10);
const score20 = z.coerce.number().int().min(0).max(20);

const formSchema = z.object({
  problemUnderstanding: score10,
  innovation: score10,
  functionality: score10,
  technical: score10,
  ui: score10,
  documentation: score10,
  impact: score10,
  timelySubmission: score10,
  githubScore: score20,
  comments: z.string().max(3000).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function EvaluationForm({
  teamId,
  checkpointId,
  initialData,
  suggestedGithubScore,
  submissionTimestamps,
}: {
  teamId: string;
  checkpointId: string;
  initialData?: Evaluation | null;
  suggestedGithubScore: number;
  submissionTimestamps?: {
    submittedAt: Date;
    openDate?: Date | null;
    closeDate?: Date | null;
  };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemUnderstanding: initialData?.problemUnderstanding ?? 0,
      innovation: initialData?.innovation ?? 0,
      functionality: initialData?.functionality ?? 0,
      technical: initialData?.technical ?? 0,
      ui: initialData?.ui ?? 0,
      documentation: initialData?.documentation ?? 0,
      impact: initialData?.impact ?? 0,
      timelySubmission: initialData?.timelySubmission ?? 0,
      githubScore: initialData?.githubScore || suggestedGithubScore,
      comments: initialData?.comments ?? '',
    },
  });

  const watchAllFields = useWatch({ control: form.control });

  const calculateTotal = () => {
    const values = watchAllFields;
    return (
      (Number(values.problemUnderstanding) || 0) +
      (Number(values.innovation) || 0) +
      (Number(values.functionality) || 0) +
      (Number(values.technical) || 0) +
      (Number(values.ui) || 0) +
      (Number(values.documentation) || 0) +
      (Number(values.impact) || 0) +
      (Number(values.timelySubmission) || 0) +
      (Number(values.githubScore) || 0)
    );
  };

  const total = calculateTotal();

  async function onSubmit(data: FormValues, isPublished: boolean) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, checkpointId, isPublished, ...data }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save evaluation');

      toast({ title: 'Evaluation Saved', description: 'The leaderboard has been updated.' });
      router.refresh();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const projectFields = [
    { name: 'problemUnderstanding', label: 'Problem Understanding' },
    { name: 'innovation', label: 'Innovation & Creativity' },
    { name: 'functionality', label: 'Functionality & Completeness' },
    { name: 'technical', label: 'Technical Implementation' },
    { name: 'ui', label: 'UI/UX & Design' },
    { name: 'documentation', label: 'Documentation & Code Quality' },
    { name: 'impact', label: 'Impact, Practicality & SDG' },
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        
        {/* SECTION A: PROJECT EVALUATION */}
        <div className="space-y-4 rounded-xl border border-border p-6 shadow-sm">
          <div className="mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-foreground">PROJECT EVALUATION — 70 MARKS</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {projectFields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label} (/10)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={10} {...formField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* SECTION B: GITHUB ACTIVITY */}
        <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
          <div className="mb-4 border-b border-primary/20 pb-2">
            <h3 className="text-lg font-bold text-primary">GITHUB ACTIVITY & TEAM CONTRIBUTION — 20 MARKS</h3>
          </div>
          <FormField
            control={form.control}
            name="githubScore"
            render={({ field: formField }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="font-semibold text-primary">GitHub Score (/20)</FormLabel>
                  <span className="text-xs font-medium text-muted-foreground">
                    Suggested: {suggestedGithubScore}
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    {...formField}
                    className="border-primary/30"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SECTION C: TIMELY SUBMISSION */}
        <div className="space-y-4 rounded-xl border border-border p-6 shadow-sm">
          <div className="mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-foreground">TIMELY SUBMISSION & CONSISTENCY — 10 MARKS</h3>
          </div>
          <FormField
            control={form.control}
            name="timelySubmission"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>Timeliness & Consistency (/10)</FormLabel>
                {submissionTimestamps && (
                  <div className="my-2 rounded bg-surface/50 p-3 text-xs text-muted-foreground">
                    <p>Submitted At: {new Date(submissionTimestamps.submittedAt).toLocaleString()}</p>
                    <p>Open: {submissionTimestamps.openDate ? new Date(submissionTimestamps.openDate).toLocaleString() : 'N/A'}</p>
                    <p>Close: {submissionTimestamps.closeDate ? new Date(submissionTimestamps.closeDate).toLocaleString() : 'N/A'}</p>
                  </div>
                )}
                <FormControl>
                  <Input type="number" min={0} max={10} {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty Feedback (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter detailed feedback here..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Score</p>
            <p className="text-4xl font-bold">
              {total} <span className="text-xl text-muted-foreground">/ 100</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting}
              onClick={form.handleSubmit((data) => onSubmit(data, false))}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={isSubmitting}
              onClick={form.handleSubmit((data) => onSubmit(data, true))}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Publish Evaluation'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
