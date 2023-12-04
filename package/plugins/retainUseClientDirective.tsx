import { Plugin } from 'vite';

function retainUseClientDirective(): Plugin {
  return {
    name: 'retain-use-client',
    transform(code, id) {
      if (id.endsWith('.jsx') || id.endsWith('.tsx')) {
        const lines = code.split('\n');
        const useClientLine = lines.findIndex(line => line.trim() === `'use client';`);
        if (useClientLine !== -1) {
          // Reinsert the 'use client' directive at the top of the file
          return {
            code: `'use client';\n` + code,
            map: null // If you need source mapping, you should generate a source map here
          };
        }
      }
      return null;
    },
  };
}

export default retainUseClientDirective;