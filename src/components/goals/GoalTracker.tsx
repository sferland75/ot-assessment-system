import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TherapeuticGoal, GoalProgress } from '../../types/goals';
import { GoalProcessor } from './GoalProcessor';

interface GoalTrackerProps {
  goal: TherapeuticGoal;
  onProgressUpdate?: (progress: GoalProgress) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({ goal, onProgressUpdate }) => {
  const goalProcessor = React.useMemo(() => new GoalProcessor(), []);
  const progress = React.useMemo(() => goalProcessor.calculateProgress(goal), [goal, goalProcessor]);
  
  React.useEffect(() => {
    onProgressUpdate?.(progress);
  }, [progress, onProgressUpdate]);

  const chartData = React.useMemo(() => {
    return [
      {
        date: goal.baseline.date,
        value: goal.baseline.value,
        target: goal.baseline.value
      },
      ...goal.measurements.map(m => ({
        date: m.date,
        value: m.value,
        target: interpolateTarget(
          goal.baseline.date,
          goal.target.target_date,
          goal.baseline.value,
          goal.target.value,
          m.date
        )
      })),
      {
        date: goal.target.target_date,
        target: goal.target.value
      }
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [goal]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{goal.description}</h3>
          <p className="text-sm text-gray-600">
            {goal.category} | Status: {goal.status}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">
            {progress.percent_complete}% Complete
          </p>
          <p className="text-sm text-gray-600">
            {progress.days_remaining} days remaining
          </p>
        </div>
      </div>

      <div className="h-64">
        <LineChart
          width={600}
          height={240}
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis
            label={{
              value: goal.progress_indicators.unit,
              angle: -90,
              position: 'insideLeft'
            }}
          />
          <Tooltip
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value, name) => [
              `${value} ${goal.progress_indicators.unit}`,
              name
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            name="Progress"
            strokeWidth={2}
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: '#fff'
            }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#82ca9d"
            strokeDasharray="5 5"
            name="Target"
          />
        </LineChart>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h4 className="font-semibold mb-2">Facilitators</h4>
          <ul className="list-disc pl-4">
            {goal.facilitators.map((item, index) => (
              <li key={index} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 border rounded">
          <h4 className="font-semibold mb-2">Barriers</h4>
          <ul className="list-disc pl-4">
            {goal.barriers.map((item, index) => (
              <li key={index} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Intervention Strategies</h4>
        <ul className="list-disc pl-4">
          {goal.intervention_strategies.map((strategy, index) => (
            <li key={index} className="text-sm">{strategy}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function interpolateTarget(
  startDate: Date,
  endDate: Date,
  startValue: number,
  endValue: number,
  currentDate: Date
): number {
  const totalDuration = endDate.getTime() - startDate.getTime();
  const currentDuration = currentDate.getTime() - startDate.getTime();
  const progress = currentDuration / totalDuration;
  return startValue + (endValue - startValue) * progress;
}

export default GoalTracker;