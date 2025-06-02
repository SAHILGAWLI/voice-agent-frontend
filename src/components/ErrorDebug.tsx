'use client';

import React from 'react';

interface ErrorDebugProps {
  error: Error;
  context?: string;
  onClose?: () => void;
}

/**
 * A component that displays detailed debug information for API errors
 */
export default function ErrorDebug({ error, context = 'API Error', onClose }: ErrorDebugProps) {
  const [expanded, setExpanded] = React.useState(false);
  
  const toggleExpand = () => {
    setExpanded(prev => !prev);
  };
  
  // Extract useful parts from the error message
  const errorParts = {
    message: error.message.split('\n')[0] || 'Unknown error',
    connection: error.message.includes('Connection Details') 
      ? error.message.split('Connection Details:')[1]?.split('\n\n')[0] 
      : null,
    response: error.message.includes('Server Response') 
      ? error.message.split('Server Response:')[1]?.split('\n\n')[0] 
      : null,
    cors: error.message.includes('CORS POLICY ERROR DETECTED') 
      ? error.message.split('CORS POLICY ERROR DETECTED')[1]?.split('\n\n')[0] 
      : null,
    network: error.message.includes('Network Error') 
      ? error.message.split('Network Error:')[1]?.split('\n\n')[0] 
      : null,
    setupError: error.message.includes('Request Setup Error') 
      ? error.message.split('Request Setup Error:')[1]?.split('\n\n')[0] 
      : null,
    environment: error.message.includes('Environment Info') 
      ? error.message.split('Environment Info:')[1] 
      : null
  };
  
  // Determine the type of error for styling and messaging
  const isCorsError = error.message.includes('CORS POLICY ERROR');
  const isNetworkError = error.message.includes('Network Error') || error.message.includes('Request sent but no response');
  const isServerError = error.message.includes('Server Response') && !isCorsError;
  
  return (
    <div className="my-5 bg-red-50 border-2 border-red-500 rounded-lg p-5 text-red-900">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center">
          {isCorsError && <span className="mr-2">🌐</span>}
          {isNetworkError && <span className="mr-2">🔌</span>}
          {isServerError && <span className="mr-2">🚨</span>}
          {!isCorsError && !isNetworkError && !isServerError && <span className="mr-2">❌</span>}
          {context}
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        )}
      </div>

      {/* Primary error message */}
      <div className="mt-3 font-medium">
        {isCorsError ? (
          <p>CORS Policy Error: The API server is not allowing requests from this website.</p>
        ) : isNetworkError ? (
          <p>Network Error: Cannot connect to the API server.</p>
        ) : (
          <p>{errorParts.message}</p>
        )}
      </div>

      {/* Help text based on error type */}
      <div className="mt-2 text-sm">
        {isCorsError && (
          <div className="p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="font-medium">This is a CORS configuration issue:</p>
            <p>The server needs to be configured to allow requests from: <code className="bg-yellow-200 px-1 rounded">{window.location.origin}</code></p>
          </div>
        )}
        
        {isNetworkError && (
          <div className="p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="font-medium">Possible causes:</p>
            <ul className="list-disc list-inside">
              <li>The API server is down or unreachable</li>
              <li>There&apos;s a network connectivity issue</li>
              <li>The API URL configuration is incorrect</li>
            </ul>
          </div>
        )}
      </div>

      {/* Technical details toggle */}
      <div className="mt-4 border-t border-red-300 pt-3">
        <button 
          onClick={toggleExpand}
          className="flex items-center font-medium text-red-800 hover:text-red-600"
        >
          <span className="mr-1">{expanded ? '▼' : '▶'}</span>
          Technical Details
        </button>
        
        {expanded && (
          <div className="mt-3 p-3 bg-red-100 rounded-md overflow-auto max-h-96 text-xs font-mono">
            {/* Connection Details */}
            {errorParts.connection && (
              <div className="mb-3">
                <h4 className="font-bold">Connection Details:</h4>
                <pre className="whitespace-pre-wrap">{errorParts.connection}</pre>
              </div>
            )}
            
            {/* Server Response */}
            {errorParts.response && (
              <div className="mb-3">
                <h4 className="font-bold">Server Response:</h4>
                <pre className="whitespace-pre-wrap">{errorParts.response}</pre>
              </div>
            )}
            
            {/* CORS Error */}
            {errorParts.cors && (
              <div className="mb-3">
                <h4 className="font-bold">CORS Error:</h4>
                <pre className="whitespace-pre-wrap">{errorParts.cors}</pre>
              </div>
            )}
            
            {/* Network Error */}
            {errorParts.network && (
              <div className="mb-3">
                <h4 className="font-bold">Network Error:</h4>
                <pre className="whitespace-pre-wrap">{errorParts.network}</pre>
              </div>
            )}
            
            {/* Request Setup Error */}
            {errorParts.setupError && (
              <div className="mb-3">
                <h4 className="font-bold">Request Setup Error:</h4>
                <pre className="whitespace-pre-wrap">{errorParts.setupError}</pre>
              </div>
            )}
            
            {/* Environment Info */}
            {errorParts.environment && (
              <div className="mb-3">
                <h4 className="font-bold">Environment Info:</h4>
                <pre className="whitespace-pre-wrap">{errorParts.environment}</pre>
              </div>
            )}
            
            {/* Full Error */}
            <div className="mt-4">
              <h4 className="font-bold">Full Error Message:</h4>
              <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-40 p-2 bg-red-50">
                {error.message}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 