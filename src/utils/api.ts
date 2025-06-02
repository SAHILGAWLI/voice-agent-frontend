import axios from 'axios';
import {
  DocumentUploadResponse,
  ConfigResponse,
  CollectionsResponse,
  AgentConfig,
  AgentResponse,
  AgentsListResponse,
} from '../types';

// Flag to use mock data instead of actual API
const USE_MOCK = false;

// Set up Axios with default error handling
const documentApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DOCUMENT_API_URL || 'http://51.20.138.127:8000/',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
});

const agentManagerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AGENT_MANAGER_URL || 'http://51.20.138.127:8001/',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
});

// Prevent Axios from making actual API calls when using mock
if (USE_MOCK) {
  documentApi.interceptors.request.use(() => {
    return Promise.reject(new Error('Using mock data'));
  });
  
  agentManagerApi.interceptors.request.use(() => {
    return Promise.reject(new Error('Using mock data'));
  });
}

// Mock implementation (simplified)
const mockCollections = [
  {
    name: 'Default Collection',
    path: '/collections/default',
    is_default: true,
  },
  {
    name: 'Product Documentation',
    path: '/collections/products',
    is_default: false,
  },
  {
    name: 'Customer Support',
    path: '/collections/support',
    is_default: false,
  }
];

// Using Record with specific type instead of 'any'
const mockAgents: Record<string, {
  user_id: string;
  agent_type: 'voice' | 'web';
  running_time: number;
}> = {};

// Document Upload API
export const uploadDocuments = async (
  userId: string,
  files: FileList,
  collectionName?: string
): Promise<DocumentUploadResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({
      status: 'success',
      message: 'Documents uploaded and processed successfully',
      document_count: files.length,
      index_id: `${userId}_index_123`
    });
  }

  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    
    if (collectionName) {
      formData.append('collection_name', collectionName);
    }
    
    const response = await documentApi.post<DocumentUploadResponse>(
      `/upload/${userId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error;
  }
};

export const configureAgent = async (
  userId: string,
  config: AgentConfig
): Promise<ConfigResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({
      status: 'success',
      message: 'Agent configuration updated successfully'
    });
  }

  try {
    const response = await documentApi.post<ConfigResponse>(`/config/${userId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error configuring agent:', error);
    throw error;
  }
};

export const listCollections = async (userId: string): Promise<CollectionsResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({
      collections: mockCollections
    });
  }

  try {
    const response = await documentApi.get<CollectionsResponse>(`/collections/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error listing collections:', error);
    throw error;
  }
};

// Agent Manager API
export const startAgent = async (
  userId: string,
  collectionName?: string | null,
  phoneNumber?: string | null,
  agentType: 'voice' | 'web' = 'voice'
): Promise<AgentResponse> => {
  if (USE_MOCK) {
    // Add mock agent to the list
    mockAgents[userId] = {
      user_id: userId,
      agent_type: agentType,
      running_time: 0
    };

    return Promise.resolve({
      status: 'success',
      user_id: userId,
      container_id: `container_${userId}_${Date.now()}`
    });
  }

  try {
    // Create the request payload with the exact field names and types expected by the backend Pydantic model
    const payload = {
      user_id: userId,
      // Only include fields that have values, avoid sending null/undefined which may cause validation errors
      ...(collectionName ? { collection_name: collectionName } : {}),
      ...(phoneNumber ? { phone_number: phoneNumber } : {}),
      agent_type: agentType
    };
    
    console.log("Making POST request to /start-agent with payload:", JSON.stringify(payload));
    
    const response = await agentManagerApi.post<AgentResponse>('/start-agent', payload);
    
    return response.data;
  } catch (error: unknown) {
    console.error('Error starting agent:', error);
    
    // Extract more detailed error information if available
    const axiosError = error as { 
      response?: { 
        status: number; 
        data: { detail?: string; [key: string]: unknown } 
      } 
    };
    if (axiosError.response) {
      console.error('Response status:', axiosError.response.status);
      console.error('Response data:', JSON.stringify(axiosError.response.data));
      
      // If it's a validation error, log more details
      if (axiosError.response.status === 422) {
        console.error('Validation error details:', 
          axiosError.response.data?.detail || 'No detail provided');
      }
    }
    
    throw error;
  }
};

export const stopAgent = async (userId: string): Promise<AgentResponse> => {
  if (USE_MOCK) {
    // Remove mock agent from the list
    delete mockAgents[userId];
    
    return Promise.resolve({
      status: 'success',
      user_id: userId
    });
  }

  try {
    const response = await agentManagerApi.post<AgentResponse>(`/stop-agent/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error stopping agent:', error);
    throw error;
  }
};

export const listAgents = async (): Promise<AgentsListResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({
      agents: Object.values(mockAgents)
    });
  }

  try {
    const response = await agentManagerApi.get<AgentsListResponse>('/agents');
    return response.data;
  } catch (error) {
    console.error('Error listing agents:', error);
    throw error;
  }
};

// Test function to try minimal payload
export const testStartAgent = async (userId: string): Promise<Record<string, unknown>> => {
  try {
    // Try with absolute minimal payload
    const minimalPayload = {
      user_id: userId,
      agent_type: 'voice'
    };
    
    console.log("Testing with minimal payload:", JSON.stringify(minimalPayload));
    
    const response = await agentManagerApi.post('/start-agent', minimalPayload);
    return response.data;
  } catch (error: unknown) {
    console.error('Test API error:', error);
    const axiosError = error as { 
      response?: { 
        status: number; 
        data: { detail?: string; [key: string]: unknown } 
      } 
    };
    if (axiosError.response) {
      console.error('Test response status:', axiosError.response.status);
      console.error('Test response data:', JSON.stringify(axiosError.response.data));
    }
    throw error;
  }
}; 