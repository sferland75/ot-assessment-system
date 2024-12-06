import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoalDashboard } from '../../../components/goals/GoalDashboard';
import { GoalService } from '../../../services/goalService';
import { TherapeuticGoal, GoalCategory, GoalStatus } from '../../../types/goals';

// Mock the GoalService
jest.mock('../../../services/goalService');

describe('GoalDashboard', () => {
  const mockGoals: TherapeuticGoal[] = [
    {
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
      intervention_strategies: ['Task modification']
    },
    {
      id: '2',
      category: GoalCategory.MOBILITY,
      description: 'Improve walking distance',
      baseline: {
        date: new Date('2024-01-01'),
        value: 50
      },
      target: {
        value: 200,
        target_date: new Date('2024-06-01')
      },
      measurements: [
        { date: new Date('2024-02-15'), value: 100 }
      ],
      status: GoalStatus.IN_PROGRESS,
      created_date: new Date('2024-01-01'),
      modified_date: new Date('2024-02-15'),
      progress_indicators: {
        measurement_type: 'Distance',
        unit: 'meters',
        frequency: 'weekly'
      },
      barriers: [],
      facilitators: [],
      intervention_strategies: []
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (GoalService as jest.MockedClass<typeof GoalService>).prototype.getGoals.mockResolvedValue(mockGoals);
    (GoalService as jest.MockedClass<typeof GoalService>).prototype.createGoal.mockImplementation(
      async (goal) => ({ ...goal, id: '3' } as TherapeuticGoal)
    );
  });

  it('loads and displays goals', async () => {
    render(<GoalDashboard clientId="client1" />);

    // Should show loading initially
    expect(screen.getByText(/Loading goals/i)).toBeInTheDocument();

    // Wait for goals to load
    await waitFor(() => {
      mockGoals.forEach(goal => {
        expect(screen.getByText(goal.description)).toBeInTheDocument();
      });
    });
  });

  it('handles goal filtering', async () => {
    render(<GoalDashboard clientId="client1" />);

    await waitFor(() => {
      expect(screen.getByText(mockGoals[0].description)).toBeInTheDocument();
    });

    // Change category filter
    const categoryFilter = screen.getByLabelText(/Category/i);
    fireEvent.change(categoryFilter, { target: { value: GoalCategory.MOBILITY } });

    // Verify that the service was called with the correct filter
    expect(GoalService.prototype.getGoals).toHaveBeenCalledWith(
      expect.objectContaining({
        category: GoalCategory.MOBILITY,
        clientId: 'client1'
      })
    );
  });

  it('opens goal creation modal', async () => {
    render(<GoalDashboard clientId="client1" />);

    await waitFor(() => {
      expect(screen.getByText(/Add New Goal/i)).toBeInTheDocument();
    });

    // Click add goal button
    fireEvent.click(screen.getByText(/Add New Goal/i));

    // Verify modal is shown
    expect(screen.getByText(/Create Goal/i)).toBeInTheDocument();
  });

  it('handles goal creation', async () => {
    render(<GoalDashboard clientId="client1" />);

    await waitFor(() => {
      expect(screen.getByText(/Add New Goal/i)).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByText(/Add New Goal/i));

    // Fill out form
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'New test goal' }
    });

    fireEvent.change(screen.getByLabelText(/Baseline Value/i), {
      target: { value: '10' }
    });

    fireEvent.change(screen.getByLabelText(/Target Value/i), {
      target: { value: '100' }
    });

    // Submit form
    fireEvent.click(screen.getByText(/Create Goal/i));

    // Verify service call
    await waitFor(() => {
      expect(GoalService.prototype.createGoal).toHaveBeenCalled();
    });

    // Verify goals are reloaded
    expect(GoalService.prototype.getGoals).toHaveBeenCalledTimes(2);
  });

  it('handles errors gracefully', async () => {
    // Mock error response
    (GoalService as jest.MockedClass<typeof GoalService>).prototype.getGoals.mockRejectedValueOnce(
      new Error('Failed to fetch goals')
    );

    render(<GoalDashboard clientId="client1" />);

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch goals/i)).toBeInTheDocument();
    });

    // Verify retry button is present
    const retryButton = screen.getByText(/Retry/i);
    expect(retryButton).toBeInTheDocument();

    // Mock successful response for retry
    (GoalService as jest.MockedClass<typeof GoalService>).prototype.getGoals.mockResolvedValueOnce(mockGoals);

    // Click retry
    fireEvent.click(retryButton);

    // Verify goals are loaded after retry
    await waitFor(() => {
      mockGoals.forEach(goal => {
        expect(screen.getByText(goal.description)).toBeInTheDocument();
      });
    });
  });

  it('notifies parent component when goal is selected', async () => {
    const onGoalSelect = jest.fn();
    render(<GoalDashboard clientId="client1" onGoalSelect={onGoalSelect} />);

    await waitFor(() => {
      expect(screen.getByText(mockGoals[0].description)).toBeInTheDocument();
    });

    // Click on a goal
    fireEvent.click(screen.getByText(mockGoals[0].description));

    // Verify callback was called with correct goal
    expect(onGoalSelect).toHaveBeenCalledWith(mockGoals[0]);
  });
});
