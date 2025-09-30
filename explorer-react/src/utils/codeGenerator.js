export function generateNodeCode(formData, clientConfig = {}) {
  const code = [];

  // Import statements
  code.push(`import { NodeHiveClient } from 'nodehive-js';`);
  code.push(`import { DrupalJsonApiParams } from 'drupal-jsonapi-params';`);
  code.push('');

  // Function definition
  code.push(`async function fetchNodes() {`);
  code.push(`  // Initialize the client`);
  code.push(`  const client = new NodeHiveClient({`);
  code.push(`    baseUrl: '${clientConfig.baseUrl || 'https://your-site.nodehive.app'}',`);

  if (clientConfig.language) {
    code.push(`    defaultLanguage: '${clientConfig.language}',`);
  }
  if (clientConfig.timeout) {
    code.push(`    timeout: ${clientConfig.timeout},`);
  }
  if (clientConfig.debug !== undefined) {
    code.push(`    debug: ${clientConfig.debug},`);
  }
  if (clientConfig.authToken) {
    code.push(`    auth: {`);
    code.push(`      token: process.env.AUTH_TOKEN || '${clientConfig.authToken}'`);
    code.push(`    },`);
  }
  if (clientConfig.retryEnabled) {
    code.push(`    retry: {`);
    code.push(`      enabled: true,`);
    code.push(`      maxAttempts: ${clientConfig.retryAttempts || 3},`);
    code.push(`      delay: 1000`);
    code.push(`    }`);
  }
  code.push(`  });`);
  code.push('');

  // Build params
  code.push(`  // Build query parameters`);
  code.push(`  const params = new DrupalJsonApiParams();`);

  if (formData.limit) {
    code.push(`  params.addPageLimit(${formData.limit});`);
  }

  if (formData.sort) {
    const [field, direction] = formData.sort.split(',');
    code.push(`  params.addSort('${field}', '${direction}');`);
  }

  if (formData.includes) {
    const includes = formData.includes.split(',').map(i => `'${i.trim()}'`).join(', ');
    code.push(`  params.addInclude([${includes}]);`);
  }

  if (formData.fields && formData.fields.length > 0) {
    const fields = formData.fields.map(f => `'${f}'`).join(', ');
    code.push(`  params.addFields('node--${formData.contentType}', [${fields}]);`);
  }

  code.push('');

  // Make the request
  code.push(`  // Fetch the data`);
  code.push(`  try {`);

  const optionsArr = [];
  if (formData.language) {
    optionsArr.push(`lang: '${formData.language}'`);
  }
  optionsArr.push('params');

  code.push(`    const response = await client.getNodes('${formData.contentType}', {`);
  optionsArr.forEach((opt, index) => {
    code.push(`      ${opt}${index < optionsArr.length - 1 ? ',' : ''}`);
  });
  code.push(`    });`);
  code.push('');
  code.push(`    console.log('Fetched nodes:', response.data);`);
  code.push(`    return response;`);
  code.push(`  } catch (error) {`);
  code.push(`    console.error('Failed to fetch nodes:', error);`);
  code.push(`    throw error;`);
  code.push(`  }`);
  code.push(`}`);
  code.push('');
  code.push('// Call the function');
  code.push('fetchNodes();');

  return code.join('\n');
}

export function generateTaxonomyCode(formData, clientConfig = {}) {
  const code = [];

  // Import statements
  code.push(`import { NodeHiveClient } from 'nodehive-js';`);
  code.push(`import { DrupalJsonApiParams } from 'drupal-jsonapi-params';`);
  code.push('');

  // Function definition
  code.push(`async function fetchTaxonomyTerms() {`);
  code.push(`  // Initialize the client`);
  code.push(`  const client = new NodeHiveClient({`);
  code.push(`    baseUrl: '${clientConfig.baseUrl || 'https://your-site.nodehive.app'}',`);

  if (clientConfig.debug !== undefined) {
    code.push(`    debug: ${clientConfig.debug},`);
  }
  if (clientConfig.authToken) {
    code.push(`    auth: {`);
    code.push(`      token: process.env.AUTH_TOKEN || '${clientConfig.authToken}'`);
    code.push(`    }`);
  }
  code.push(`  });`);
  code.push('');

  // Build params
  code.push(`  // Build query parameters`);
  code.push(`  const params = new DrupalJsonApiParams();`);

  if (formData.limit) {
    code.push(`  params.addPageLimit(${formData.limit});`);
  }

  if (formData.sort) {
    const [field, direction] = formData.sort.split(',');
    code.push(`  params.addSort('${field}', '${direction}');`);
  }

  if (formData.includes) {
    const includes = formData.includes.split(',').map(i => `'${i.trim()}'`).join(', ');
    code.push(`  params.addInclude([${includes}]);`);
  }

  if (formData.fields && formData.fields.length > 0) {
    const fields = formData.fields.map(f => `'${f}'`).join(', ');
    code.push(`  params.addFields('taxonomy_term--${formData.vocabulary}', [${fields}]);`);
  }

  code.push('');

  // Make the request
  code.push(`  // Fetch the data`);
  code.push(`  try {`);

  const optionsArr = [];
  if (formData.language) {
    optionsArr.push(`lang: '${formData.language}'`);
  }
  optionsArr.push('params');

  code.push(`    const response = await client.getTaxonomyTerms('${formData.vocabulary}', {`);
  optionsArr.forEach((opt, index) => {
    code.push(`      ${opt}${index < optionsArr.length - 1 ? ',' : ''}`);
  });
  code.push(`    });`);
  code.push('');
  code.push(`    console.log('Fetched taxonomy terms:', response.data);`);
  code.push(`    return response;`);
  code.push(`  } catch (error) {`);
  code.push(`    console.error('Failed to fetch taxonomy terms:', error);`);
  code.push(`    throw error;`);
  code.push(`  }`);
  code.push(`}`);
  code.push('');
  code.push('// Call the function');
  code.push('fetchTaxonomyTerms();');

  return code.join('\n');
}

