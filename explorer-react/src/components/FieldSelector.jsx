import React from 'react';
import clsx from 'clsx';

function FieldSelector({ fields, selectedFields, onChange, label = "Fields" }) {
  const commonFields = ['title', 'body', 'created', 'changed', 'status', 'path', 'langcode', 'name', 'description', 'weight'];

  const toggleField = (field) => {
    if (selectedFields.includes(field)) {
      onChange(selectedFields.filter(f => f !== field));
    } else {
      onChange([...selectedFields, field]);
    }
  };

  const selectAll = () => {
    onChange([...fields]);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label">{label}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-primary hover:text-primary/80"
          >
            Select All
          </button>
          <span className="text-xs text-muted-foreground">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-primary hover:text-primary/80"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="border border-border rounded-md p-3 bg-secondary/20 max-h-48 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-2 gap-2">
          {fields.map(field => {
            const isCommon = commonFields.includes(field);
            const isSelected = selectedFields.includes(field);

            return (
              <label
                key={field}
                className={clsx(
                  'flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors',
                  'hover:bg-secondary',
                  isSelected && 'bg-primary/10'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleField(field)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span className={clsx(
                  'text-sm',
                  isCommon ? 'font-medium' : 'font-normal',
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {field}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-1">
        {selectedFields.length > 0
          ? `${selectedFields.length} field${selectedFields.length !== 1 ? 's' : ''} selected`
          : 'All fields will be returned'}
      </p>
    </div>
  );
}

export default FieldSelector;