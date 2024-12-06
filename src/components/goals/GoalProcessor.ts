import { TherapeuticGoal, GoalProgress, GoalStatus, GoalMeasurement, ChangeSignificance } from '../../types/goals';

export class GoalProcessor {
  calculateProgress(goal: TherapeuticGoal): GoalProgress {
    const sortedMeasurements = [...goal.measurements].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    const current_value = sortedMeasurements[0]?.value ?? goal.baseline.value;
    const totalChange = goal.target.value - goal.baseline.value;
    const currentChange = current_value - goal.baseline.value;
    
    return {
      goal,
      current_value,
      percent_complete: this.calculatePercentComplete(currentChange, totalChange),
      trending: this.analyzeTrend(sortedMeasurements, totalChange),
      days_remaining: this.calculateDaysRemaining(goal.target.target_date),
      projected_completion_date: this.projectCompletionDate(goal, current_value, sortedMeasurements)
    };
  }

  private calculatePercentComplete(currentChange: number, totalChange: number): number {
    return Math.min(Math.round((currentChange / totalChange) * 100), 100);
  }

  private analyzeTrend(
    measurements: GoalMeasurement[],
    totalChange: number
  ): ChangeSignificance {
    if (measurements.length < 2) {
      return ChangeSignificance.NO_SIGNIFICANT_CHANGE;
    }

    const recentMeasurements = measurements.slice(0, 3);
    const changeRate = (recentMeasurements[0].value - recentMeasurements[recentMeasurements.length - 1].value) /
      recentMeasurements.length;
    
    if (changeRate > totalChange * 0.1) {
      return ChangeSignificance.SIGNIFICANT_IMPROVEMENT;
    } else if (changeRate > 0) {
      return ChangeSignificance.MILD_IMPROVEMENT;
    } else if (changeRate < -totalChange * 0.1) {
      return ChangeSignificance.SIGNIFICANT_DECLINE;
    } else if (changeRate < 0) {
      return ChangeSignificance.MILD_DECLINE;
    }
    
    return ChangeSignificance.NO_SIGNIFICANT_CHANGE;
  }

  private calculateDaysRemaining(targetDate: Date): number {
    const today = new Date();
    return Math.max(
      0,
      Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  private projectCompletionDate(
    goal: TherapeuticGoal,
    currentValue: number,
    measurements: GoalMeasurement[]
  ): Date | undefined {
    if (measurements.length < 2) return undefined;

    const today = new Date();
    const progressRate = (measurements[0].value - measurements[measurements.length - 1].value) /
      (measurements[0].date.getTime() - measurements[measurements.length - 1].date.getTime());
    
    if (progressRate <= 0) return undefined;

    const remainingProgress = goal.target.value - currentValue;
    const projectedDays = remainingProgress / (progressRate * 1000 * 60 * 60 * 24);
    
    return new Date(today.getTime() + (projectedDays * 1000 * 60 * 60 * 24));
  }

  updateGoalStatus(goal: TherapeuticGoal): GoalStatus {
    const progress = this.calculateProgress(goal);
    
    if (progress.percent_complete >= 100) {
      return GoalStatus.ACHIEVED;
    }
    
    if (goal.measurements.length === 0) {
      return GoalStatus.NOT_STARTED;
    }
    
    if (progress.trending === ChangeSignificance.SIGNIFICANT_DECLINE ||
        progress.trending === ChangeSignificance.MILD_DECLINE) {
      return GoalStatus.MODIFIED;
    }
    
    return GoalStatus.IN_PROGRESS;
  }
}