'use client';

import { useState } from 'react';
import Layout from '../components/Layout';
import DocumentUpload from '../components/DocumentUpload';
import AgentConfig from '../components/AgentConfig';
import AgentControl from '../components/AgentControl';
import CollectionsList from '../components/CollectionsList';

export default function Home() {
  const [userId, setUserId] = useState<string>('test_user');

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  return (
    <Layout>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User ID
        </label>
        <input
          type="text"
          value={userId}
          onChange={handleUserIdChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
        />
        <p className="text-sm text-gray-500">
          All operations will be performed for this user ID.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DocumentUpload userId={userId} />
          <CollectionsList userId={userId} />
        </div>
        <div>
          <AgentConfig userId={userId} />
          <AgentControl userId={userId} />
        </div>
      </div>
    </Layout>
  );
}
