import { TherapeuticGoal, GoalMeasurement, GoalStatus } from '../types/goals';

export interface GoalFilter {
  category?: string;
  status?: GoalStatus;
  clientId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export class GoalService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async createGoal(goal: Omit<TherapeuticGoal, 'id'>): Promise<TherapeuticGoal> {
    const response = await fetch(`${this.baseUrl}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goal),
    });

    if (!response.ok) {
      throw new Error(`Failed to create goal: ${response.statusText}`);
    }

    return response.json();
  }

  async updateGoal(goalId: string, goal: Partial<TherapeuticGoal>): Promise<TherapeuticGoal> {
    const response = await fetch(`${this.baseUrl}/goals/${goalId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goal),
    });

    if (!response.ok) {
      throw new Error(`Failed to update goal: ${response.statusText}`);
    }

    return response.json();
  }

  async getGoal(goalId: string): Promise<TherapeuticGoal> {
    const response = await fetch(`${this.baseUrl}/goals/${goalId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch goal: ${response.statusText}`);
    }

    return response.json();
  }

  async getGoals(filter?: GoalFilter): Promise<TherapeuticGoal[]> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/goals?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.statusText}`);
    }

    return response.json();
  }

  async addMeasurement(goalId: string, measurement: GoalMeasurement): Promise<TherapeuticGoal> {
    const response = await fetch(`${this.baseUrl}/goals/${goalId}/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(measurement),
    });

    if (!response.ok) {
      throw new Error(`Failed to add measurement: ${response.statusText}`);
    }

    return response.json();
  }

  async updateMeasurement(
    goalId: string,
    measurementDate: Date,
    measurement: Partial<GoalMeasurement>
  ): Promise<TherapeuticGoal> {
    const response = await fetch(
      `${this.baseUrl}/goals/${goalId}/measurements/${measurementDate.toISOString()}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurement),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update measurement: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteMeasurement(goalId: string, measurementDate: Date): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/goals/${goalId}/measurements/${measurementDate.toISOString()}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete measurement: ${response.statusText}`);
    }
  }

  async linkAssessment(goalId: string, assessmentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/goals/${goalId}/assessments/${assessmentId}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`Failed to link assessment: ${response.statusText}`);
    }
  }

  async getLinkedAssessments(goalId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/goals/${goalId}/assessments`);

    if (!response.ok) {
      throw new Error(`Failed to fetch linked assessments: ${response.statusText}`);
    }

    return response.json();
  }
}