import React from 'react';
import {
  FileText,
  Tag,
  Menu,
  Image,
  Link,
  Database,
  Globe
} from 'lucide-react';
import clsx from 'clsx';

const entities = [
  { id: 'nodes', label: 'Nodes', icon: FileText, description: 'Content nodes' },
  { id: 'content-types', label: 'Content Types', icon: Database, description: 'Node types' },
  { id: 'taxonomy', label: 'Taxonomy', icon: Tag, description: 'Terms & vocabularies' },
  { id: 'menus', label: 'Menus', icon: Menu, description: 'Menu links' },
  { id: 'media', label: 'Media', icon: Image, description: 'Files & images' },
  { id: 'router', label: 'Router', icon: Link, description: 'URL aliases' },
  { id: 'spaces', label: 'Spaces', icon: Globe, description: 'NodeHive spaces' }
];

function Sidebar({ selectedEntity, onSelectEntity, isConnected }) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Entities
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {entities.map(entity => {
          const Icon = entity.icon;
          const isActive = selectedEntity === entity.id;
          const isDisabled = !isConnected;

          return (
            <button
              key={entity.id}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors group',
                {
                  'bg-primary text-primary-foreground': isActive && !isDisabled,
                  'hover:bg-secondary': !isActive && !isDisabled,
                  'opacity-50 cursor-not-allowed': isDisabled
                }
              )}
              onClick={() => !isDisabled && onSelectEntity(entity.id)}
              disabled={isDisabled}
            >
              <Icon
                className={clsx(
                  'flex-shrink-0',
                  isActive && !isDisabled ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
                size={18}
              />
              <div className="flex-1 min-w-0">
                <div className={clsx(
                  'text-sm font-medium',
                  isActive && !isDisabled ? 'text-primary-foreground' : 'text-foreground'
                )}>
                  {entity.label}
                </div>
                <div className={clsx(
                  'text-xs',
                  isActive && !isDisabled ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}>
                  {entity.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className={clsx(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;