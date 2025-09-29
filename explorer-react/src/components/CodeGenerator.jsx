import React, { useState } from 'react';
import { Code, Copy, X, Check } from 'lucide-react';
import clsx from 'clsx';

function CodeGenerator({ code, language = 'javascript', onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col border border-border animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code size={20} />
            Generated Code
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className={clsx(
                'btn btn-sm',
                copied ? 'btn-primary' : 'btn-secondary'
              )}
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Copy this code to your application to fetch the same data programmatically.
              Make sure to install the required dependencies:
            </p>
            <pre className="mt-2 bg-secondary p-3 rounded text-xs">
              <code>npm install nodehive-js drupal-jsonapi-params</code>
            </pre>
          </div>

          <div className="bg-secondary rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
              <code className={`language-${language}`}>{code}</code>
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Tips:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Replace the baseUrl with your environment-specific URL</li>
              <li>• Store sensitive tokens in environment variables</li>
              <li>• Add error handling for production use</li>
              <li>• Consider caching responses for better performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeGenerator;