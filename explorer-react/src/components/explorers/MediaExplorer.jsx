import React, { useState } from 'react';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { Image, Loader2, Search, Code } from 'lucide-react';
import CodeGenerator from '../CodeGenerator';
import { generateMediaCode } from '../../utils/codeGenerator';

function MediaExplorer({ client, onDataFetch, isLoading, setIsLoading, setError }) {
  const [formData, setFormData] = useState({
    mediaType: 'image',
    limit: 10,
    language: ''
  });
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const params = new DrupalJsonApiParams();
      params.addPageLimit(formData.limit);

      const options = {
        params,
        lang: formData.language || undefined
      };

      const response = await client.getMediaList(formData.mediaType, options);
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
          <Image size={18} />
          Explore Media
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="space-y-4">
          {/* Media Type */}
          <div>
            <label className="label">Media Type</label>
            <select
              className="select mt-1"
              value={formData.mediaType}
              onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="file">File</option>
              <option value="document">Document</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="label">Language</label>
            <input
              type="text"
              className="input mt-1"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              placeholder="en"
            />
          </div>

          {/* Limit */}
          <div>
            <label className="label">Limit</label>
            <input
              type="number"
              className="input mt-1"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
              min="1"
              max="50"
            />
          </div>

          <div className="card p-4">
            <h4 className="text-sm font-medium mb-2">Media Information</h4>
            <p className="text-xs text-muted-foreground">
              Media entities include images, videos, documents, and other file types
              managed by your Drupal instance.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-card pt-4 mt-6 border-t border-border space-y-2">
          <button
            type="submit"
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
                <Search className="mr-2" size={16} />
                Load Media
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowCodeGenerator(true)}
            className="btn btn-secondary btn-md w-full"
          >
            <Code className="mr-2" size={16} />
            Generate Code
          </button>
        </div>
      </form>

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGenerator
          code={generateMediaCode(formData, client._config)}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}
    </div>
  );
}

export default MediaExplorer;