export function generateMenuCode(formData, clientConfig = {}) {
  const code = [];

  // Import statements
  code.push(`import { NodeHiveClient } from 'nodehive-js';`);
  code.push(`import { DrupalJsonApiParams } from 'drupal-jsonapi-params';`);
  code.push('');

  // Function definition
  code.push(`async function fetchMenuLinks() {`);
  code.push(`  // Initialize the client`);
  code.push(`  const client = new NodeHiveClient({`);
  code.push(`    baseUrl: '${clientConfig.baseUrl || 'https://your-site.nodehive.app'}',`);

  if (clientConfig.debug !== undefined) {
    code.push(`    debug: ${clientConfig.debug},`);
  }
  if (clientConfig.authToken) {
    code.push(`    auth: {`);
    code.push(`      token: process.env.AUTH_TOKEN || '${clientConfig.authToken}'`);
    code.push(`    }`);
  }
  code.push(`  });`);
  code.push('');

  // Build params
  code.push(`  // Build query parameters`);
  code.push(`  const params = new DrupalJsonApiParams();`);
  code.push(`  params.addFilter('menu_name', '${formData.menuId}');`);

  if (formData.depth > 0) {
    code.push(`  params.addFilter('depth', ${formData.depth}, '<=');`);
  }

  code.push(`  params.addSort('weight', 'ASC');`);
  code.push(`  params.addSort('title', 'ASC');`);

  if (formData.fields && formData.fields.length > 0) {
    const fields = formData.fields.map(f => `'${f}'`).join(', ');
    code.push(`  params.addFields('menu_link_content--${formData.menuId}', [${fields}]);`);
  }

  code.push('');

  // Make the request
  code.push(`  // Fetch the data`);
  code.push(`  try {`);

  const optionsArr = [];
  if (formData.language) {
    optionsArr.push(`lang: '${formData.language}'`);
  }
  optionsArr.push('params');

  code.push(`    const response = await client.getMenuLinks('${formData.menuId}', {`);
  optionsArr.forEach((opt, index) => {
    code.push(`      ${opt}${index < optionsArr.length - 1 ? ',' : ''}`);
  });
  code.push(`    });`);
  code.push('');
  code.push(`    console.log('Fetched menu links:', response.data);`);
  code.push(`    return response;`);
  code.push(`  } catch (error) {`);
  code.push(`    console.error('Failed to fetch menu links:', error);`);
  code.push(`    throw error;`);
  code.push(`  }`);
  code.push(`}`);
  code.push('');
  code.push('// Call the function');
  code.push('fetchMenuLinks();');

  return code.join('\n');
}

