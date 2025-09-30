import React, { useState, useEffect } from 'react';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { Search, Loader2, Tag, Code } from 'lucide-react';
import FieldSelector from '../FieldSelector';
import CodeGenerator from '../CodeGenerator';
import { generateTaxonomyCode } from '../../utils/codeGenerator';

function TaxonomyExplorer({ client, onDataFetch, isLoading, setIsLoading, setError }) {
  const [vocabularies, setVocabularies] = useState([]);
  const [formData, setFormData] = useState({
    vocabulary: '',
    language: '',
    limit: 10,
    sort: '',
    includes: '',
    fields: []
  });
  const [availableFields, setAvailableFields] = useState([]);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);

  useEffect(() => {
    loadVocabularies();
  }, [client]);

  const loadVocabularies = async () => {
    try {
      const params = new DrupalJsonApiParams();
      params.addCustomParam({ jsonapi_include: 1 });
      const response = await client.getTaxonomyVocabularies({ params });
      // Always expect response.data since we're getting the full response now
      if (response && response.data) {
        setVocabularies(response.data);
      }
    } catch (error) {
      console.error('Failed to load vocabularies:', error);
      // Add fallback vocabularies with correct structure
      setVocabularies([
        { id: '1', drupal_internal__vid: 'tags', name: 'Tags' },
        { id: '2', drupal_internal__vid: 'categories', name: 'Categories' }
      ]);
    }
  };

  const handleVocabularyChange = async (vocabulary) => {
    setFormData({ ...formData, vocabulary, fields: [] });

    if (!vocabulary) {
      setAvailableFields([]);
      return;
    }

    try {
      // Fetch a sample term to discover fields
      const params = new DrupalJsonApiParams()
        .addPageLimit(1)
        .addCustomParam({ jsonapi_include: 1 });
      const response = await client.getTaxonomyTerms(vocabulary, { params });

      // Handle full response object
      if (response && response.data && response.data.length > 0) {
        const sampleTerm = response.data[0];
        let fields = [];

        // Check for fields in attributes
        if (sampleTerm.attributes) {
          fields = Object.keys(sampleTerm.attributes);
        }

        // Also check for direct fields
        const directFields = Object.keys(sampleTerm).filter(key =>
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

    if (!formData.vocabulary) {
      setError('Please select a vocabulary');
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
        params.addFields(`taxonomy_term--${formData.vocabulary}`, formData.fields);
      }

      // Add jsonapi_include parameter
      params.addCustomParam({ jsonapi_include: 1 });

      const options = {
        params,
        lang: formData.language || undefined
      };

      const response = await client.getTaxonomyTerms(formData.vocabulary, options);
      onDataFetch(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVocabularyList = async () => {
    try {
      setIsLoading(true);
      const params = new DrupalJsonApiParams();
      params.addCustomParam({ jsonapi_include: 1 });
      const response = await client.getTaxonomyVocabularies({ params });
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
          <Tag size={18} />
          Explore Taxonomy
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="space-y-4">
          {/* Vocabulary Selection */}
          <div>
            <label className="label">Vocabulary *</label>
            <select
              className="select mt-1"
              value={formData.vocabulary}
              onChange={(e) => handleVocabularyChange(e.target.value)}
              required
            >
              <option value="">Select vocabulary...</option>
              {vocabularies.map((vocab) => {
                // Get the machine name (vid) - this is what the API expects
                const vid = vocab.drupal_internal__vid ||
                          vocab.attributes?.drupal_internal__vid ||
                          vocab.attributes?.vid ||
                          vocab.vid;

                // Skip if no valid vid found
                if (!vid) return null;

                const name = vocab.name ||
                            vocab.attributes?.name ||
                            vocab.attributes?.label ||
                            vid;
                return (
                  <option key={vocab.id || vid} value={vid}>
                    {name}
                  </option>
                );
              }).filter(Boolean)}
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
              <option value="name,ASC">Name (A-Z)</option>
              <option value="name,DESC">Name (Z-A)</option>
              <option value="weight,ASC">Weight (Ascending)</option>
              <option value="weight,DESC">Weight (Descending)</option>
              <option value="changed,DESC">Updated (Newest First)</option>
            </select>
          </div>

          {/* Include Relations */}
          <div>
            <label className="label">Include Relations</label>
            <input
              type="text"
              className="input mt-1"
              value={formData.includes}
              onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
              placeholder="parent,vid"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated field names
            </p>
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
            disabled={isLoading || !formData.vocabulary}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Loading...
              </>
            ) : (
              <>
                <Search className="mr-2" size={16} />
                Load Terms
              </>
            )}
          </button>

          <button
            type="button"
            onClick={loadVocabularyList}
            className="btn btn-secondary btn-md w-full"
            disabled={isLoading}
          >
            Load All Vocabularies
          </button>

          <button
            type="button"
            onClick={() => setShowCodeGenerator(true)}
            className="btn btn-outline btn-md w-full"
            disabled={!formData.vocabulary}
          >
            <Code className="mr-2" size={16} />
            Generate Code
          </button>
        </div>
      </form>

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGenerator
          code={generateTaxonomyCode(formData, client._config)}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}
    </div>
  );
}

export default TaxonomyExplorer;