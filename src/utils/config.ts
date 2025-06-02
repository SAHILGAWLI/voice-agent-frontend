// Configuration with fallback URLs
export const config = {
  documentApiUrl: process.env.NEXT_PUBLIC_DOCUMENT_API_URL || 'http://51.20.138.127:8000',
  agentManagerApiUrl: process.env.NEXT_PUBLIC_AGENT_MANAGER_URL || 'http://51.20.138.127:8001',
  useMockData: false
}; 