import React, { useState, useMemo } from 'react';

export const ColumnFilterPopover = ({
  column,
  uniqueValues,
  activeFilter,
  onApplyFilter,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(
    activeFilter ? new Set(activeFilter) : new Set(uniqueValues)
  );

  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    return uniqueValues.filter(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  const toggleSelectAll = () => {
    if (selected.size === uniqueValues.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(uniqueValues));
    }
  };

  const toggleValue = (val) => {
    const next = new Set(selected);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    setSelected(next);
  };

  const handleApply = () => {
    if (selected.size === uniqueValues.length) {
      onApplyFilter(column.key, null); // no filter
    } else {
      onApplyFilter(column.key, Array.from(selected));
    }
    onClose();
  };

  const handleClear = () => {
    onApplyFilter(column.key, null);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-[#cbd5e1] p-3 z-50 text-xs text-[#1e293b] font-sans animate-in fade-in duration-100"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
        <span className="font-bold text-[12px] text-[#004B87] truncate">
          Filter: {column.label}
        </span>
        <button
          onClick={onClose}
          className="text-[#64748b] hover:text-[#0f172a] p-0.5 rounded cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <div className="mt-2 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search values..."
          className="w-full text-xs px-2.5 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded outline-none focus:ring-1 focus:ring-[#00B7F1]"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-[#004B87]">
        <button
          onClick={toggleSelectAll}
          className="hover:underline font-medium cursor-pointer"
        >
          {selected.size === uniqueValues.length ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-[#64748b]">{selected.size} of {uniqueValues.length} selected</span>
      </div>

      <div className="mt-2 max-h-40 overflow-y-auto divide-y divide-[#f1f5f9] border border-[#e2e8f0] rounded bg-white">
        {filteredValues.map((val) => (
          <label
            key={String(val)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#f8fafc] cursor-pointer text-xs"
          >
            <input
              type="checkbox"
              checked={selected.has(val)}
              onChange={() => toggleValue(val)}
              className="rounded text-[#004B87] focus:ring-0 cursor-pointer"
            />
            <span className="truncate">{val === '' || val === null ? '(Blanks)' : String(val)}</span>
          </label>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
        <button
          onClick={handleClear}
          className="px-2.5 py-1 rounded text-xs text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
        >
          Clear
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded text-xs text-[#475569] border border-[#cbd5e1] hover:bg-[#f8fafc] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1 rounded text-xs bg-[#004B87] text-white font-semibold hover:bg-[#003865] cursor-pointer shadow-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
