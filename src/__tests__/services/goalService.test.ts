import { GoalService } from '../../services/goalService';
import { TherapeuticGoal, GoalCategory, GoalStatus } from '../../types/goals';

describe('GoalService', () => {
  const mockGoal: Omit<TherapeuticGoal, 'id'> = {
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
    measurements: [],
    status: GoalStatus.NOT_STARTED,
    created_date: new Date('2024-01-01'),
    modified_date: new Date('2024-01-01'),
    progress_indicators: {
      measurement_type: 'Independence',
      unit: '%',
      frequency: 'biweekly'
    },
    barriers: [],
    facilitators: [],
    intervention_strategies: []
  };

  let service: GoalService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    service = new GoalService('/api');
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation();
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  describe('createGoal', () => {
    it('sends POST request with correct data', async () => {
      const expectedResponse = { ...mockGoal, id: '1' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse)
      });

      const result = await service.createGoal(mockGoal);

      expect(fetchMock).toHaveBeenCalledWith('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGoal)
      });
      expect(result).toEqual(expectedResponse);
    });

    it('throws error on failed request', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(service.createGoal(mockGoal)).rejects.toThrow(
        'Failed to create goal: Bad Request'
      );
    });
  });

  describe('getGoals', () => {
    it('includes filter parameters in query string', async () => {
      const filter = {
        category: GoalCategory.ADL,
        status: GoalStatus.IN_PROGRESS,
        fromDate: new Date('2024-01-01')
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await service.getGoals(filter);

      const url = fetchMock.mock.calls[0][0];
      expect(url).toContain(`category=${GoalCategory.ADL}`);
      expect(url).toContain(`status=${GoalStatus.IN_PROGRESS}`);
      expect(url).toContain(`fromDate=${encodeURIComponent('2024-01-01')}`);
    });

    it('handles empty filter', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await service.getGoals();

      expect(fetchMock).toHaveBeenCalledWith('/api/goals?', expect.any(Object));
    });
  });

  describe('addMeasurement', () => {
    const mockMeasurement = {
      date: new Date('2024-02-01'),
      value: 50,
      notes: 'Showing improvement'
    };

    it('sends POST request to correct endpoint', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockGoal, id: '1' })
      });

      await service.addMeasurement('1', mockMeasurement);

      expect(fetchMock).toHaveBeenCalledWith('/api/goals/1/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockMeasurement)
      });
    });

    it('throws error when measurement addition fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(service.addMeasurement('1', mockMeasurement)).rejects.toThrow(
        'Failed to add measurement: Internal Server Error'
      );
    });
  });

  describe('linkAssessment', () => {
    it('sends PUT request to link assessment', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true });

      await service.linkAssessment('1', 'assessment-1');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/goals/1/assessments/assessment-1',
        { method: 'PUT' }
      );
    });
  });
});
