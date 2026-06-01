import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';
import { unwrapPublicApiEnvelope } from './public-api.js';

/**
 * Menu-related methods for NodeHiveClient
 */

/**
 * Get available menus (legacy method name)
 * @deprecated Use getMenus() instead
 */
export async function getAvailableMenus(client, options = {}) {
    return getMenus(client, options);
}

/**
 * Get all menus
 */
export async function getMenus(client, options = {}) {
    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    client._applyConfigToParams(params, 'menu');
    const queryString = client._buildQueryString(params);
    const includeParam = queryString ? '&jsonapi_include=1' : '?jsonapi_include=1';
    const endpoint = `/jsonapi/menu/menu${queryString ? '?' + queryString : ''}${includeParam}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get resolved menu items from JSON:API.
 *
 * Returns a flat list of renderable menu items. Nested relationships are
 * represented by each item's parent field.
 */
export async function getMenuItems(client, menuId, options = {}) {
    if (!menuId) {
        throw new ValidationError('Menu ID is required', 'menuId', menuId);
    }

    const { lang, ...requestOptions } = options;
    const endpoint = `/jsonapi/menu_items/${menuId}?jsonapi_include=1`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get raw Drupal menu link content entities.
 */
export async function getMenuLinkEntities(client, menuId, options = {}) {
    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    // Add menu filter if not already present
    if (menuId && !params.getQueryString().includes('menu_name')) {
        params.addFilter('menu_name', menuId);
    }

    client._applyConfigToParams(params, 'menu_link_content');
    const queryString = client._buildQueryString(params);
    const includeParam = queryString ? '&jsonapi_include=1' : '?jsonapi_include=1';
    const endpoint = `/jsonapi/menu_link_content/menu_link_content${queryString ? '?' + queryString : ''}${includeParam}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get menu links.
 * @deprecated Use getMenuItems() for renderable menu items or getMenuLinkEntities() for raw Drupal entities.
 */
export async function getMenuLinks(client, menuId, options = {}) {
    return getMenuLinkEntities(client, menuId, options);
}

/**
 * Get resolved menu items from JSON:API.
 * @deprecated Use getMenuItems() instead. This returns a flat list, not a nested tree.
 */
export async function getMenuTree(client, menuId, options = {}) {
    return getMenuItems(client, menuId, options);
}

/**
 * Get menu from NodeHive API v1
 * This uses the custom NodeHive menu endpoint that returns a simplified menu structure
 *
 * @param {string} menuId - The menu ID (e.g., '20jahre-main')
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Menu data with structure: { menu_id, language, items: [{ title, url, description, enabled, expanded, weight }] }
 */
export async function getMenu(client, menuId, options = {}) {
    if (!menuId) {
        throw new ValidationError('Menu ID is required', 'menuId', menuId);
    }

    const { lang, ...requestOptions } = options;
    const endpoint = `/nodehive-api/v1/menu/${menuId}`;

    const menu = unwrapPublicApiEnvelope(
        await client.request(endpoint, { lang, ...requestOptions })
    );

    if (menu && Array.isArray(menu.data) && !Array.isArray(menu.items)) {
        return {
            ...menu,
            items: menu.data,
        };
    }

    return menu;
}
