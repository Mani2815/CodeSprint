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
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Evaluation } from '@prisma/client';

const score = z.coerce.number().int().min(0).max(20);
const formSchema = z.object({
  innovation: score,
  technical: score,
  ui: score,
  documentation: score,
  githubScore: score,
  comments: z.string().max(3000).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function EvaluationForm({
  teamId,
  checkpointId,
  initialData,
  suggestedGithubScore,
}: {
  teamId: string;
  checkpointId: string;
  initialData?: Evaluation | null;
  suggestedGithubScore: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      innovation: initialData?.innovation ?? 0,
      technical: initialData?.technical ?? 0,
      ui: initialData?.ui ?? 0,
      documentation: initialData?.documentation ?? 0,
      githubScore: initialData?.githubScore || suggestedGithubScore,
      comments: initialData?.comments ?? '',
    },
  });

  const watchAllFields = useWatch({ control: form.control });

  const calculateTotal = () => {
    const values = watchAllFields;
    return (
      (Number(values.innovation) || 0) +
      (Number(values.technical) || 0) +
      (Number(values.ui) || 0) +
      (Number(values.documentation) || 0) +
      (Number(values.githubScore) || 0)
    );
  };

  const total = calculateTotal();

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, checkpointId, ...data }),
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

  const rubricFields = [
    { name: 'innovation', label: 'Innovation & Problem Solving' },
    { name: 'technical', label: 'Technical Implementation' },
    { name: 'ui', label: 'UI/UX & Design' },
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rubricFields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label} (/20)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={20} {...formField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          {/* Documentation & LinkedIn Field */}
          <FormField
            control={form.control}
            name="documentation"
            render={({ field: formField }) => (
              <FormItem className="row-span-2">
                <FormLabel>Documentation & LinkedIn (/20)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={20} {...formField} />
                </FormControl>
                
                {/* LinkedIn Reference Checklist */}
                <div className="mt-3 rounded-md border border-border bg-surface/50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    LinkedIn Post Checklist
                  </p>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">✓/✗</span> Project post published
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">✓/✗</span> CUCS mentioned
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">✓/✗</span> Labyrinth mentioned
                    </div>
                  </div>
                </div>
                
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="my-6 border-t pt-6">
          <FormField
            control={form.control}
            name="githubScore"
            render={({ field: formField }) => (
              <FormItem className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="font-semibold text-primary">
                    GitHub & Collaboration (/20)
                  </FormLabel>
                  <span className="text-xs text-muted-foreground">
                    Suggested Score: {suggestedGithubScore}
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
            <p className="text-sm font-medium text-muted-foreground">Final Week Score</p>
            <p className="text-4xl font-bold">
              {total} <span className="text-xl text-muted-foreground">/ 100</span>
            </p>
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Evaluation'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
