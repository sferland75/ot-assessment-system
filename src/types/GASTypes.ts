export type GASLevel = -2 | -1 | 0 | 1 | 2;

export interface GASScale {
  level: GASLevel;
  description: string;
}

export interface GASGoal {
  id: string;
  title: string;
  category: string;
  scales: {
    [-2]: string;
    [-1]: string;
    [0]: string;
    [1]: string;
    [2]: string;
  };
  importance: number; // Weight factor (1-3)
  currentLevel: GASLevel;
  linkedAssessment?: {
    type: 'Berg' | 'MoCA' | 'Barthel' | 'Lawton';
    itemId: string;
  };
  dateCreated: string;
  targetDate: string;
  notes?: string;
}

export interface GASSet {
  id: string;
  patientId: string;
  therapistId: string;
  goals: GASGoal[];
  dateCreated: string;
  lastUpdated: string;
}

export interface GASScoreResult {
  tScore: number; // Standardized T-score
  weightedTScore: number; // Weighted T-score considering importance
  individualScores: {
    goalId: string;
    currentLevel: GASLevel;
    weighted: boolean;
    contribution: number; // Contribution to overall score
  }[];
  dateCalculated: string;
}
