import { Input } from '@/components/ui/input';
import { SCORE_LIMITS } from '@/lib/constants';

interface ScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
}

export function ScoreInput({ value, onChange, disabled, label }: ScoreInputProps) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      step={1}
      min={SCORE_LIMITS.MIN}
      max={SCORE_LIMITS.MAX}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={label}
      className="w-20 text-right tabular-nums"
    />
  );
}
