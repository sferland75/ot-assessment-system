import { GoalProcessor } from '../../../components/goals/GoalProcessor';
import { TherapeuticGoal, GoalCategory, GoalStatus, ChangeSignificance } from '../../../types/goals';

describe('GoalProcessor', () => {
  const mockGoal: TherapeuticGoal = {
    id: '1',
    category: GoalCategory.ADL,
    description: 'Improve dressing independence',
    baseline: {
      date: new Date('2024-01-01'),
      value: 20
    },
    target: {
      value: 100,
      target_date: new Date('2024-06-01')
    },
    measurements: [
      { date: new Date('2024-01-15'), value: 35 },
      { date: new Date('2024-02-01'), value: 45 },
      { date: new Date('2024-02-15'), value: 60 }
    ],
    status: GoalStatus.IN_PROGRESS,
    created_date: new Date('2024-01-01'),
    modified_date: new Date('2024-02-15'),
    progress_indicators: {
      measurement_type: 'Independence',
      unit: '%',
      frequency: 'biweekly'
    },
    barriers: ['Limited range of motion'],
    facilitators: ['Family support'],
    intervention_strategies: ['Task modification', 'Adaptive equipment']
  };

  let processor: GoalProcessor;

  beforeEach(() => {
    processor = new GoalProcessor();
    // Mock current date to make tests deterministic
    jest.useFakeTimers().setSystemTime(new Date('2024-03-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calculateProgress', () => {
    it('calculates correct percent complete', () => {
      const progress = processor.calculateProgress(mockGoal);
      expect(progress.percent_complete).toBe(50); // (60 - 20) / (100 - 20) * 100
    });

    it('handles goal with no measurements', () => {
      const emptyGoal = {
        ...mockGoal,
        measurements: []
      };
      const progress = processor.calculateProgress(emptyGoal);
      expect(progress.current_value).toBe(mockGoal.baseline.value);
      expect(progress.percent_complete).toBe(0);
    });

    it('identifies significant improvement', () => {
      const improvingGoal = {
        ...mockGoal,
        measurements: [
          { date: new Date('2024-02-01'), value: 40 },
          { date: new Date('2024-02-15'), value: 60 },
          { date: new Date('2024-03-01'), value: 80 }
        ]
      };
      const progress = processor.calculateProgress(improvingGoal);
      expect(progress.trending).toBe(ChangeSignificance.SIGNIFICANT_IMPROVEMENT);
    });

    it('identifies decline', () => {
      const decliningGoal = {
        ...mockGoal,
        measurements: [
          { date: new Date('2024-02-01'), value: 60 },
          { date: new Date('2024-02-15'), value: 50 },
          { date: new Date('2024-03-01'), value: 40 }
        ]
      };
      const progress = processor.calculateProgress(decliningGoal);
      expect(progress.trending).toBe(ChangeSignificance.SIGNIFICANT_DECLINE);
    });
  });

  describe('updateGoalStatus', () => {
    it('marks goal as achieved when 100% complete', () => {
      const completedGoal = {
        ...mockGoal,
        measurements: [{ date: new Date('2024-03-01'), value: 100 }]
      };
      const status = processor.updateGoalStatus(completedGoal);
      expect(status).toBe(GoalStatus.ACHIEVED);
    });

    it('maintains in progress status for partial completion', () => {
      const status = processor.updateGoalStatus(mockGoal);
      expect(status).toBe(GoalStatus.IN_PROGRESS);
    });

    it('suggests modification for declining progress', () => {
      const decliningGoal = {
        ...mockGoal,
        measurements: [
          { date: new Date('2024-02-01'), value: 60 },
          { date: new Date('2024-02-15'), value: 40 },
          { date: new Date('2024-03-01'), value: 30 }
        ]
      };
      const status = processor.updateGoalStatus(decliningGoal);
      expect(status).toBe(GoalStatus.MODIFIED);
    });
  });
});
