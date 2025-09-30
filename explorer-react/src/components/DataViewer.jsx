import React, { useState } from 'react';
import { Database, Copy, ChevronRight, ChevronDown, Eye, Code } from 'lucide-react';
import clsx from 'clsx';

function DataViewer({ data }) {
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' or 'raw'
  const [expandedItems, setExpandedItems] = useState(new Set(['root'])); // Start with root expanded

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const toggleExpanded = (path) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  };

  const renderValue = (value, path = '') => {
    if (value === null) return <span className="text-muted-foreground">null</span>;
    if (value === undefined) return <span className="text-muted-foreground">undefined</span>;

    if (typeof value === 'boolean') {
      return <span className="text-blue-400">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-400">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-yellow-400">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedItems.has(path);
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="inline-flex items-center gap-1 hover:bg-secondary rounded px-1 -ml-1"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="text-muted-foreground">Array[{value.length}]</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {value.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs mt-0.5">{index}:</span>
                  <div className="flex-1">{renderValue(item, `${path}.${index}`)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const isExpanded = expandedItems.has(path);
      const keys = Object.keys(value);
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="inline-flex items-center gap-1 hover:bg-secondary rounded px-1 -ml-1"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="text-muted-foreground">Object{`{${keys.length}}`}</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {keys.map((key) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-cyan-400 text-sm">{key}:</span>
                  <div className="flex-1">{renderValue(value[key], `${path}.${key}`)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="text-muted-foreground">{String(value)}</span>;
  };

  if (!data) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <h3 className="font-medium">Response Data</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 min-h-0">
          <div className="text-center text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No data to display</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <h3 className="font-medium">Response Data</h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border">
            <button
              onClick={() => setViewMode('formatted')}
              className={clsx(
                'px-3 py-1 text-xs font-medium transition-colors',
                viewMode === 'formatted'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="inline-block w-3 h-3 mr-1" />
              Formatted
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={clsx(
                'px-3 py-1 text-xs font-medium transition-colors',
                viewMode === 'raw'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Code className="inline-block w-3 h-3 mr-1" />
              Raw
            </button>
          </div>
          <button
            onClick={copyToClipboard}
            className="btn btn-ghost btn-sm"
            title="Copy JSON"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin p-4 min-h-0">
        {viewMode === 'raw' ? (
          <pre className="text-xs bg-secondary p-4 rounded overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="font-mono text-sm">
            {renderValue(data, 'root')}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataViewer;