import React, { useState } from 'react';
import { Settings, Loader2, Wifi, WifiOff, User, Lock, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

function ConnectionConfig({ onConnect, onDisconnect, isConnected, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    baseUrl: 'https://netnode.nodehive.app',
    language: '',
    timeout: 30000,
    debug: true,
    retryEnabled: true,
    retryAttempts: 3,
    authToken: '',
    useAuth: false,
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConnect(config);
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    onDisconnect();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'btn btn-md',
          isConnected ? 'btn-secondary' : 'btn-primary'
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={16} />
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <Wifi className="mr-2" size={16} />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="mr-2" size={16} />
            Connect
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md border border-border animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings size={20} />
                Connection Configuration
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="baseUrl" className="label">Base URL *</label>
                <input
                  id="baseUrl"
                  type="url"
                  className="input mt-1"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://your-site.nodehive.app"
                  required
                />
              </div>

              <div>
                <label htmlFor="language" className="label">Default Language</label>
                <input
                  id="language"
                  type="text"
                  className="input mt-1"
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  placeholder="en"
                />
              </div>

              <div>
                <label htmlFor="timeout" className="label">Timeout (ms)</label>
                <input
                  id="timeout"
                  type="number"
                  className="input mt-1"
                  value={config.timeout}
                  onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                  min="1000"
                  max="60000"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="debug"
                  type="checkbox"
                  className="rounded border-input"
                  checked={config.debug}
                  onChange={(e) => setConfig({ ...config, debug: e.target.checked })}
                />
                <label htmlFor="debug" className="text-sm">Enable Debug Mode</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="retryEnabled"
                  type="checkbox"
                  className="rounded border-input"
                  checked={config.retryEnabled}
                  onChange={(e) => setConfig({ ...config, retryEnabled: e.target.checked })}
                />
                <label htmlFor="retryEnabled" className="text-sm">Enable Auto Retry</label>
              </div>

              {config.retryEnabled && (
                <div>
                  <label htmlFor="retryAttempts" className="label">Max Retry Attempts</label>
                  <input
                    id="retryAttempts"
                    type="number"
                    className="input mt-1"
                    value={config.retryAttempts}
                    onChange={(e) => setConfig({ ...config, retryAttempts: parseInt(e.target.value) })}
                    min="1"
                    max="5"
                  />
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    id="useAuth"
                    type="checkbox"
                    className="rounded border-input"
                    checked={config.useAuth}
                    onChange={(e) => setConfig({ ...config, useAuth: e.target.checked })}
                  />
                  <label htmlFor="useAuth" className="text-sm font-medium">Use Authentication</label>
                </div>

                {config.useAuth && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="label flex items-center gap-2">
                        <User size={14} />
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        className="input mt-1"
                        value={config.username}
                        onChange={(e) => setConfig({ ...config, username: e.target.value })}
                        placeholder="Enter username"
                        autoComplete="username"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="label flex items-center gap-2">
                        <Lock size={14} />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          className="input mt-1 pr-10"
                          value={config.password}
                          onChange={(e) => setConfig({ ...config, password: e.target.value })}
                          placeholder="Enter password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>Or provide a Bearer token directly:</p>
                    </div>

                    <div>
                      <label htmlFor="authToken" className="label">Auth Token (Optional)</label>
                      <input
                        id="authToken"
                        type="text"
                        className="input mt-1"
                        value={config.authToken}
                        onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                        placeholder="Bearer token..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="btn btn-destructive btn-md flex-1"
                    >
                      Disconnect
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-md flex-1"
                    >
                      Reconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary btn-md w-full"
                  >
                    Connect
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ConnectionConfig;