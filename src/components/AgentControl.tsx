import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { startAgent, stopAgent, listAgents, listCollections, testStartAgent } from '../utils/api';
import { Collection, AgentControlFormData, UserIdProps } from '../types';

export default function AgentControl({ userId }: UserIdProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AgentControlFormData>({
    defaultValues: {
      agent_type: 'voice'
    }
  });
  
  const [result, setResult] = useState<{
    success?: boolean;
    loading?: boolean;
    message: string;
    errorDetails?: string;
  } | null>(null);
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [agentRunning, setAgentRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch collections when component mounts
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch collections
        const collectionsData = await listCollections(userId);
        setCollections(collectionsData.collections || []);
        
        // Check if any agent is already running for this user
        const agentsData = await listAgents();
        const userAgent = agentsData.agents.find(agent => agent.user_id === userId);
        setAgentRunning(Boolean(userAgent));
        
      } catch (error) {
        console.error("Failed to load initial data:", error);
        // Still proceed with empty collections if there's an error
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [userId]);
  
  const onStartAgent: SubmitHandler<AgentControlFormData> = async (data) => {
    try {
      setResult({ loading: true, message: "Starting agent..." });
      console.log("Sending data to server:", {
        userId,
        collection_name: data.collection_name || null,
        phone_number: data.phone_number || null,
        agent_type: data.agent_type
      });
      const result = await startAgent(
        userId,
        data.collection_name || null,
        data.phone_number || null,
        data.agent_type
      );
      
      setResult({
        success: true,
        message: result.status === 'already_running' 
          ? 'Agent is already running' 
          : 'Agent started successfully'
      });
      
      setAgentRunning(true);
    } catch (error: any) {
      console.error("Error starting agent:", error);
      const errorDetail = error.response?.data?.detail || error.message || 'Failed to start agent';
      console.error("Error detail:", errorDetail);
      setResult({ 
        success: false, 
        message: 'Error starting agent',
        errorDetails: JSON.stringify(errorDetail, null, 2)
      });
    }
  };
  
  const onStopAgent = async () => {
    try {
      setResult({ loading: true, message: "Stopping agent..." });
      const result = await stopAgent(userId);
      
      setResult({
        success: true,
        message: 'Agent stopped successfully'
      });
      
      setAgentRunning(false);
    } catch (error: any) {
      console.error("Error stopping agent:", error);
      setResult({ 
        success: false, 
        message: error.response?.data?.detail || error.message || 'Failed to stop agent' 
      });
    }
  };

  if (isLoading) {
    return <div className="bg-purple-100 border-2 border-purple-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Agent Control</h2>
      <div className="animate-pulse text-black">Loading agent control...</div>
    </div>;
  }

  return (
    <div className="bg-purple-100 border-2 border-purple-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Agent Control</h2>
      
      {!agentRunning ? (
        <form onSubmit={handleSubmit(onStartAgent)}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-black">
              Collection
            </label>
            <select
              className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-black"
              {...register('collection_name')}
            >
              <option value="">Default</option>
              {collections.map(collection => (
                <option key={collection.name} value={collection.name}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-black">
              Phone Number (for outbound calls)
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-black"
              placeholder="+1234567890"
              {...register('phone_number')}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-black">
              Agent Type
            </label>
            <div className="mt-1 flex">
              <div className="flex items-center mr-6">
                <input
                  id="voice-agent"
                  type="radio"
                  value="voice"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  {...register('agent_type')}
                  defaultChecked
                />
                <label htmlFor="voice-agent" className="ml-2 block text-sm font-medium text-black">
                  Voice Agent
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="web-agent"
                  type="radio"
                  value="web"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  {...register('agent_type')}
                />
                <label htmlFor="web-agent" className="ml-2 block text-sm font-medium text-black">
                  Web Agent
                </label>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Starting...' : 'START AGENT'}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-4 font-bold text-black">Agent is currently running</p>
          <button
            onClick={onStopAgent}
            disabled={isSubmitting}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Stopping...' : 'STOP AGENT'}
          </button>
        </div>
      )}
      
      {result && !result.loading && (
        <div className={`mt-4 p-4 rounded-md border-2 ${result.success ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
          <p className="text-base font-bold">{result.message}</p>
          {result.errorDetails && (
            <div className="mt-2 p-3 bg-gray-800 text-white rounded overflow-auto max-h-48">
              <pre className="text-sm">{result.errorDetails}</pre>
            </div>
          )}
        </div>
      )}

      {/* Debug button for testing API */}
      <div className="mt-4">
        <button 
          type="button" 
          onClick={async () => {
            try {
              setResult({ loading: true, message: "Testing API..." });
              await testStartAgent(userId);
              setResult({ success: true, message: "API test successful" });
            } catch (error: any) {
              console.error("Test API error:", error);
              const errorDetail = error.response?.data?.detail || error.message || 'Unknown error';
              setResult({ 
                success: false, 
                message: `API test failed`,
                errorDetails: JSON.stringify(errorDetail, null, 2)
              });
            }
          }}
          className="mt-2 py-3 px-4 border-2 border-black rounded-md shadow-lg text-base font-bold bg-yellow-400 text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 w-full"
        >
          TEST API (DEBUG)
        </button>
      </div>
    </div>
  );
} 