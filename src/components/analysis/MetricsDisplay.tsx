import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { SCORE_THRESHOLDS } from '@/lib/constants';

interface MetricItemProps {
  label: string;
  value: number | string;
  suffix?: string;
  showBar?: boolean;
  maxValue?: number;
}

function getScoreColor(value: number): string {
  if (value >= SCORE_THRESHOLDS.excellent) return 'text-green-600';
  if (value >= SCORE_THRESHOLDS.good) return 'text-blue-600';
  if (value >= SCORE_THRESHOLDS.average) return 'text-yellow-600';
  return 'text-red-600';
}

function getBarColor(value: number): string {
  if (value >= SCORE_THRESHOLDS.excellent) return 'bg-green-500';
  if (value >= SCORE_THRESHOLDS.good) return 'bg-blue-500';
  if (value >= SCORE_THRESHOLDS.average) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function MetricItem({ label, value, suffix, showBar = false, maxValue = 100 }: MetricItemProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const percentage = (numValue / maxValue) * 100;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`font-semibold ${typeof value === 'number' ? getScoreColor(numValue) : 'text-gray-900'}`}>
          {value}{suffix}
        </span>
      </div>
      {showBar && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(numValue)} transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface MetricsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function MetricsCard({ title, description, children }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardBody className="divide-y divide-gray-100">
        {children}
      </CardBody>
    </Card>
  );
}

interface ScoreBadgeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  const sizeStyles = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${sizeStyles[size]} rounded-full flex items-center justify-center font-bold
          ${getBarColor(score)} text-white
        `}
      >
        {Math.round(score)}
      </div>
      <span className="mt-2 text-sm font-medium text-gray-600">{label}</span>
    </div>
  );
}

interface ComparisonBarProps {
  clientValue: number;
  competitorValues: { name: string; value: number }[];
  label: string;
  maxValue?: number;
}

export function ComparisonBar({ clientValue, competitorValues, label, maxValue }: ComparisonBarProps) {
  const max = maxValue || Math.max(clientValue, ...competitorValues.map(c => c.value)) * 1.1;

  return (
    <div className="py-3">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-24 truncate">Your Business</span>
          <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${(clientValue / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-12 text-right">{clientValue}</span>
        </div>

        {competitorValues.map((competitor, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-24 truncate">{competitor.name}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full bg-gray-400"
                style={{ width: `${(competitor.value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-12 text-right">{competitor.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
