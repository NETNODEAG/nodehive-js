import React, { useState } from 'react';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { Link, Loader2, Search, Code, ExternalLink } from 'lucide-react';
import CodeGenerator from '../CodeGenerator';
import { generateRouterCode } from '../../utils/codeGenerator';

function RouterExplorer({ client, onDataFetch, isLoading, setIsLoading, setError }) {
  const [formData, setFormData] = useState({
    path: '',
    method: 'getRouteByPath',
    language: ''
  });
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);

  const handleGetRouteByPath = async (e) => {
    e.preventDefault();

    if (!formData.path) {
      setError('Please enter a path');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const options = {
        lang: formData.language || undefined
      };

      const response = await client.getRouteByPath(formData.path, options);
      onDataFetch(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRedirects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new DrupalJsonApiParams();
      params.addPageLimit(50);
      params.addSort('status_code', 'ASC');

      const options = {
        params,
        lang: formData.language || undefined
      };

      const response = await client.getRedirects(options);
      onDataFetch(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPathAliases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new DrupalJsonApiParams();
      params.addPageLimit(50);
      params.addSort('alias', 'ASC');

      const options = {
        params,
        lang: formData.language || undefined
      };

      const response = await client.getPathAliases(options);
      onDataFetch(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslatePath = async () => {
    if (!formData.path) {
      setError('Please enter a path');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to translate the path from alias to internal
      const response = await client.translatePath(formData.path, formData.language || undefined);
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
          <Link size={18} />
          Explore Routes & Aliases
        </h3>
      </div>

      <form onSubmit={handleGetRouteByPath} className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="space-y-4">
          {/* Path Input */}
          <div>
            <label className="label">Path / URL</label>
            <input
              type="text"
              className="input mt-1"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="/about, /node/123, /products/example"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a path to resolve its route or check aliases
            </p>
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

          {/* Method Selection */}
          <div>
            <label className="label">Operation</label>
            <select
              className="select mt-1"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            >
              <option value="getRouteByPath">Get Route by Path</option>
              <option value="translatePath">Translate Path</option>
              <option value="getPathAliases">List Path Aliases</option>
              <option value="getRedirects">List Redirects</option>
            </select>
          </div>

          <div className="card p-4">
            <h4 className="text-sm font-medium mb-2">Router Information</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Route by Path:</strong> Resolve a URL to its entity</li>
              <li>• <strong>Translate Path:</strong> Convert between alias and internal path</li>
              <li>• <strong>Path Aliases:</strong> List all URL aliases</li>
              <li>• <strong>Redirects:</strong> List redirect rules</li>
            </ul>
          </div>

          {/* Examples */}
          <div className="card p-4">
            <h4 className="text-sm font-medium mb-2">Example Paths</h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, path: '/node/1' })}
                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80"
              >
                <ExternalLink size={12} />
                /node/1
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, path: '/about' })}
                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80"
              >
                <ExternalLink size={12} />
                /about
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, path: '/contact' })}
                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80"
              >
                <ExternalLink size={12} />
                /contact
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-card pt-4 mt-6 border-t border-border space-y-2">
          {formData.method === 'getRouteByPath' && (
            <button
              type="submit"
              className="btn btn-primary btn-md w-full"
              disabled={isLoading || !formData.path}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2" size={16} />
                  Get Route
                </>
              )}
            </button>
          )}

          {formData.method === 'translatePath' && (
            <button
              type="button"
              onClick={handleTranslatePath}
              className="btn btn-primary btn-md w-full"
              disabled={isLoading || !formData.path}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Loading...
                </>
              ) : (
                <>
                  <Link className="mr-2" size={16} />
                  Translate Path
                </>
              )}
            </button>
          )}

          {formData.method === 'getPathAliases' && (
            <button
              type="button"
              onClick={handleGetPathAliases}
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
                  <Link className="mr-2" size={16} />
                  Load Path Aliases
                </>
              )}
            </button>
          )}

          {formData.method === 'getRedirects' && (
            <button
              type="button"
              onClick={handleGetRedirects}
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
                  <ExternalLink className="mr-2" size={16} />
                  Load Redirects
                </>
              )}
            </button>
          )}

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
          code={generateRouterCode(formData, client._config)}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}
    </div>
  );
}

export default RouterExplorer;