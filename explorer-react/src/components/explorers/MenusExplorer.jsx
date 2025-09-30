import React, { useState, useEffect } from 'react';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { Menu, Loader2, Search, List, Code } from 'lucide-react';
import FieldSelector from '../FieldSelector';
import CodeGenerator from '../CodeGenerator';
import { generateMenuCode } from '../../utils/codeGenerator';

function MenusExplorer({ client, onDataFetch, isLoading, setIsLoading, setError }) {
  const [menus, setMenus] = useState([]);
  const [formData, setFormData] = useState({
    menuId: '',
    language: '',
    depth: 0,
    includeLinks: true,
    fields: []
  });
  const [availableFields, setAvailableFields] = useState([]);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);

  useEffect(() => {
    loadAvailableMenus();
  }, [client]);

  const loadAvailableMenus = async () => {
    try {
      // Add jsonapi_include=1 to get drupal_internal__id
      const params = new DrupalJsonApiParams();
      params.addCustomParam({ jsonapi_include: 1 });
      const response = await client.getMenus({ params });
      if (response && response.data) {
        setMenus(response.data);
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
      // Add common menu fallbacks
      setMenus([
        { drupal_internal__id: 'main', label: 'Main navigation' },
        { drupal_internal__id: 'footer', label: 'Footer' },
        { drupal_internal__id: 'account', label: 'User account menu' },
        { drupal_internal__id: 'admin', label: 'Administration' },
        { drupal_internal__id: 'tools', label: 'Tools' }
      ]);
    }
  };

  const handleMenuChange = async (menuId) => {
    setFormData({ ...formData, menuId, fields: [] });

    if (!menuId) {
      setAvailableFields([]);
      return;
    }

    try {
      // Try to fetch sample menu links to discover fields
      const params = new DrupalJsonApiParams().addPageLimit(1);
      const response = await client.getMenuLinks(menuId, { params });

      if (response.data && response.data.length > 0) {
        const sampleLink = response.data[0];
        let fields = [];

        // Check for fields in attributes
        if (sampleLink.attributes) {
          fields = Object.keys(sampleLink.attributes);
        }

        // Also check for direct fields
        const directFields = Object.keys(sampleLink).filter(key =>
          !['id', 'type', 'links', 'relationships', 'attributes', 'meta'].includes(key)
        );

        // Combine and deduplicate
        const allFields = [...new Set([...fields, ...directFields])].sort();
        setAvailableFields(allFields);
      }
    } catch (error) {
      console.error('Failed to fetch menu fields:', error);
      // Provide common menu link fields as fallback
      setAvailableFields([
        'title', 'description', 'url', 'weight', 'enabled',
        'expanded', 'parent', 'menu_name', 'bundle', 'langcode'
      ]);
    }
  };

  const handleLoadMenuLinks = async (e) => {
    e.preventDefault();

    if (!formData.menuId) {
      setError('Please select a menu');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new DrupalJsonApiParams();

      // Menu filtering is handled by the endpoint itself (/jsonapi/menu_items/{menuId})
      // No need to add filter params

      // Add depth filter if specified
      if (formData.depth > 0) {
        params.addFilter('depth', formData.depth, '<=');
      }

      // Sort by weight and title
      params.addSort('weight', 'ASC');
      params.addSort('title', 'ASC');

      // Add fields if selected
      if (formData.fields.length > 0) {
        params.addFields(`menu_link_content--${formData.menuId}`, formData.fields);
      }

      const options = {
        params,
        lang: formData.language || undefined
      };

      // Use the menu_items endpoint with the machine name from drupal_internal__id
      const endpoint = `/jsonapi/menu_items/${formData.menuId}`;
      const queryString = params.getQueryString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}&jsonapi_include=1` : `${endpoint}?jsonapi_include=1`;
      const response = await client.request(fullEndpoint, { lang: options.lang });
      onDataFetch(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLoadAllMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getMenus();
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
          <Menu size={18} />
          Explore Menus
        </h3>
      </div>

      <form onSubmit={handleLoadMenuLinks} className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="space-y-4">
          {/* Menu Selection */}
          <div>
            <label className="label">Menu *</label>
            <select
              className="select mt-1"
              value={formData.menuId}
              onChange={(e) => handleMenuChange(e.target.value)}
              required
            >
              <option value="">Select menu...</option>
              {menus.map((menu) => {
                // Use drupal_internal__id as the machine name for the menu_items endpoint
                const machineName = menu.drupal_internal__id;
                const name = menu.label ||
                            menu.attributes?.label ||
                            menu.name ||
                            'Unnamed Menu';

                // Skip menus without machine names
                if (!machineName) return null;

                return (
                  <option key={menu.id} value={machineName}>
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

          {/* Depth */}
          <div>
            <label className="label">Max Depth</label>
            <input
              type="number"
              className="input mt-1"
              value={formData.depth}
              onChange={(e) => setFormData({ ...formData, depth: parseInt(e.target.value) })}
              min="0"
              max="9"
              placeholder="0 for unlimited"
            />
            <p className="text-xs text-muted-foreground mt-1">
              0 = unlimited, 1 = top level only, etc.
            </p>
          </div>

          {/* Include Options */}
          <div className="flex items-center gap-2">
            <input
              id="includeLinks"
              type="checkbox"
              className="rounded border-input text-primary focus:ring-primary"
              checked={formData.includeLinks}
              onChange={(e) => setFormData({ ...formData, includeLinks: e.target.checked })}
            />
            <label htmlFor="includeLinks" className="text-sm">
              Include menu link details
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
            <h4 className="text-sm font-medium mb-2">Menu Structure</h4>
            <p className="text-xs text-muted-foreground">
              Menus organize your site's navigation. Each menu contains links that can be
              nested in a hierarchical structure. Use the depth parameter to control how
              many levels to retrieve.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-card pt-4 mt-6 border-t border-border space-y-2">
          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={isLoading || !formData.menuId}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Loading...
              </>
            ) : (
              <>
                <List className="mr-2" size={16} />
                Load Menu Links
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLoadAllMenus}
            className="btn btn-outline btn-md w-full"
            disabled={isLoading}
          >
            Load All Menus
          </button>

          <button
            type="button"
            onClick={() => setShowCodeGenerator(true)}
            className="btn btn-secondary btn-md w-full"
            disabled={!formData.menuId}
          >
            <Code className="mr-2" size={16} />
            Generate Code
          </button>
        </div>
      </form>

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGenerator
          code={generateMenuCode(formData, client._config)}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}
    </div>
  );
}

export default MenusExplorer;