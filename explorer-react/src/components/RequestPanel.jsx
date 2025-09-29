import React from 'react';
import { Globe, Clock, CheckCircle, XCircle, Copy } from 'lucide-react';
import clsx from 'clsx';

function RequestPanel({ requestInfo }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!requestInfo) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <h3 className="font-medium">Request & Response</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 min-h-0">
          <div className="text-center text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No requests made yet</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (!status) return 'text-muted-foreground';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    if (status >= 500) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <h3 className="font-medium">Request & Response</h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <div className="p-4 space-y-4">
          {/* Request Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">REQUEST</h4>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Method:</span>
                <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                  {requestInfo.method}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground w-16 mt-1">URL:</span>
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <code className="text-xs break-all bg-secondary p-2 rounded flex-1">
                      {requestInfo.url}
                    </code>
                    <button
                      onClick={() => copyToClipboard(requestInfo.url)}
                      className="btn btn-ghost btn-sm p-1"
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {requestInfo.headers && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-16 mt-1">Headers:</span>
                  <pre className="text-xs bg-secondary p-2 rounded flex-1 overflow-x-auto">
                    {JSON.stringify(requestInfo.headers, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Time:</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(requestInfo.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Response Info */}
          {requestInfo.status && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground">RESPONSE</h4>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Status:</span>
                  <span className={clsx('flex items-center gap-2', getStatusColor(requestInfo.status))}>
                    {requestInfo.status >= 200 && requestInfo.status < 300 ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    <span className="font-mono text-sm">
                      {requestInfo.status} {requestInfo.statusText}
                    </span>
                  </span>
                </div>

                {requestInfo.duration && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Duration:</span>
                    <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                      {requestInfo.duration}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestPanel;