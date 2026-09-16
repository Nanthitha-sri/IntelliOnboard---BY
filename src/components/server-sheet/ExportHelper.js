// CSV Export Utility for Server Details Data Sheet

export const exportSheetToCsv = (columns, rows, fileName = 'IntelliOnboard_Server_Details.csv') => {
  if (!rows || !rows.length) return;

  // Header row with column labels
  const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataRows = rows.map(row => {
    return columns.map(c => {
      const val = row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headers, ...dataRows].join('\r\n');
  downloadCsv(csvContent, fileName);
};

export const exportVerticalSheetToCsv = (groups, columns, rows, fileName = 'IntelliOnboard_Server_Details_Vertical.csv') => {
  if (!rows || !rows.length) return;

  // Header row: Group, Specification Field, followed by each record (e.g. Customer Env [Version])
  const colHeaders = [
    '"Group"',
    '"Specification Field"',
    ...rows.map(r => `"${(r.customerName || 'Env') + ' - ' + (r.environment || '') + ' (' + (r.version || '') + ')'}"`)
  ].join(',');

  const groupNameMap = {};
  groups.forEach(g => {
    groupNameMap[g.id] = g.name;
  });

  const dataRows = columns.map(col => {
    const grpName = groupNameMap[col.group] || col.group || '';
    const fieldLabel = col.label;
    const values = rows.map(r => {
      const val = r[col.key] !== undefined && r[col.key] !== null ? String(r[col.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    return [`"${grpName.replace(/"/g, '""')}"`, `"${fieldLabel.replace(/"/g, '""')}"`, ...values].join(',');
  });

  const csvContent = [colHeaders, ...dataRows].join('\r\n');
  downloadCsv(csvContent, fileName);
};

const downloadCsv = (content, fileName) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

