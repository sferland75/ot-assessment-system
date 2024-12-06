export interface AssessmentScore {
  raw_score: number;
  standardized_score?: number;
  percentile?: number;
  interpretation?: string;
  confidence_interval?: [number, number];
}

export interface AssessmentResult {
  tool_name: string;
  date_administered: Date;
  scores: Record<string, AssessmentScore>;
  observations: string[];
  clinical_implications: string[];
  recommendations: string[];
}

export interface SafetyConcern {
  activity: string;
  risk: string;
  mitigation_needed: boolean;
  mitigation_strategies?: string[];
}

export interface FunctionalImpact {
  limitation: string;
  impact_level: string;
  affected_tasks: string[];
  contributing_factors?: string[];
}

export enum ChangeSignificance {
  SIGNIFICANT_IMPROVEMENT = "Significant Improvement",
  MILD_IMPROVEMENT = "Mild Improvement",
  NO_SIGNIFICANT_CHANGE = "No Significant Change",
  MILD_DECLINE = "Mild Decline",
  SIGNIFICANT_DECLINE = "Significant Decline"
}