export function generateContentTypesCode(clientConfig = {}) {
  const code = [];

  // Import statements
  code.push(`import { NodeHiveClient } from 'nodehive-js';`);
  code.push('');

  // Function definition
  code.push(`async function fetchContentTypes() {`);
  code.push(`  // Initialize the client`);
  code.push(`  const client = new NodeHiveClient({`);
  code.push(`    baseUrl: '${clientConfig.baseUrl || 'https://your-site.nodehive.app'}',`);

  if (clientConfig.debug !== undefined) {
    code.push(`    debug: ${clientConfig.debug},`);
  }
  if (clientConfig.authToken) {
    code.push(`    auth: {`);
    code.push(`      token: process.env.AUTH_TOKEN || '${clientConfig.authToken}'`);
    code.push(`    }`);
  }
  code.push(`  });`);
  code.push('');

  // Make the request
  code.push(`  // Fetch the data`);
  code.push(`  try {`);
  code.push(`    const response = await client.getContentTypes();`);
  code.push('');
  code.push(`    console.log('Fetched content types:', response.data);`);
  code.push(`    return response;`);
  code.push(`  } catch (error) {`);
  code.push(`    console.error('Failed to fetch content types:', error);`);
  code.push(`    throw error;`);
  code.push(`  }`);
  code.push(`}`);
  code.push('');
  code.push('// Call the function');
  code.push('fetchContentTypes();');

  return code.join('\n');
}

export function generateRouterCode(formData, clientConfig = {}) {
  const code = [];

  // Import statements
  code.push(`import { NodeHiveClient } from 'nodehive-js';`);
  if (formData.method === 'getPathAliases' || formData.method === 'getRedirects') {
    code.push(`import { DrupalJsonApiParams } from 'drupal-jsonapi-params';`);
  }
  code.push('');

  // Function definition
  const functionName = formData.method === 'getRouteByPath' ? 'getRoute' :
                       formData.method === 'translatePath' ? 'translatePath' :
                       formData.method === 'getPathAliases' ? 'getPathAliases' :
                       'getRedirects';

  code.push(`async function ${functionName}() {`);
  code.push(`  // Initialize the client`);
  code.push(`  const client = new NodeHiveClient({`);
  code.push(`    baseUrl: '${clientConfig.baseUrl || 'https://your-site.nodehive.app'}',`);

  if (clientConfig.debug !== undefined) {
    code.push(`    debug: ${clientConfig.debug},`);
  }
  if (clientConfig.authToken) {
    code.push(`    auth: {`);
    code.push(`      token: process.env.AUTH_TOKEN || '${clientConfig.authToken}'`);
    code.push(`    }`);
  }
  code.push(`  });`);
  code.push('');

  // Build params if needed
  if (formData.method === 'getPathAliases' || formData.method === 'getRedirects') {
    code.push(`  // Build query parameters`);
    code.push(`  const params = new DrupalJsonApiParams();`);
    code.push(`  params.addPageLimit(50);`);

    if (formData.method === 'getPathAliases') {
      code.push(`  params.addSort('alias', 'ASC');`);
    } else {
      code.push(`  params.addSort('status_code', 'ASC');`);
    }
    code.push('');
  }

  // Make the request
  code.push(`  // Fetch the data`);
  code.push(`  try {`);

  if (formData.method === 'getRouteByPath') {
    const lang = formData.language ? `, '${formData.language}'` : '';
    code.push(`    const response = await client.getRouteByPath('${formData.path || '/example-path'}'${lang});`);
  } else if (formData.method === 'translatePath') {
    const lang = formData.language ? `, '${formData.language}'` : '';
    code.push(`    const response = await client.translatePath('${formData.path || '/example-path'}'${lang});`);
  } else if (formData.method === 'getPathAliases') {
    const optionsArr = [];
    if (formData.language) {
      optionsArr.push(`lang: '${formData.language}'`);
    }
    optionsArr.push('params');

    code.push(`    const response = await client.getPathAliases({`);
    optionsArr.forEach((opt, index) => {
      code.push(`      ${opt}${index < optionsArr.length - 1 ? ',' : ''}`);
    });
    code.push(`    });`);
  } else if (formData.method === 'getRedirects') {
    const optionsArr = [];
    if (formData.language) {
      optionsArr.push(`lang: '${formData.language}'`);
    }
    optionsArr.push('params');

    code.push(`    const response = await client.getRedirects({`);
    optionsArr.forEach((opt, index) => {
      code.push(`      ${opt}${index < optionsArr.length - 1 ? ',' : ''}`);
    });
    code.push(`    });`);
  }

  code.push('');
  code.push(`    console.log('Response:', response);`);
  code.push(`    return response;`);
  code.push(`  } catch (error) {`);
  code.push(`    console.error('Failed to fetch route data:', error);`);
  code.push(`    throw error;`);
  code.push(`  }`);
  code.push(`}`);
  code.push('');
  code.push(`// Call the function`);
  code.push(`${functionName}();`);

  return code.join('\n');
}

