import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { configureAgent } from '../utils/api';
import { AgentConfigFormData, UserIdProps } from '../types';

export default function AgentConfig({ userId }: UserIdProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AgentConfigFormData>({
    defaultValues: {
      system_prompt: 'You are a helpful assistant. Provide accurate and concise information based on the documents provided.',
      voice: 'alloy',
      model: 'gpt-4o-mini',
      agent_name: 'Assistant',
    }
  });
  
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const onSubmit: SubmitHandler<AgentConfigFormData> = async (data) => {
    try {
      const result = await configureAgent(userId, data);
      setResult({ success: true, message: result.message });
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.response?.data?.detail || error.message 
      });
    }
  };

  return (
    <div className="bg-blue-100 border-2 border-blue-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Configure Agent</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-bold text-black">
            System Prompt
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            rows={4}
            {...register('system_prompt', { required: true })}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-bold text-black">
            Voice
          </label>
          <select
            className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            {...register('voice')}
          >
            <option value="alloy">Alloy</option>
            <option value="echo">Echo</option>
            <option value="fable">Fable</option>
            <option value="nova">Nova</option>
            <option value="shimmer">Shimmer</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-bold text-black">
            Model
          </label>
          <select
            className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            {...register('model')}
          >
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-black">
            Agent Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            placeholder="Assistant"
            {...register('agent_name')}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'SAVE CONFIGURATION'}
        </button>
      </form>
      
      {result && (
        <div className={`mt-4 p-4 rounded-md border-2 ${result.success ? 'bg-green-100 border-green-500 text-black' : 'bg-red-100 border-red-500 text-black'}`}>
          <p className="text-base font-bold">{result.message}</p>
        </div>
      )}
    </div>
  );
} 