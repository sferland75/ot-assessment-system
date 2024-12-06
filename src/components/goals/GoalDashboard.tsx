import React from 'react';
import { TherapeuticGoal, GoalCategory, GoalStatus } from '../../types/goals';
import { GoalService, GoalFilter } from '../../services/goalService';
import { GoalTracker } from './GoalTracker';
import { GoalForm } from './GoalForm';

interface GoalDashboardProps {
  clientId: string;
  onGoalSelect?: (goal: TherapeuticGoal) => void;
}

export const GoalDashboard: React.FC<GoalDashboardProps> = ({ clientId, onGoalSelect }) => {
  const [goals, setGoals] = React.useState<TherapeuticGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = React.useState<TherapeuticGoal | null>(null);
  const [filter, setFilter] = React.useState<GoalFilter>({ clientId });
  const [isAddingGoal, setIsAddingGoal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const goalService = React.useMemo(() => new GoalService(), []);

  const loadGoals = React.useCallback(async () => {
    try {
      setLoading(true);
      const fetchedGoals = await goalService.getGoals(filter);
      setGoals(fetchedGoals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [filter, goalService]);

  React.useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleGoalSubmit = async (goal: TherapeuticGoal) => {
    try {
      if ('id' in goal) {
        await goalService.updateGoal(goal.id, goal);
      } else {
        await goalService.createGoal(goal);
      }
      setIsAddingGoal(false);
      loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value === 'all' ? undefined : value
    }));
  };

  const handleGoalSelect = (goal: TherapeuticGoal) => {
    setSelectedGoal(goal);
    onGoalSelect?.(goal);
  };

  if (loading) {
    return <div className="p-4">Loading goals...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
        <button
          onClick={loadGoals}
          className="ml-4 text-blue-600 hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <select
            name="category"
            onChange={handleFilterChange}
            className="rounded-md border-gray-300 shadow-sm"
          >
            <option value="all">All Categories</option>
            {Object.values(GoalCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            name="status"
            onChange={handleFilterChange}
            className="rounded-md border-gray-300 shadow-sm"
          >
            <option value="all">All Statuses</option>
            {Object.values(GoalStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsAddingGoal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Goal
        </button>
      </div>

      {isAddingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
            <GoalForm onSubmit={handleGoalSubmit} />
            <button
              onClick={() => setIsAddingGoal(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {goals.map(goal => (
          <div
            key={goal.id}
            onClick={() => handleGoalSelect(goal)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <GoalTracker
              goal={goal}
              onProgressUpdate={async (progress) => {
                // Automatically update goal status based on progress
                if (progress.percent_complete >= 100 && goal.status !== GoalStatus.ACHIEVED) {
                  await goalService.updateGoal(goal.id, {
                    status: GoalStatus.ACHIEVED
                  });
                  loadGoals();
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalDashboard;