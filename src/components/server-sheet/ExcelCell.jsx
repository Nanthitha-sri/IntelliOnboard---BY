import React, { useState, useEffect, useRef } from 'react';

export const ExcelCell = ({
  rowId,
  column,
  value,
  originalValue,
  isModified,
  canEdit,
  onChange,
  onStartEdit,
  onEndEdit,
  isEditing,
}) => {
  const [draftValue, setDraftValue] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    setDraftValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleCommit = () => {
    if (canEdit && draftValue !== value) {
      onChange(rowId, column.key, draftValue);
    }
    onEndEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraftValue(value ?? '');
      onEndEdit();
    }
  };

  // Status color badges
  const renderStatusBadge = (val) => {
    if (column.key === 'status') {
      const isAct = val === 'Active';
      const isInProg = val === 'In Progress';
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
            isAct
              ? 'bg-[#22C55E]/15 text-[#15803d]'
              : isInProg
              ? 'bg-[#F59E0B]/15 text-[#b45309]'
              : 'bg-[#94A3B8]/20 text-[#475569]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAct ? 'bg-[#22C55E]' : isInProg ? 'bg-[#F59E0B]' : 'bg-[#94A3B8]'
            }`}
          />
          {val || '—'}
        </span>
      );
    }

    if (column.key === 'environment') {
      const isProd = val === 'PROD';
      const isTest = val === 'TEST';
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
            isProd
              ? 'bg-[#22C55E]/15 text-[#15803d] border border-[#22C55E]/30'
              : isTest
              ? 'bg-[#2563EB]/15 text-[#1d4ed8] border border-[#2563EB]/30'
              : 'bg-[#F59E0B]/15 text-[#b45309] border border-[#F59E0B]/30'
          }`}
        >
          {val || '—'}
        </span>
      );
    }

    if (column.key === 'implementationType') {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#eff4ff] text-[#004B87] border border-[#d6e4ff]">
          {val || '—'}
        </span>
      );
    }

    return null;
  };

  // Editing UI
  if (isEditing && canEdit) {
    if (column.type === 'dropdown') {
      return (
        <div className="w-full h-full p-0.5 flex items-center bg-white">
          <select
            ref={inputRef}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className="w-full h-full text-xs bg-white border-2 border-[#00B7F1] outline-none rounded px-1.5 font-sans text-[#121c2a] shadow-inner"
          >
            {column.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="w-full h-full p-0.5 flex items-center bg-white">
        <input
          ref={inputRef}
          type="text"
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className={`w-full h-full text-xs bg-white border-2 border-[#00B7F1] outline-none rounded px-1.5 text-[#121c2a] shadow-inner ${
            column.isMonospace ? 'font-mono text-[11px]' : 'font-sans'
          }`}
        />
      </div>
    );
  }

  // Display UI
  const displayVal = value !== undefined && value !== null && value !== '' ? String(value) : '—';
  const isNa = displayVal.trim() === 'NA' || displayVal.trim() === '—';
  const isUrl = column.type === 'url' && !isNa && displayVal.startsWith('http');

  const customBadge = renderStatusBadge(displayVal);

  return (
    <div
      onClick={() => {
        if (canEdit) onStartEdit();
      }}
      title={
        isModified
          ? `Modified. Original: "${originalValue ?? ''}". Double-click to edit.`
          : canEdit
          ? 'Double-click to edit cell'
          : 'Read-only cell'
      }
      className={`relative group w-full h-full px-2.5 py-1.5 flex items-center justify-between text-xs transition-colors cursor-default ${
        canEdit ? 'hover:bg-[#EBF5FB] cursor-pointer' : 'cursor-default'
      } ${isModified ? 'bg-amber-50/70 text-amber-950 font-medium ring-1 ring-inset ring-amber-400/50' : ''}`}
    >
      {/* Dog-ear modified corner indicator (Excel style) */}
      {isModified && (
        <span
          className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-t-amber-500 border-l-[8px] border-l-transparent pointer-events-none z-10"
          title={`Modified. Original: ${originalValue}`}
        />
      )}

      {/* Cell Content */}
      <div className="flex-1 min-w-0 pr-1 truncate">
        {customBadge ? (
          customBadge
        ) : isUrl ? (
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`text-[#0284c7] hover:text-[#0369a1] hover:underline truncate font-mono text-[11px]`}
            >
              {displayVal}
            </span>
          </div>
        ) : (
          <span
            className={`truncate ${
              isNa
                ? 'text-[#94a3b8] italic text-[11px]'
                : column.isMonospace
                ? 'font-mono text-[11.5px] text-[#0f172a]'
                : 'text-[#1e293b]'
            }`}
          >
            {displayVal}
          </span>
        )}
      </div>

      {/* URL External Link Action */}
      {isUrl && (
        <a
          href={displayVal}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 text-[#0284c7] hover:text-[#004B87] p-0.5 rounded hover:bg-[#c2e8ff] transition-opacity cursor-pointer shrink-0"
          title="Open URL in new tab"
        >
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      )}

      {/* Edit pencil icon hint on hover when editable */}
      {canEdit && !isUrl && (
        <span className="opacity-0 group-hover:opacity-40 text-[#64748B] material-symbols-outlined text-[13px] shrink-0">
          edit
        </span>
      )}
    </div>
  );
};
