import React from 'react';
import NodesExplorer from './explorers/NodesExplorer';
import TaxonomyExplorer from './explorers/TaxonomyExplorer';
import ContentTypesExplorer from './explorers/ContentTypesExplorer';
import MediaExplorer from './explorers/MediaExplorer';
import MenusExplorer from './explorers/MenusExplorer';
import RouterExplorer from './explorers/RouterExplorer';
import SpacesExplorer from './explorers/SpacesExplorer';
import { AlertCircle } from 'lucide-react';

function EntityExplorer({ entity, client, isConnected, onDataFetch, isLoading, setIsLoading, setError, userInfo }) {
  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Not Connected</h3>
          <p className="text-sm text-muted-foreground">
            Connect to a NodeHive instance to start exploring
          </p>
        </div>
      </div>
    );
  }

  const explorers = {
    'nodes': NodesExplorer,
    'taxonomy': TaxonomyExplorer,
    'content-types': ContentTypesExplorer,
    'media': MediaExplorer,
    'menus': MenusExplorer,
    'router': RouterExplorer,
    'spaces': SpacesExplorer,
  };

  const Explorer = explorers[entity];

  if (!Explorer) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            This entity explorer is under development
          </p>
        </div>
      </div>
    );
  }

  return (
    <Explorer
      client={client}
      onDataFetch={onDataFetch}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      setError={setError}
      userInfo={userInfo}
    />
  );
}

export default EntityExplorer;