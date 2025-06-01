import { useState, useEffect } from 'react';
import { listCollections } from '../utils/api';
import { Collection, UserIdProps } from '../types';

export default function CollectionsList({ userId }: UserIdProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchCollections() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const data = await listCollections(userId);
        setCollections(data.collections || []);
        setError(null);
      } catch (err) {
        setError('Failed to load collections');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCollections();
  }, [userId]);
  
  if (loading) return (
    <div className="bg-yellow-100 border-2 border-yellow-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Document Collections</h2>
      <p className="text-black font-medium animate-pulse">Loading collections...</p>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border-2 border-red-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Document Collections</h2>
      <p className="text-red-600 font-bold">{error}</p>
    </div>
  );
  
  if (collections.length === 0) return (
    <div className="bg-yellow-100 border-2 border-yellow-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Document Collections</h2>
      <p className="text-black font-medium">No collections found.</p>
    </div>
  );
  
  return (
    <div className="bg-yellow-100 border-2 border-yellow-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Document Collections</h2>
      <ul className="divide-y divide-yellow-300">
        {collections.map((collection) => (
          <li key={collection.name} className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-black">{collection.name}</p>
                <p className="text-sm font-medium text-black">{collection.path}</p>
              </div>
              {collection.is_default && (
                <span className="bg-yellow-200 text-black text-xs font-bold px-2.5 py-1 rounded border border-yellow-500">
                  Default
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 