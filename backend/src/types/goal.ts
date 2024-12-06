export enum GoalCategory {
  ADL = 'Activities of Daily Living',
  IADL = 'Instrumental Activities of Daily Living',
  MOBILITY = 'Mobility',
  COGNITION = 'Cognitive Function',
  SOCIAL = 'Social Participation',
  WORK = 'Work/Productivity',
  EDUCATION = 'Education',
  LEISURE = 'Leisure'
}

export enum GoalStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  ACHIEVED = 'Achieved',
  MODIFIED = 'Modified',
  DISCONTINUED = 'Discontinued'
}

export interface GoalFilter {
  clientId?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  fromDate?: Date;
  toDate?: Date;
}
