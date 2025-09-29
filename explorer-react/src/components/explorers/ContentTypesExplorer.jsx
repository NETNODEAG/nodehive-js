import React, { useState } from 'react';
import { Database, Loader2, Code } from 'lucide-react';
import CodeGenerator from '../CodeGenerator';
import { generateContentTypesCode } from '../../utils/codeGenerator';

function ContentTypesExplorer({ client, onDataFetch, isLoading, setIsLoading, setError }) {
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const loadContentTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getContentTypes();
      onDataFetch(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-medium flex items-center gap-2">
          <Database size={18} />
          Content Types
        </h3>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Retrieve all available content types from the Drupal instance.
          </p>

          <div className="card p-4">
            <h4 className="text-sm font-medium mb-2">What are Content Types?</h4>
            <p className="text-xs text-muted-foreground">
              Content types are templates for content creation. They define the fields
              and settings for different types of content like articles, pages, events, etc.
            </p>
          </div>

          <button
            onClick={loadContentTypes}
            className="btn btn-primary btn-md w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Loading...
              </>
            ) : (
              <>
                <Database className="mr-2" size={16} />
                Load Content Types
              </>
            )}
          </button>

          <button
            onClick={() => setShowCodeGenerator(true)}
            className="btn btn-secondary btn-md w-full mt-2"
          >
            <Code className="mr-2" size={16} />
            Generate Code
          </button>
        </div>
      </div>

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGenerator
          code={generateContentTypesCode(client._config)}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}
    </div>
  );
}

export default ContentTypesExplorer;