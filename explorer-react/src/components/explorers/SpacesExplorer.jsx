import React, { useState, useEffect } from 'react';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { Globe, Loader2, Search, Code, ShieldAlert } from 'lucide-react';
import FieldSelector from '../FieldSelector';
import CodeGenerator from '../CodeGenerator';
import { generateSpacesCode } from '../../utils/codeGenerator';

function SpacesExplorer({ client, onDataFetch, isLoading, setIsLoading, setError, userInfo }) {
  const [formData, setFormData] = useState({
    spaceId: '',
    language: '',
    limit: 10,
    fields: [],
    includeRelationships: false
  });
  const [availableFields, setAvailableFields] = useState([]);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    checkAuthentication();
  }, [client, userInfo]);

  const checkAuthentication = async () => {
    try {
      const token = await client.auth?.getToken();
      setIsAuthenticated(!!token && !!userInfo);
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAvailableFields();
    }
  }, [isAuthenticated]);

  const loadAvailableFields = async () => {
    try {
      // Try to fetch spaces to discover fields
      const params = new DrupalJsonApiParams()
        .addPageLimit(1)
        .addCustomParam({ jsonapi_include: 1 });

      const response = await client.request('/jsonapi/nodehive_space/nodehive_space?' + params.getQueryString());

      if (response.data && response.data.length > 0) {
        const sampleSpace = response.data[0];
        let fields = [];

        // Check for fields in attributes
        if (sampleSpace.attributes) {
          fields = Object.keys(sampleSpace.attributes);
        }

        // Also check for direct fields
        const directFields = Object.keys(sampleSpace).filter(key =>
          !['id', 'type', 'links', 'relationships', 'attributes', 'meta'].includes(key)
        );

        // Combine and deduplicate
        const allFields = [...new Set([...fields, ...directFields])].sort();
        setAvailableFields(allFields);
      }
    } catch (error) {
      console.error('Failed to fetch space fields:', error);
      // Provide common space fields as fallback
      setAvailableFields([
        'title', 'status', 'created', 'changed', 'path',
        'langcode', 'default_langcode', 'domain', 'subdomain',
        'field_space_type', 'field_space_settings', 'field_space_owner'
      ]);
    }
  };

  const handleLoadSpaces = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('You must be logged in as an administrator to access NodeHive Spaces');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new DrupalJsonApiParams();

      // Add jsonapi_include for complete data
      params.addCustomParam({ jsonapi_include: 1 });

      // Add specific space filter if provided
      if (formData.spaceId) {
        params.addFilter('drupal_internal__id', formData.spaceId);
      }

      // Add pagination
      if (formData.limit) {
        params.addPageLimit(formData.limit);
      }

      // Add field selection
      if (formData.fields.length > 0) {
        params.addFields('nodehive_space--nodehive_space', formData.fields);
      }

      // Include relationships if requested
      if (formData.includeRelationships) {
        params.addInclude(['field_space_owner', 'field_space_type']);
      }

      // Sort by created date
      params.addSort('created', 'DESC');

      const options = {
        lang: formData.language || undefined
      };

      const endpoint = '/jsonapi/nodehive_space/nodehive_space';
      const queryString = params.getQueryString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await client.request(fullEndpoint, options);
      onDataFetch(response);
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        setError('Access denied. Please ensure you are logged in with administrator privileges.');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSingleSpace = async () => {
    if (!formData.spaceId) {
      setError('Please enter a Space ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const endpoint = `/jsonapi/nodehive_space/nodehive_space/${formData.spaceId}`;
      const response = await client.request(endpoint);
      onDataFetch(response);
    } catch (error) {
      if (error.message.includes('404')) {
        setError('Space not found');
      } else if (error.message.includes('403')) {
        setError('Access denied to this space');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-medium flex items-center gap-2">
            <Globe size={18} />
            NodeHive Spaces
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <ShieldAlert size={48} className="mx-auto text-warning" />
            <h4 className="font-medium text-lg">Authentication Required</h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              You must be logged in as an administrator to access NodeHive Spaces.
              Please connect and authenticate using the connection settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-medium flex items-center gap-2">
          <Globe size={18} />
          NodeHive Spaces
        </h3>
      </div>

      <form onSubmit={handleLoadSpaces} className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="space-y-4">
          {/* Space ID Filter */}
          <div>
            <label className="label">Space ID (Optional)</label>
            <input
              type="text"
              className="input mt-1"
              value={formData.spaceId}
              onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
              placeholder="Enter specific space ID or leave empty for all"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Filter by specific space machine name
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

          {/* Limit */}
          <div>
            <label className="label">Limit</label>
            <input
              type="number"
              className="input mt-1"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
              min="1"
              max="100"
            />
          </div>

          {/* Include Relationships */}
          <div className="flex items-center gap-2">
            <input
              id="includeRelationships"
              type="checkbox"
              className="rounded border-input text-primary focus:ring-primary"
              checked={formData.includeRelationships}
              onChange={(e) => setFormData({ ...formData, includeRelationships: e.target.checked })}
            />
            <label htmlFor="includeRelationships" className="text-sm">
              Include relationships (owner, type)
            </label>
          </div>

          {/* Field Selection */}
          {availableFields.length > 0 && (
            <FieldSelector
              fields={availableFields}
              selectedFields={formData.fields}
              onChange={(fields) => setFormData({ ...formData, fields })}
              label="Select Fields"
            />
          )}

          <div className="card p-4">
            <h4 className="text-sm font-medium mb-2">About NodeHive Spaces</h4>
            <p className="text-xs text-muted-foreground">
              NodeHive Spaces are multi-tenant containers that allow you to manage
              separate instances within a single NodeHive installation. Each space
              can have its own domain, settings, and content. Administrator access
              is required to view and manage spaces.
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
                Load Spaces
              </>
            )}
          </button>

          {formData.spaceId && (
            <button
              type="button"
              onClick={handleLoadSingleSpace}
              className="btn btn-outline btn-md w-full"
              disabled={isLoading}
            >
              Load Single Space
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
          code={generateSpacesCode(formData, client._config)}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}
    </div>
  );
}

export default SpacesExplorer;