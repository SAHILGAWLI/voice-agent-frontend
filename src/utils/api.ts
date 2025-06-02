import axios from 'axios';
import {
  DocumentUploadResponse,
  ConfigResponse,
  CollectionsResponse,
  AgentConfig,
  AgentResponse,
  AgentsListResponse,
} from '../types';
import { config } from './config';

// Flag to use mock data instead of actual API
const USE_MOCK = config.useMockData;

// Set up Axios with default error handling
const documentApi = axios.create({
  baseURL: config.documentApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
});

const agentManagerApi = axios.create({
  baseURL: config.agentManagerApiUrl,
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

// Enhanced debugging utility
export const debugApiError = (error: unknown, context: string): string => {
  console.group(`🔍 API Error Debug: ${context}`);
  console.error('Error object:', error);
  
  // Detailed error information
  const axiosError = error as { 
    response?: { 
      status: number; 
      statusText?: string;
      data: Record<string, unknown>; 
      headers?: Record<string, string>; 
    };
    request?: XMLHttpRequest;
    message?: string;
    config?: {
      url?: string;
      baseURL?: string;
      method?: string;
      headers?: Record<string, string>;
      data?: unknown;
    };
    code?: string;
    isAxiosError?: boolean;
  };
  
  let debugInfo = `API Error in ${context}\n`;
  
  // Connection details
  debugInfo += `\nConnection Details:\n`;
  debugInfo += `- API URL: ${axiosError.config?.baseURL || 'unknown'}\n`;
  debugInfo += `- Endpoint: ${axiosError.config?.url || 'unknown'}\n`;
  debugInfo += `- Method: ${axiosError.config?.method?.toUpperCase() || 'unknown'}\n`;
  
  if (axiosError.response) {
    // Server responded with non-2xx status
    console.error('📡 Server responded with error:', {
      status: axiosError.response.status,
      statusText: axiosError.response.statusText,
      data: axiosError.response.data,
      headers: axiosError.response.headers,
    });
    
    debugInfo += `\nServer Response:\n`;
    debugInfo += `- Status: ${axiosError.response.status} ${axiosError.response.statusText || ''}\n`;
    debugInfo += `- Response Data: ${JSON.stringify(axiosError.response.data, null, 2)}\n`;
    
    // CORS error detection
    const corsError = 
      axiosError.response.status === 0 ||
      axiosError.response.status === 403 ||
      axiosError.message?.includes('CORS') ||
      axiosError.message?.includes('cross-origin');
    
    if (corsError) {
      console.error('❌ CORS POLICY ERROR DETECTED!');
      debugInfo += `\n❌ CORS POLICY ERROR DETECTED!\n`;
      debugInfo += `The server is not allowing requests from ${window.location.origin}.\n`;
      debugInfo += `Server needs to add this origin to its CORS allowed origins list.\n`;
    }
    
  } else if (axiosError.request) {
    // Request was made but no response received (network error)
    console.error('🔌 Network error - Request sent but no response:', {
      request: axiosError.request,
      message: axiosError.message,
    });
    
    debugInfo += `\nNetwork Error:\n`;
    debugInfo += `- Type: Request sent but no response received\n`;
    debugInfo += `- Message: ${axiosError.message || 'Connection failed'}\n`;
    debugInfo += `- This usually indicates server is unreachable or down\n`;
    
  } else {
    // Error setting up request
    console.error('⚠️ Request setup error:', axiosError.message);
    
    debugInfo += `\nRequest Setup Error:\n`;
    debugInfo += `- Message: ${axiosError.message || 'Unknown error'}\n`;
    
    if (axiosError.message?.includes('Network Error')) {
      debugInfo += `- This appears to be a network connectivity issue\n`;
      debugInfo += `- Check if the API server is running and accessible\n`;
    }
  }
  
  // Environment information
  debugInfo += `\nEnvironment Info:\n`;
  debugInfo += `- Frontend URL: ${window.location.origin}\n`;
  debugInfo += `- Document API: ${config.documentApiUrl}\n`;
  debugInfo += `- Agent Manager API: ${config.agentManagerApiUrl}\n`;
  debugInfo += `- Browser: ${navigator.userAgent}\n`;
  
  console.groupEnd();
  return debugInfo;
};

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
    // Log the API URL being used
    console.log(`📤 Uploading documents to ${documentApi.defaults.baseURL}/upload/${userId}`);
    console.log(`Files count: ${files.length}, Collection: ${collectionName || 'default'}`);
    
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
      console.log(`Adding file: ${file.name} (${file.size} bytes)`);
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
    
    console.log('✅ Upload successful:', response.data);
    return response.data;
  } catch (error: unknown) {
    const debugInfo = debugApiError(error, 'Document Upload');
    console.error(debugInfo);
    throw new Error(debugInfo);
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
    console.log(`⚙️ Configuring agent for user ${userId}:`, config);
    
    const response = await documentApi.post<ConfigResponse>(`/config/${userId}`, config);
    console.log('✅ Agent configuration successful:', response.data);
    return response.data;
  } catch (error: unknown) {
    const debugInfo = debugApiError(error, 'Agent Configuration');
    console.error(debugInfo);
    throw new Error(debugInfo);
  }
};

export const listCollections = async (userId: string): Promise<CollectionsResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({
      collections: mockCollections
    });
  }

  try {
    console.log(`📂 Listing collections for user ${userId}`);
    
    const response = await documentApi.get<CollectionsResponse>(`/collections/${userId}`);
    console.log(`✅ Retrieved ${response.data.collections?.length || 0} collections`);
    return response.data;
  } catch (error: unknown) {
    const debugInfo = debugApiError(error, 'List Collections');
    console.error(debugInfo);
    throw new Error(debugInfo);
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
    
    console.log(`🚀 Starting ${agentType} agent for user ${userId}:`, payload);
    
    const response = await agentManagerApi.post<AgentResponse>('/start-agent', payload);
    console.log('✅ Agent started successfully:', response.data);
    
    return response.data;
  } catch (error: unknown) {
    const debugInfo = debugApiError(error, 'Start Agent');
    console.error(debugInfo);
    throw new Error(debugInfo);
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
    console.log(`🛑 Stopping agent for user ${userId}`);
    
    const response = await agentManagerApi.post<AgentResponse>(`/stop-agent/${userId}`);
    console.log('✅ Agent stopped successfully:', response.data);
    
    return response.data;
  } catch (error: unknown) {
    const debugInfo = debugApiError(error, 'Stop Agent');
    console.error(debugInfo);
    throw new Error(debugInfo);
  }
};

export const listAgents = async (): Promise<AgentsListResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({
      agents: Object.values(mockAgents)
    });
  }

  try {
    console.log('👥 Listing all agents');
    
    const response = await agentManagerApi.get<AgentsListResponse>('/agents');
    console.log(`✅ Retrieved ${response.data.agents?.length || 0} agents`);
    
    return response.data;
  } catch (error: unknown) {
    const debugInfo = debugApiError(error, 'List Agents');
    console.error(debugInfo);
    throw new Error(debugInfo);
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
    
    console.log(`🧪 Testing API with minimal payload:`, minimalPayload);
    
    const response = await agentManagerApi.post('/start-agent', minimalPayload);
    console.log('✅ API test successful:', response.data);
    
    return response.data;
  } catch (error: unknown) {
    const debugInfo = debugApiError(error, 'API Test');
    console.error(debugInfo);
    throw new Error(debugInfo);
  }
}; 