import React, { useState, useMemo, useRef } from 'react';
import { SHEET_GROUPS, SHEET_COLUMNS } from './columnDefinitions.js';
import { ExcelCell } from './ExcelCell.jsx';

export const VerticalSheetTable = ({
  displayedRows,
  allRows,
  selectedRowIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onAddRow,
  onDeleteRow,
  modifiedCells,
  editingCell,
  onStartEdit,
  onEndEdit,
  onCellChange,
  canEditRow,
  isReadOnly,
}) => {
  // Collapsed state for groups: Set of group IDs that are collapsed
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // Filter text specifically for fields/rows
  const [fieldSearch, setFieldSearch] = useState('');

  // Highlight differences toggle
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  // Column width for the specification fields (left column)
  const [specColWidth, setSpecColWidth] = useState(320);

  // Widths for each displayed record column (key: rowId, value: width)
  const [envColWidths, setEnvColWidths] = useState({});

  // Resizing state
  const handleSpecColResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const initialWidth = specColWidth;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      setSpecColWidth(Math.max(220, initialWidth + delta));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleEnvColResize = (rowId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const initialWidth = envColWidths[rowId] || 280;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      setEnvColWidths((prev) => ({
        ...prev,
        [rowId]: Math.max(200, initialWidth + delta),
      }));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Toggle single group collapse
  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Expand all groups
  const expandAll = () => setCollapsedGroups(new Set());

  // Collapse all groups
  const collapseAll = () => {
    setCollapsedGroups(new Set(SHEET_GROUPS.map((g) => g.id)));
  };

  // Group columns by their group definition
  const columnsByGroup = useMemo(() => {
    const map = {};
    SHEET_GROUPS.forEach((g) => {
      map[g.id] = [];
    });
    SHEET_COLUMNS.forEach((col) => {
      if (map[col.group]) {
        map[col.group].push(col);
      } else {
        // Fallback to group-1
        if (!map['group-1']) map['group-1'] = [];
        map['group-1'].push(col);
      }
    });
    return map;
  }, []);

  // Filter columns based on fieldSearch query
  const filteredColumnsByGroup = useMemo(() => {
    if (!fieldSearch.trim()) return columnsByGroup;
    const q = fieldSearch.toLowerCase().trim();
    const res = {};
    SHEET_GROUPS.forEach((g) => {
      res[g.id] = (columnsByGroup[g.id] || []).filter((col) => {
        return (
          col.label.toLowerCase().includes(q) ||
          col.key.toLowerCase().includes(q) ||
          g.name.toLowerCase().includes(q)
        );
      });
    });
    return res;
  }, [columnsByGroup, fieldSearch]);

  // Check if a field's values differ across the displayed rows
  const hasDifferenceAcrossEnvs = (colKey) => {
    if (displayedRows.length <= 1) return false;
    const firstVal = displayedRows[0][colKey];
    for (let i = 1; i < displayedRows.length; i++) {
      if (displayedRows[i][colKey] !== firstVal) return true;
    }
    return false;
  };

  // Badge styling for environments
  const getEnvBadge = (env) => {
    switch (env) {
      case 'PROD':
        return 'bg-[#15803D] text-white border-green-700';
      case 'TEST':
        return 'bg-[#1D4ED8] text-white border-blue-700';
      case 'DEV':
        return 'bg-[#B45309] text-white border-amber-700';
      default:
        return 'bg-[#004B87] text-white border-[#003865]';
    }
  };

  // Total width of table
  const totalTableWidth = useMemo(() => {
    const envColsWidth = displayedRows.reduce(
      (sum, r) => sum + (envColWidths[r.id] || 280),
      0
    );
    // Add 160px for the "+ Add Env" end column if not read only
    const endColWidth = isReadOnly ? 0 : 140;
    return specColWidth + envColsWidth + endColWidth;
  }, [displayedRows, envColWidths, specColWidth, isReadOnly]);

  // Total matching fields count
  const matchingFieldsCount = useMemo(() => {
    let count = 0;
    Object.values(filteredColumnsByGroup).forEach((cols) => {
      count += cols.length;
    });
    return count;
  }, [filteredColumnsByGroup]);

  return (
    <div className="w-full h-full flex flex-col bg-white select-text">
      {/* ==========================================
          VERTICAL MATRIX SUB-HEADER / CONTROLS
          ========================================== */}
      <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Quick Field Search within Vertical Matrix */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-[#94A3B8] text-[16px]">
              filter_list
            </span>
            <input
              type="text"
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Filter 41 specification attributes..."
              className="w-full pl-8 pr-7 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:ring-1 focus:ring-[#00B7F1]"
            />
            {fieldSearch && (
              <button
                onClick={() => setFieldSearch('')}
                className="absolute right-2 top-1.5 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#64748B] whitespace-nowrap">
            {matchingFieldsCount} of {SHEET_COLUMNS.length} fields
          </span>
        </div>

        {/* Right: Group Expand/Collapse & Compare Highlights */}
        <div className="flex items-center gap-3">
          {/* Highlight Differences Toggle */}
          <button
            onClick={() => setHighlightDiffs((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer border ${
              highlightDiffs
                ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-[#475569] hover:text-[#0F172A] border-[#CBD5E1]'
            }`}
            title="Highlight fields where values differ between environments (e.g. DEV vs TEST vs PROD)"
          >
            <span className="material-symbols-outlined text-[15px]">
              {highlightDiffs ? 'compare_arrows' : 'difference'}
            </span>
            <span>Highlight Diffs</span>
            {highlightDiffs && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Group Expand / Collapse buttons */}
          <div className="flex items-center border border-[#CBD5E1] rounded bg-white overflow-hidden">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 hover:bg-[#F1F5F9] text-[#475569] font-medium border-r border-[#CBD5E1] transition-colors cursor-pointer"
              title="Expand all 7 sections"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 hover:bg-[#F1F5F9] text-[#475569] font-medium transition-colors cursor-pointer"
              title="Collapse all 7 sections"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          VERTICAL SPREADSHEET TABLE
          ========================================== */}
      <div className="flex-1 w-full overflow-auto relative">
        <table
          style={{ width: `${totalTableWidth}px` }}
          className="table-fixed border-collapse text-left border-b border-r border-[#CBD5E1]"
        >
          {/* Top Sticky Header: Environment Columns */}
          <thead className="sticky top-0 z-30 shadow-xs">
            <tr className="h-14 select-none bg-[#002D54] text-white border-b-2 border-[#001E38]">
              {/* Corner Block: Sticky Left Specification Field Header */}
              <th
                style={{ width: `${specColWidth}px` }}
                className="sticky left-0 z-40 bg-[#002D54] px-4 py-2 border-r-2 border-[#001E38] align-middle shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#00B7F1]">
                      view_column
                    </span>
                    <div>
                      <div className="text-[12px] font-extrabold uppercase tracking-wider text-white">
                        Specification Field
                      </div>
                      <div className="text-[10px] text-white/70 font-normal">
                        41 Attributes across 7 Groups
                      </div>
                    </div>
                  </div>
                  {/* Resizer for Spec Column */}
                  <div
                    onMouseDown={handleSpecColResize}
                    className="w-2.5 h-full absolute right-0 top-0 bottom-0 cursor-col-resize hover:bg-[#00B7F1] transition-colors z-50"
                    title="Drag to resize field column"
                  />
                </div>
              </th>

              {/* Data Columns: One per Environment Record */}
              {displayedRows.length === 0 ? (
                <th className="px-6 py-4 bg-[#003865] text-white text-xs font-normal">
                  No environments matching active filter criteria.
                </th>
              ) : (
                displayedRows.map((row, colIndex) => {
                  const width = envColWidths[row.id] || 280;
                  const isSelected = selectedRowIds.has(row.id);
                  const canEdit = canEditRow(row);

                  return (
                    <th
                      key={row.id}
                      style={{ width: `${width}px` }}
                      className={`relative px-3.5 py-2 border-r border-[#001E38] align-middle transition-colors ${
                        isSelected ? 'bg-[#003865]' : 'bg-[#002D54]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Checkbox & Env Badge */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelectRow(row.id)}
                            className="rounded text-[#00B7F1] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                            title="Select environment for deletion or bulk actions"
                          />
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-extrabold text-[11px] shadow-xs border ${getEnvBadge(
                              row.environment
                            )}`}
                          >
                            {row.environment || 'ENV'}
                          </span>
                        </div>

                        {/* Customer Code & Version */}
                        <div className="flex flex-col text-right truncate">
                          <span className="text-[11px] font-bold text-white truncate">
                            {row.customerCode || row.customerName}
                          </span>
                          <span className="text-[10px] font-mono text-white/80">
                            {row.version}
                          </span>
                        </div>

                        {/* Delete Environment button (if authorized) */}
                        {!isReadOnly && onDeleteRow && (
                          <button
                            onClick={() => onDeleteRow(row.id)}
                            className="p-1 rounded text-white/60 hover:text-white hover:bg-red-600/80 transition-colors cursor-pointer"
                            title={`Delete ${row.environment} configuration`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              delete_outline
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Resizable handle for environment column */}
                      <div
                        onMouseDown={(e) => handleEnvColResize(row.id, e)}
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B7F1] transition-colors z-20"
                        title="Drag to resize environment column"
                      />
                    </th>
                  );
                })
              )}

              {/* "+ Add Environment" Column Header at end */}
              {!isReadOnly && onAddRow && (
                <th
                  style={{ width: '140px' }}
                  className="px-3 py-2 bg-[#001E38] border-r border-[#001E38] align-middle text-center"
                >
                  <button
                    onClick={onAddRow}
                    className="flex items-center justify-center gap-1 w-full px-2.5 py-1.5 rounded bg-[#004B87] hover:bg-[#00B7F1] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                    title="Add a new environment configuration record"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>+ New Env</span>
                  </button>
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body: 7 Groups with Field Rows */}
          <tbody className="divide-y divide-[#CBD5E1]">
            {SHEET_GROUPS.map((group) => {
              const groupCols = filteredColumnsByGroup[group.id] || [];
              if (groupCols.length === 0 && fieldSearch.trim()) {
                return null; // Skip empty groups when searching
              }

              const isCollapsed = collapsedGroups.has(group.id);

              return (
                <React.Fragment key={group.id}>
                  {/* ==========================================
                      GROUP ACCORDION HEADER ROW
                      ========================================== */}
                  <tr
                    onClick={() => toggleGroup(group.id)}
                    className={`${group.colorClass} cursor-pointer select-none h-8.5 transition-opacity hover:opacity-95`}
                  >
                    {/* Sticky Left: Group Title */}
                    <td
                      style={{ width: `${specColWidth}px` }}
                      className={`sticky left-0 z-20 ${group.colorClass} px-3 py-1 font-bold text-xs uppercase tracking-wider border-r border-white/20 shadow-xs`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">
                            {isCollapsed ? 'chevron_right' : 'expand_more'}
                          </span>
                          <span className="font-extrabold">{group.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white font-semibold">
                          {groupCols.length} {groupCols.length === 1 ? 'field' : 'fields'}
                        </span>
                      </div>
                    </td>

                    {/* Spanning remaining columns */}
                    <td
                      colSpan={displayedRows.length + (isReadOnly ? 0 : 1)}
                      className={`${group.colorClass} px-3 py-1 text-[11px] opacity-80 border-r border-white/20`}
                    >
                      <span className="italic">
                        {isCollapsed ? 'Click to expand group fields' : ''}
                      </span>
                    </td>
                  </tr>

                  {/* ==========================================
                      FIELD ROWS WITHIN THIS GROUP
                      ========================================== */}
                  {!isCollapsed &&
                    groupCols.map((col, fIndex) => {
                      const isDiff = highlightDiffs && hasDifferenceAcrossEnvs(col.key);

                      return (
                        <tr
                          key={col.key}
                          className={`h-9 transition-colors ${
                            isDiff
                              ? 'bg-amber-50/60 hover:bg-amber-100/60'
                              : fIndex % 2 === 0
                              ? 'bg-white hover:bg-[#F8FAFC]'
                              : 'bg-[#FCFDFE] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {/* Sticky Left: Field Label & Attributes */}
                          <td
                            style={{ width: `${specColWidth}px` }}
                            className={`sticky left-0 z-15 px-3 py-1.5 border-r border-[#CBD5E1] align-middle shadow-xs ${
                              isDiff
                                ? 'bg-amber-50 text-amber-950 font-semibold'
                                : 'bg-[#F8FAFC] text-[#0F172A]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-xs font-semibold truncate text-[#1E293B]">
                                  {col.label}
                                </span>
                                {isDiff && (
                                  <span
                                    className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900 uppercase"
                                    title="Value differs across displayed environments"
                                  >
                                    Diff
                                  </span>
                                )}
                              </div>

                              {/* Subtle Property Type Tag */}
                              <div className="flex items-center gap-1 shrink-0">
                                {col.type === 'dropdown' && (
                                  <span className="text-[10px] text-[#64748B] font-mono px-1 py-0.2 bg-[#E2E8F0] rounded">
                                    select
                                  </span>
                                )}
                                {col.isUrl && (
                                  <span className="text-[10px] text-[#006688] font-mono px-1 py-0.2 bg-[#E0F2FE] rounded">
                                    url
                                  </span>
                                )}
                                {col.isMonospace && !col.isUrl && (
                                  <span className="text-[10px] text-[#475569] font-mono px-1 py-0.2 bg-[#F1F5F9] rounded">
                                    code
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Data Cells: Each Environment Value for this Field */}
                          {displayedRows.map((row) => {
                            const width = envColWidths[row.id] || 280;
                            const cellKey = `${row.id}:${col.key}`;
                            const isModified = modifiedCells.has(cellKey);
                            const origVal = modifiedCells.get(cellKey);
                            const isEditingThisCell =
                              editingCell?.rowId === row.id && editingCell?.colKey === col.key;
                            const userCanEditRow = canEditRow(row);

                            return (
                              <td
                                key={row.id}
                                style={{ width: `${width}px` }}
                                className={`p-0 border-r border-[#CBD5E1] align-middle ${
                                  isDiff ? 'bg-amber-50/40' : ''
                                }`}
                              >
                                <ExcelCell
                                  rowId={row.id}
                                  column={col}
                                  value={row[col.key]}
                                  originalValue={origVal}
                                  isModified={isModified}
                                  canEdit={userCanEditRow}
                                  onChange={onCellChange}
                                  onStartEdit={() =>
                                    onStartEdit({ rowId: row.id, colKey: col.key })
                                  }
                                  onEndEdit={onEndEdit}
                                  isEditing={isEditingThisCell}
                                />
                              </td>
                            );
                          })}

                          {/* Empty spacer for the "+ New Env" column */}
                          {!isReadOnly && onAddRow && (
                            <td
                              style={{ width: '140px' }}
                              className="p-0 border-r border-[#CBD5E1] bg-[#F8FAFC]/50 text-center"
                            />
                          )}
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
