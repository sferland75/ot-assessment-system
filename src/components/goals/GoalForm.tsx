import React from 'react';
import { TherapeuticGoal, GoalCategory, GoalStatus } from '../../types/goals';

interface GoalFormProps {
  initialGoal?: Partial<TherapeuticGoal>;
  onSubmit: (goal: TherapeuticGoal) => void;
}

const DEFAULT_GOAL: Partial<TherapeuticGoal> = {
  status: GoalStatus.NOT_STARTED,
  barriers: [],
  facilitators: [],
  intervention_strategies: [],
  measurements: [],
  progress_indicators: {
    measurement_type: '',
    unit: '',
    frequency: 'weekly'
  }
};

export const GoalForm: React.FC<GoalFormProps> = ({ initialGoal, onSubmit }) => {
  const [formData, setFormData] = React.useState<Partial<TherapeuticGoal>>(
    { ...DEFAULT_GOAL, ...initialGoal }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidGoal(formData)) {
      onSubmit(formData as TherapeuticGoal);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: keyof TherapeuticGoal, index: number, value: string) => {
    setFormData(prev => {
      const array = [...(prev[field] as string[] || [])];
      array[index] = value;
      return {
        ...prev,
        [field]: array
      };
    });
  };

  const addArrayItem = (field: keyof TherapeuticGoal) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[] || []), '']
    }));
  };

  const removeArrayItem = (field: keyof TherapeuticGoal, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[] || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {Object.values(GoalCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Baseline Value</label>
          <input
            type="number"
            name="baseline.value"
            value={formData.baseline?.value || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Value</label>
          <input
            type="number"
            name="target.value"
            value={formData.target?.value || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Measurement Type</label>
          <input
            type="text"
            name="progress_indicators.measurement_type"
            value={formData.progress_indicators?.measurement_type || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unit</label>
          <input
            type="text"
            name="progress_indicators.unit"
            value={formData.progress_indicators?.unit || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Intervention Strategies</label>
        {formData.intervention_strategies?.map((strategy, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              type="text"
              value={strategy}
              onChange={(e) => handleArrayChange('intervention_strategies', index, e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('intervention_strategies', index)}
              className="px-2 py-1 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('intervention_strategies')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Strategy
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialGoal ? 'Update Goal' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
};

function isValidGoal(goal: Partial<TherapeuticGoal>): goal is TherapeuticGoal {
  return Boolean(
    goal.category &&
    goal.description &&
    goal.baseline?.value &&
    goal.target?.value &&
    goal.progress_indicators?.measurement_type &&
    goal.progress_indicators?.unit
  );
}

export default GoalForm;