import {
  Collection,
  CollectionsResponse,
  DocumentUploadResponse,
  ConfigResponse,
  AgentResponse,
  AgentsListResponse,
  Agent
} from '../../types';

// Mock collections
export const mockCollections: Collection[] = [
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

// Mock agents
export const mockAgents: Record<string, Agent> = {};

// Mock responses
export const mockResponses = {
  // Document Upload API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  listCollections: (_: string): CollectionsResponse => ({
    collections: mockCollections
  }),

  uploadDocuments: (userId: string): DocumentUploadResponse => ({
    status: 'success',
    message: 'Documents uploaded and processed successfully',
    document_count: 5,
    index_id: `${userId}_index_123`
  }),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configureAgent: (_: string): ConfigResponse => ({
    status: 'success',
    message: 'Agent configuration updated successfully'
  }),

  // Agent Manager API
  listAgents: (): AgentsListResponse => ({
    agents: Object.values(mockAgents)
  }),

  startAgent: (userId: string, agentType: 'voice' | 'web' = 'voice'): AgentResponse => {
    // Add mock agent to the list
    mockAgents[userId] = {
      user_id: userId,
      agent_type: agentType,
      running_time: 0
    };

    return {
      status: 'success',
      user_id: userId,
      container_id: `container_${userId}_${Date.now()}`
    };
  },

  stopAgent: (userId: string): AgentResponse => {
    // Remove mock agent from the list
    delete mockAgents[userId];
    
    return {
      status: 'success',
      user_id: userId
    };
  }
};

// Document Upload API mocks
export const getMockCollections = () => ({
  collections: mockCollections
});

export const getMockUploadResponse = (userId: string) => ({
  status: 'success',
  message: 'Documents uploaded and processed successfully',
  document_count: 5,
  index_id: `${userId}_index_123`
});

export const getMockConfigResponse = () => ({
  status: 'success',
  message: 'Agent configuration updated successfully'
});

// Agent Manager API mocks
export const getMockAgentsList = () => ({
  agents: Object.values(mockAgents)
});

export const getMockStartAgentResponse = (userId: string, agentType: string) => {
  // Add mock agent to the list
  mockAgents[userId] = {
    user_id: userId,
    agent_type: agentType,
    running_time: 0
  };

  return {
    status: 'success',
    user_id: userId,
    container_id: `container_${userId}_${Date.now()}`
  };
};

export const getMockStopAgentResponse = (userId: string) => {
  // Remove mock agent from the list
  delete mockAgents[userId];
  
  return {
    status: 'success',
    user_id: userId
  };
}; 