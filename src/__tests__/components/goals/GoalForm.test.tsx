import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalForm } from '../../../components/goals/GoalForm';
import { TherapeuticGoal, GoalCategory, GoalStatus } from '../../../types/goals';

describe('GoalForm', () => {
  const mockInitialGoal: Partial<TherapeuticGoal> = {
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
    progress_indicators: {
      measurement_type: 'Independence',
      unit: '%',
      frequency: 'weekly'
    },
    intervention_strategies: ['Task modification']
  };

  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<GoalForm onSubmit={mockSubmit} />);
    
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Baseline Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Measurement Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit/i)).toBeInTheDocument();
  });

  it('populates form with initial goal data', () => {
    render(<GoalForm initialGoal={mockInitialGoal} onSubmit={mockSubmit} />);
    
    expect(screen.getByDisplayValue(mockInitialGoal.description!)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockInitialGoal.baseline!.value)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockInitialGoal.target!.value)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockInitialGoal.progress_indicators!.measurement_type)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockInitialGoal.progress_indicators!.unit)).toBeInTheDocument();
  });

  it('allows adding and removing intervention strategies', async () => {
    render(<GoalForm onSubmit={mockSubmit} />);
    
    const addButton = screen.getByText('+ Add Strategy');
    fireEvent.click(addButton);

    const input = screen.getByPlaceholderText(/Enter strategy/i);
    await userEvent.type(input, 'New strategy');

    const removeButton = screen.getByText('Remove');
    expect(removeButton).toBeInTheDocument();
    
    fireEvent.click(removeButton);
    expect(screen.queryByDisplayValue('New strategy')).not.toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<GoalForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByText(/Create Goal|Update Goal/i);
    fireEvent.click(submitButton);

    expect(mockSubmit).not.toHaveBeenCalled();

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/Description/i), 'Test goal');
    await userEvent.type(screen.getByLabelText(/Baseline Value/i), '20');
    await userEvent.type(screen.getByLabelText(/Target Value/i), '100');
    await userEvent.type(screen.getByLabelText(/Measurement Type/i), 'Test');
    await userEvent.type(screen.getByLabelText(/Unit/i), '%');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Test goal',
        baseline: expect.objectContaining({ value: 20 }),
        target: expect.objectContaining({ value: 100 }),
        progress_indicators: expect.objectContaining({
          measurement_type: 'Test',
          unit: '%'
        })
      }));
    });
  });

  it('handles form submission with complete data', async () => {
    render(<GoalForm initialGoal={mockInitialGoal} onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByText(/Create Goal|Update Goal/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        category: mockInitialGoal.category,
        description: mockInitialGoal.description,
        baseline: expect.objectContaining({
          value: mockInitialGoal.baseline?.value
        }),
        target: expect.objectContaining({
          value: mockInitialGoal.target?.value
        }),
        progress_indicators: expect.objectContaining({
          measurement_type: mockInitialGoal.progress_indicators?.measurement_type,
          unit: mockInitialGoal.progress_indicators?.unit
        })
      }));
    });
  });
});
