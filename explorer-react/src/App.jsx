import React, { useState } from 'react';
import { NodeHiveClient } from 'nodehive-js';
import Sidebar from './components/Sidebar';
import ConnectionConfig from './components/ConnectionConfig';
import EntityExplorer from './components/EntityExplorer';
import RequestPanel from './components/RequestPanel';
import DataViewer from './components/DataViewer';

function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('nodes');
  const [requestInfo, setRequestInfo] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async (config) => {
    try {
      setIsLoading(true);
      setError(null);

      const newClient = new NodeHiveClient({
        baseUrl: config.baseUrl,
        debug: config.debug,
        timeout: config.timeout,
        defaultLanguage: config.language || undefined,
        retry: {
          enabled: config.retryEnabled,
          maxAttempts: config.retryAttempts,
          delay: 1000
        },
        auth: config.authToken ? { token: config.authToken } : undefined
      });

      // Add interceptors
      newClient.addRequestInterceptor((config, context) => {
        setRequestInfo({
          method: 'GET',
          url: context.url,
          headers: config.headers,
          timestamp: new Date().toISOString()
        });
        return config;
      });

      newClient.addResponseInterceptor((data, context) => {
        setRequestInfo(prev => ({
          ...prev,
          status: context.response?.status,
          statusText: context.response?.statusText,
          duration: Date.now() - new Date(prev?.timestamp).getTime()
        }));
        return data;
      });

      // Test connection
      await newClient.getContentTypes();

      setClient(newClient);
      setIsConnected(true);
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setClient(null);
    setIsConnected(false);
    setRequestInfo(null);
    setResponseData(null);
  };

  const handleDataFetch = (data) => {
    setResponseData(data);
  };

  return (
    <div className="flex w-screen h-screen bg-background">
      <Sidebar
        selectedEntity={selectedEntity}
        onSelectEntity={setSelectedEntity}
        isConnected={isConnected}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
          <h1 className="flex items-center gap-3 text-xl font-semibold">
            <span className="text-2xl">🔍</span>
            NodeHive Explorer
          </h1>
          <ConnectionConfig
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={isConnected}
            isLoading={isLoading}
          />
        </header>

        {error && (
          <div className="flex items-center justify-between px-6 py-3 bg-destructive/10 border-b border-destructive/20 text-destructive animate-slide-in">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80 text-lg leading-none"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Form Column */}
          <div className="w-[400px] border-r border-border flex flex-col">
            <EntityExplorer
              entity={selectedEntity}
              client={client}
              isConnected={isConnected}
              onDataFetch={handleDataFetch}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setError={setError}
            />
          </div>

          {/* Request/Response Column */}
          <div className="w-[400px] border-r border-border flex flex-col">
            <RequestPanel requestInfo={requestInfo} />
          </div>

          {/* Data Viewer Column */}
          <div className="flex-1 flex flex-col min-w-[400px]">
            <DataViewer data={responseData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;