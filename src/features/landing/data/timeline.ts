interface TimelineStep {
  label: string;
  title: string;
  description: string;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    label: 'Week 1',
    title: 'Project 1 — Kickoff',
    description: 'Build and submit your first project for the opening weekly evaluation.',
  },
  {
    label: 'Week 2',
    title: 'Project 2 — Build & Compete',
    description: 'Start a completely new project and compete for your second weekly score.',
  },
];
