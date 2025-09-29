import React, { useState, useEffect } from 'react';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { Search, Loader2, ChevronDown, ChevronUp, Code } from 'lucide-react';
import FieldSelector from '../FieldSelector';
import CodeGenerator from '../CodeGenerator';
import { generateNodeCode } from '../../utils/codeGenerator';

function NodesExplorer({ client, onDataFetch, isLoading, setIsLoading, setError }) {
  const [contentTypes, setContentTypes] = useState([]);
  const [formData, setFormData] = useState({
    contentType: '',
    language: '',
    limit: 10,
    sort: '',
    includes: '',
    fields: []
  });
  const [availableFields, setAvailableFields] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);

  useEffect(() => {
    loadContentTypes();
  }, [client]);

  const loadContentTypes = async () => {
    try {
      const response = await client.getContentTypes();
      if (response.data) {
        setContentTypes(response.data);
      }
    } catch (error) {
      console.error('Failed to load content types:', error);
    }
  };

  const handleContentTypeChange = async (contentType) => {
    setFormData({ ...formData, contentType, fields: [] });

    if (!contentType) {
      setAvailableFields([]);
      return;
    }

    try {
      // Fetch a sample node to discover fields
      const params = new DrupalJsonApiParams().addPageLimit(1);
      const response = await client.getNodes(contentType, { params });

      if (response.data && response.data.length > 0) {
        const sampleNode = response.data[0];
        let fields = [];

        // Check for fields in attributes
        if (sampleNode.attributes) {
          fields = Object.keys(sampleNode.attributes);
        }

        // Also check for direct fields
        const directFields = Object.keys(sampleNode).filter(key =>
          !['id', 'type', 'links', 'relationships', 'attributes', 'meta'].includes(key)
        );

        // Combine and deduplicate
        const allFields = [...new Set([...fields, ...directFields])].sort();
        setAvailableFields(allFields);
      }
    } catch (error) {
      console.error('Failed to fetch fields:', error);
      setAvailableFields([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.contentType) {
      setError('Please select a content type');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new DrupalJsonApiParams();

      // Add limit
      if (formData.limit > 0) {
        params.addPageLimit(formData.limit);
      }

      // Add sort
      if (formData.sort) {
        const [field, direction] = formData.sort.split(',');
        params.addSort(field, direction);
      }

      // Add includes
      if (formData.includes) {
        params.addInclude(formData.includes.split(',').map(i => i.trim()));
      }

      // Add fields
      if (formData.fields.length > 0) {
        params.addFields(`node--${formData.contentType}`, formData.fields);
      }

      const options = {
        params,
        lang: formData.language || undefined
      };

      const response = await client.getNodes(formData.contentType, options);
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
        <h3 className="font-medium">Explore Nodes</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="space-y-4">
          {/* Content Type Selection */}
          <div>
            <label className="label">Content Type *</label>
            <select
              className="select mt-1"
              value={formData.contentType}
              onChange={(e) => handleContentTypeChange(e.target.value)}
              required
            >
              <option value="">Select content type...</option>
              {contentTypes.map((type) => (
                <option
                  key={type.id}
                  value={type.attributes?.drupal_internal__type || type.type}
                >
                  {type.attributes?.name || type.attributes?.drupal_internal__type || type.type}
                </option>
              ))}
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
              max="100"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="label">Sort By</label>
            <select
              className="select mt-1"
              value={formData.sort}
              onChange={(e) => setFormData({ ...formData, sort: e.target.value })}
            >
              <option value="">Default</option>
              <option value="created,DESC">Created (Newest First)</option>
              <option value="created,ASC">Created (Oldest First)</option>
              <option value="changed,DESC">Updated (Newest First)</option>
              <option value="title,ASC">Title (A-Z)</option>
              <option value="title,DESC">Title (Z-A)</option>
            </select>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-4 pl-6 border-l-2 border-border">
                {/* Include Relations */}
                <div>
                  <label className="label">Include Relations</label>
                  <input
                    type="text"
                    className="input mt-1"
                    value={formData.includes}
                    onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                    placeholder="uid,field_image"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated field names
                  </p>
                </div>
              </div>
            )}
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
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-card pt-4 mt-6 border-t border-border space-y-2">
          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={isLoading || !formData.contentType}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Loading...
              </>
            ) : (
              <>
                <Search className="mr-2" size={16} />
                Load Nodes
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowCodeGenerator(true)}
            className="btn btn-secondary btn-md w-full"
            disabled={!formData.contentType}
          >
            <Code className="mr-2" size={16} />
            Generate Code
          </button>
        </div>
      </form>

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGenerator
          code={generateNodeCode(formData, client._config)}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}
    </div>
  );
}

export default NodesExplorer;