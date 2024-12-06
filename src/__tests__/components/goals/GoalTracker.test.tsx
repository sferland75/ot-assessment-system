import React from 'react';
import { render, screen } from '@testing-library/react';
import { GoalTracker } from '../../../components/goals/GoalTracker';
import { TherapeuticGoal, GoalCategory, GoalStatus } from '../../../types/goals';

describe('GoalTracker', () => {
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

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-03-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays goal description and category', () => {
    render(<GoalTracker goal={mockGoal} />);
    
    expect(screen.getByText(mockGoal.description)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockGoal.category))).toBeInTheDocument();
  });

  it('shows progress percentage', () => {
    render(<GoalTracker goal={mockGoal} />);
    
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('displays facilitators and barriers', () => {
    render(<GoalTracker goal={mockGoal} />);
    
    mockGoal.facilitators.forEach(facilitator => {
      expect(screen.getByText(facilitator)).toBeInTheDocument();
    });

    mockGoal.barriers.forEach(barrier => {
      expect(screen.getByText(barrier)).toBeInTheDocument();
    });
  });

  it('calls onProgressUpdate with calculated progress', () => {
    const onProgressUpdate = jest.fn();
    render(<GoalTracker goal={mockGoal} onProgressUpdate={onProgressUpdate} />);
    
    expect(onProgressUpdate).toHaveBeenCalledWith(expect.objectContaining({
      current_value: 60,
      percent_complete: 50,
      days_remaining: expect.any(Number)
    }));
  });

  it('displays days remaining until target date', () => {
    render(<GoalTracker goal={mockGoal} />);
    
    // 92 days between March 1 and June 1
    expect(screen.getByText(/92 days remaining/)).toBeInTheDocument();
  });

  it('shows intervention strategies', () => {
    render(<GoalTracker goal={mockGoal} />);
    
    mockGoal.intervention_strategies.forEach(strategy => {
      expect(screen.getByText(strategy)).toBeInTheDocument();
    });
  });

  it('displays measurement unit in progress indicator', () => {
    render(<GoalTracker goal={mockGoal} />);
    
    const unitLabel = screen.getByText(new RegExp(mockGoal.progress_indicators.unit));
    expect(unitLabel).toBeInTheDocument();
  });
});
