import { api } from './api';
import {
  SimulationRequest,
  SimulationResult,
  EvaluationResult,
  EvaluationContext,
  EvaluationApiResponse,
  TestingScenario,
  ScenarioRegenerationRequest,
  AVAILABLE_DOCUMENTS
} from '@/types/evaluation-phase';

export const evaluationApi = {
  getEvaluationContext: async (projectId: string): Promise<EvaluationContext> => {
    try {
      console.log(`Fetching evaluation context for project: ${projectId}`);
      
      const response = await api.get<EvaluationApiResponse<EvaluationContext>>(
        `evaluation/${projectId}/context`
      );
      
      if (response.success && response.data) {
        console.log('Successfully fetched evaluation context');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get evaluation context');
      }
    } catch (error) {
      console.error('API failed to get evaluation context:', error);
      throw error;
    }
  },

  simulateWithStatistics: async (
    projectId: string, 
    datasetStatistics?: any
  ): Promise<SimulationResult> => {
    try {
      console.log(`Running dataset suitability assessment for project: ${projectId}`);
      
      const requestData: SimulationRequest = {
        dataset_statistics: datasetStatistics,
        simulation_type: 'suitability_assessment'
      };
      
      const response = await api.post<EvaluationApiResponse<SimulationResult>>(
        `evaluation/${projectId}/simulate`,
        requestData
      );
      
      if (response.success && response.data) {
        console.log('Successfully completed dataset suitability assessment');
        return response.data;
      } else {
        throw new Error(response.message || 'Dataset assessment failed');
      }
    } catch (error) {
      console.error('API failed to run dataset assessment:', error);
      throw error;
    }
  },

  simulateWithScenarios: async (
    projectId: string,
  ): Promise<SimulationResult> => {
    try {
      console.log(`Running scenario simulation for project: ${projectId}`);
      
      const requestData: SimulationRequest = {
        simulation_type: 'example_scenarios',
      };
      
      const response = await api.post<EvaluationApiResponse<SimulationResult>>(
        `evaluation/${projectId}/simulate`,
        requestData
      );
      
      if (response.success && response.data) {
        console.log('Successfully completed scenario simulation');
        return response.data;
      } else {
        throw new Error(response.message || 'Scenario simulation failed');
      }
    } catch (error) {
      console.error('API failed to run scenario simulation:', error);
      throw error;
    }
  },

  regenerateScenarios: async (
    projectId: string,
    request: ScenarioRegenerationRequest
  ): Promise<TestingScenario[]> => {
    try {
      console.log(`Regenerating scenarios for project: ${projectId}`);
      
      const response = await api.post<EvaluationApiResponse<TestingScenario[]>>(
        `evaluation/${projectId}/regenerate-scenarios`,
        request
      );
      
      if (response.success && response.data) {
        console.log('Successfully regenerated scenarios');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to regenerate scenarios');
      }
    } catch (error) {
      console.error('API failed to regenerate scenarios:', error);
      throw error;
    }
  },

  evaluateResults: async (
    projectId: string,
    simulationResult: SimulationResult
  ): Promise<EvaluationResult> => {
    try {
      console.log(`Evaluating results for project: ${projectId}`);
      
      const response = await api.post<EvaluationApiResponse<EvaluationResult>>(
        `evaluation/${projectId}/evaluate`,
        { simulation_result: simulationResult }
      );
      
      if (response.success && response.data) {
        console.log('Successfully evaluated results');
        return response.data;
      } else {
        throw new Error(response.message || 'Evaluation failed');
      }
    } catch (error) {
      console.error('API failed to evaluate results:', error);
      throw error;
    }
  },

  resetEvaluationProgress: async (projectId: string): Promise<void> => {
    try {
      console.log(`Resetting evaluation progress for project: ${projectId}`);
      
      const response = await api.post<EvaluationApiResponse<{ reset: boolean; phase: string }>>(
        `evaluation/${projectId}/reset`
      );
      
      if (response.success) {
        console.log('Successfully reset evaluation progress');
      } else {
        throw new Error(response.message || 'Failed to reset evaluation progress');
      }
      
    } catch (error) {
      console.error('API failed to reset evaluation progress:', error);
      throw error;
    }
  },

  downloadProjectFile: async (
    projectId: string,
    fileType: string
  ): Promise<any> => {
    try {
      console.log(`Downloading ${fileType} for project: ${projectId}`);
      
      // Validate fileType against available documents
      const validFileTypes = AVAILABLE_DOCUMENTS.map(doc => doc.key);
      if (!validFileTypes.includes(fileType)) {
        throw new Error(`Invalid file type: ${fileType}. Available types: ${validFileTypes.join(', ')}`);
      }
      
      const response = await api.get(`evaluation/${projectId}/download/${fileType}`);
      
      console.log(`Successfully initiated download of ${fileType}`);
      return response;
    } catch (error) {
      console.error(`API failed to download ${fileType}:`, error);
      throw error;
    }
  },

  downloadCompleteProject: async (projectId: string): Promise<any> => {
    return evaluationApi.downloadProjectFile(projectId, 'complete_project');
  },

  downloadDocumentation: async (projectId: string): Promise<any> => {
    return evaluationApi.downloadProjectFile(projectId, 'documentation');
  },

  downloadSetupInstructions: async (projectId: string): Promise<any> => {
    return evaluationApi.downloadProjectFile(projectId, 'setup_instructions');
  },

  downloadDeploymentGuide: async (projectId: string): Promise<any> => {
    return evaluationApi.downloadProjectFile(projectId, 'deployment_guide');
  },

  downloadEthicalAssessmentGuide: async (projectId: string): Promise<any> => {
    return evaluationApi.downloadProjectFile(projectId, 'ethical_assessment_guide');
  },

  downloadTechnicalHandoverPackage: async (projectId: string): Promise<any> => {
    return evaluationApi.downloadProjectFile(projectId, 'technical_handover_package');
  },

  getAllAvailableDocuments: () => {
    return AVAILABLE_DOCUMENTS;
  },

  getDocumentInfo: (fileType: string) => {
    return AVAILABLE_DOCUMENTS.find(doc => doc.key === fileType);
  }
};