export function generateMediaCode(formData, clientConfig = {}) {
  const code = [];

  // Import statements
  code.push(`import { NodeHiveClient } from 'nodehive-js';`);
  code.push(`import { DrupalJsonApiParams } from 'drupal-jsonapi-params';`);
  code.push('');

  // Function definition
  code.push(`async function fetchMedia() {`);
  code.push(`  // Initialize the client`);
  code.push(`  const client = new NodeHiveClient({`);
  code.push(`    baseUrl: '${clientConfig.baseUrl || 'https://your-site.nodehive.app'}',`);

  if (clientConfig.debug !== undefined) {
    code.push(`    debug: ${clientConfig.debug},`);
  }
  if (clientConfig.authToken) {
    code.push(`    auth: {`);
    code.push(`      token: process.env.AUTH_TOKEN || '${clientConfig.authToken}'`);
    code.push(`    }`);
  }
  code.push(`  });`);
  code.push('');

  // Build params
  code.push(`  // Build query parameters`);
  code.push(`  const params = new DrupalJsonApiParams();`);
  code.push(`  params.addPageLimit(${formData.limit});`);
  code.push('');

  // Make the request
  code.push(`  // Fetch the data`);
  code.push(`  try {`);

  const optionsArr = [];
  if (formData.language) {
    optionsArr.push(`lang: '${formData.language}'`);
  }
  optionsArr.push('params');

  code.push(`    const response = await client.getMediaList('${formData.mediaType}', {`);
  optionsArr.forEach((opt, index) => {
    code.push(`      ${opt}${index < optionsArr.length - 1 ? ',' : ''}`);
  });
  code.push(`    });`);
  code.push('');
  code.push(`    console.log('Fetched media:', response.data);`);
  code.push(`    return response;`);
  code.push(`  } catch (error) {`);
  code.push(`    console.error('Failed to fetch media:', error);`);
  code.push(`    throw error;`);
  code.push(`  }`);
  code.push(`}`);
  code.push('');
  code.push('// Call the function');
  code.push('fetchMedia();');

  return code.join('\n');
}

export function generateSpacesCode(formData, clientConfig) {
  const code = [];

  // Import statements
  code.push(`import { NodeHiveClient } from 'nodehive-js';`);
  code.push(`import { DrupalJsonApiParams } from 'drupal-jsonapi-params';`);
  code.push('');

  // Function definition
  code.push(`async function fetchNodeHiveSpaces() {`);
  code.push(`  // Initialize the client`);
  code.push(`  const client = new NodeHiveClient({`);
  code.push(`    baseUrl: '${clientConfig.baseUrl || 'https://your-site.nodehive.app'}',`);

  if (clientConfig.debug !== undefined) {
    code.push(`    debug: ${clientConfig.debug},`);
  }

  code.push(`    auth: {`);
  code.push(`      token: process.env.AUTH_TOKEN || 'YOUR_AUTH_TOKEN' // Required for spaces`);
  code.push(`    }`);
  code.push(`  });`);
  code.push('');

  // Build params
  code.push(`  // Build the API parameters`);
  code.push(`  const params = new DrupalJsonApiParams();`);
  code.push(`  params.addCustomParam({ jsonapi_include: 1 });`);

  if (formData.spaceId) {
    code.push(`  params.addFilter('drupal_internal__id', '${formData.spaceId}');`);
  }

  if (formData.limit) {
    code.push(`  params.addPageLimit(${formData.limit});`);
  }

  if (formData.fields.length > 0) {
    code.push(`  params.addFields('nodehive_space--nodehive_space', [${formData.fields.map(f => `'${f}'`).join(', ')}]);`);
  }

  if (formData.includeRelationships) {
    code.push(`  params.addInclude(['field_space_owner', 'field_space_type']);`);
  }

  code.push(`  params.addSort('created', 'DESC');`);
  code.push('');

  // Make the request
  code.push(`  // Fetch the data (requires admin authentication)`);
  code.push(`  try {`);
  code.push(`    const endpoint = '/jsonapi/nodehive_space/nodehive_space';`);
  code.push(`    const queryString = params.getQueryString();`);
  code.push(`    const fullEndpoint = queryString ? \`\${endpoint}?\${queryString}\` : endpoint;`);
  code.push('');
  code.push(`    const response = await client.request(fullEndpoint${formData.language ? `, { lang: '${formData.language}' }` : ''});`);
  code.push('');
  code.push(`    console.log('Fetched NodeHive spaces:', response.data);`);
  code.push(`    return response;`);
  code.push(`  } catch (error) {`);
  code.push(`    if (error.message.includes('403')) {`);
  code.push(`      console.error('Access denied. Admin privileges required.');`);
  code.push(`    }`);
  code.push(`    console.error('Error fetching spaces:', error);`);
  code.push(`    throw error;`);
  code.push(`  }`);
  code.push(`}`);
  code.push('');
  code.push('// Call the function');
  code.push('fetchNodeHiveSpaces();');

  return code.join('\n');
}