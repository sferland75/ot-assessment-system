import { GASGoal, GASSet, GASScoreResult, GASLevel } from '../../types/GASTypes';

export class GASProcessor {
  static calculateTScore(goals: GASGoal[]): GASScoreResult {
    const C = 10; // Standard constant
    const p = 0.3; // Standard correlation
    
    const weightedScores = goals.map(goal => ({
      goalId: goal.id,
      weight: goal.importance,
      score: goal.currentLevel
    }));
    
    const sumWeightedScores = weightedScores.reduce(
      (sum, item) => sum + (item.weight * item.score), 0
    );
    
    const sumSquaredWeights = weightedScores.reduce(
      (sum, item) => sum + (item.weight * item.weight), 0
    );
    
    const tScore = 50 + (C * sumWeightedScores) / 
      Math.sqrt((1 - p) * sumSquaredWeights);
    
    const individualScores = weightedScores.map(item => ({
      goalId: item.goalId,
      currentLevel: item.score as GASLevel,
      weighted: true,
      contribution: (item.weight * item.score * C) / 
        Math.sqrt((1 - p) * sumSquaredWeights)
    }));
    
    return {
      tScore,
      weightedTScore: tScore,
      individualScores,
      dateCalculated: new Date().toISOString()
    };
  }

  static validateGoal(goal: GASGoal): boolean {
    const requiredLevels: GASLevel[] = [-2, -1, 0, 1, 2];
    return requiredLevels.every(level => 
      goal.scales[level] && goal.scales[level].trim() !== ''
    );
  }

  static createNewSet(patientId: string, therapistId: string): GASSet {
    return {
      id: crypto.randomUUID(),
      patientId,
      therapistId,
      goals: [],
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  static createNewGoal(title: string, category: string): GASGoal {
    return {
      id: crypto.randomUUID(),
      title,
      category,
      scales: {
        [-2]: '',
        [-1]: '',
        [0]: '',
        [1]: '',
        [2]: ''
      },
      importance: 1,
      currentLevel: -2,
      dateCreated: new Date().toISOString(),
      targetDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  static generateScaleDescriptions(baselineDescription: string): Record<GASLevel, string> {
    return {
      [-2]: `Much less than expected: ${baselineDescription}`,
      [-1]: `Somewhat less than expected: ${baselineDescription}`,
      [0]: `Expected level: ${baselineDescription}`,
      [1]: `Somewhat more than expected: ${baselineDescription}`,
      [2]: `Much more than expected: ${baselineDescription}`
    };
  }

  static getProgressSummary(gasSet: GASSet): {
    totalGoals: number;
    goalsAtOrAboveExpected: number;
    averageProgress: number;
  } {
    const totalGoals = gasSet.goals.length;
    const goalsAtOrAboveExpected = gasSet.goals.filter(
      goal => goal.currentLevel >= 0
    ).length;
    const averageProgress = gasSet.goals.reduce(
      (sum, goal) => sum + goal.currentLevel, 0
    ) / totalGoals;

    return {
      totalGoals,
      goalsAtOrAboveExpected,
      averageProgress
    };
  }
}