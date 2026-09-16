// Helper to export a Customer Technical Details Sheet to CSV (Excel compatible)

export const exportCustomerSheetToCsv = (customerSheet) => {
  if (!customerSheet) return;

  const { metadata, environments, applications, name } = customerSheet;

  const lines = [];

  // Helper to escape CSV cell value
  const esc = (val) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Row 1: Title
  lines.push([esc(`${name} - Technical Details`), '""', '""', '""'].join(','));
  lines.push(['""', '""', '""', '""'].join(','));

  // Row 2: Customer Specification Metadata
  lines.push([esc('CUSTOMER SPECIFICATION METADATA'), '""', '""', '""'].join(','));
  lines.push([esc('Onboarding SME Name - Primary'), esc(metadata.primarySme || ''), '""', '""'].join(','));
  lines.push([esc('Onboarding SME Name - Secondary'), esc(metadata.secondarySme || ''), '""', '""'].join(','));
  lines.push([esc('Implementation'), esc(metadata.implementationType || ''), '""', '""'].join(','));
  lines.push([esc('T-Shirt / Size'), esc(metadata.size || ''), '""', '""'].join(','));
  lines.push([esc('JPower ID'), esc(metadata.jpowerId || ''), '""', '""'].join(','));
  lines.push([esc('MSC / DSS'), esc(metadata.mscDss || ''), '""', '""'].join(','));
  lines.push([esc('Customer Code'), esc(metadata.customerCode || ''), '""', '""'].join(','));
  lines.push([esc('Cloud Region'), esc(metadata.cloudRegion || ''), '""', '""'].join(','));
  lines.push([esc('Status'), esc(metadata.status || ''), '""', '""'].join(','));
  lines.push(['""', '""', '""', '""'].join(','));

  // Environments Header
  lines.push([esc('Environment'), esc('DEV'), esc('TEST'), esc('PROD')].join(','));
  lines.push([
    esc('Version'),
    esc(environments.DEV?.version || ''),
    esc(environments.TEST?.version || ''),
    esc(environments.PROD?.version || ''),
  ].join(','));
  lines.push(['""', '""', '""', '""'].join(','));

  // Group: SERVER DETAILS
  lines.push([esc('SERVER DETAILS'), '""', '""', '""'].join(','));
  const serverFields = [
    { key: 'citrixServer', label: 'Citrix Server' },
    { key: 'utilityServer', label: 'Utility Server' },
    { key: 'dbServerName', label: 'DB Server Name' },
    { key: 'vsCitrix', label: 'VS Citrix' },
    { key: 'reportingServer', label: 'Reporting Server' },
    { key: 'channelClusteringServer', label: 'Channel Clustering Server' },
    { key: 'daasServer', label: 'DAAS Server' },
  ];
  serverFields.forEach(({ key, label }) => {
    lines.push([
      esc(label),
      esc(environments.DEV?.[key] || 'NA'),
      esc(environments.TEST?.[key] || 'NA'),
      esc(environments.PROD?.[key] || 'NA'),
    ].join(','));
  });
  lines.push(['""', '""', '""', '""'].join(','));

  // Group: DATABASE ACCOUNTS
  lines.push([esc('DATABASE ACCOUNTS'), '""', '""', '""'].join(','));
  const dbFields = [
    { key: 'databaseName', label: 'Database Name' },
    { key: 'dbKeyVaultName', label: 'DB Key Vault Name' },
    { key: 'storageAccountKeyVaultName', label: 'Storage Account Key Vault Name' },
  ];
  dbFields.forEach(({ key, label }) => {
    lines.push([
      esc(label),
      esc(environments.DEV?.[key] || 'NA'),
      esc(environments.TEST?.[key] || 'NA'),
      esc(environments.PROD?.[key] || 'NA'),
    ].join(','));
  });
  lines.push(['""', '""', '""', '""'].join(','));

  // Group: GMSA ACCOUNTS
  lines.push([esc('GMSA ACCOUNTS'), '""', '""', '""'].join(','));
  lines.push([
    esc('Account Name'),
    esc(environments.DEV?.gmsaAccountName || 'NA'),
    esc(environments.TEST?.gmsaAccountName || 'NA'),
    esc(environments.PROD?.gmsaAccountName || 'NA'),
  ].join(','));
  lines.push(['""', '""', '""', '""'].join(','));

  // Group: SFTP
  lines.push([esc('SFTP'), '""', '""', '""'].join(','));
  lines.push([
    esc('SFTP User Name'),
    esc(environments.DEV?.sftpUserName || 'NA'),
    esc(environments.TEST?.sftpUserName || 'NA'),
    esc(environments.PROD?.sftpUserName || 'NA'),
  ].join(','));
  lines.push([
    esc('SFTP Gateway'),
    esc(environments.DEV?.sftpGateway || 'NA'),
    esc(environments.TEST?.sftpGateway || 'NA'),
    esc(environments.PROD?.sftpGateway || 'NA'),
  ].join(','));
  lines.push(['""', '""', '""', '""'].join(','));

  // Group: URLS
  lines.push([esc('URLS'), '""', '""', '""'].join(','));
  const urlFields = [
    { key: 'realm', label: 'Realm' },
    { key: 'citrixUrl', label: 'Citrix URL' },
    { key: 'luminatePortalUrl', label: 'Luminate Portal URL' },
    { key: 'directOpenAccessUrl', label: 'Direct Open Access URL' },
    { key: 'contentServiceUrl', label: 'Content Service URL' },
    { key: 'imageServerUrl', label: 'Image Server URL' },
    { key: 'zabbixUrl', label: 'Zabbix URL' },
    { key: 'directSpacePlanningWebUrl', label: 'Direct Space Planning Web URL' },
    { key: 'directStrategicAssortmentUrl', label: 'Direct Strategic Assortment URL' },
    { key: 'directStrategicSpaceUrl', label: 'Direct Strategic Space URL' },
  ];
  urlFields.forEach(({ key, label }) => {
    lines.push([
      esc(label),
      esc(environments.DEV?.[key] || 'NA'),
      esc(environments.TEST?.[key] || 'NA'),
      esc(environments.PROD?.[key] || 'NA'),
    ].join(','));
  });
  lines.push(['""', '""', '""', '""'].join(','));

  // Group: APPLICATIONS INSTALLED ON SERVERS
  lines.push([esc('APPLICATIONS INSTALLED ON SERVERS'), '""', '""', '""'].join(','));
  const appCategories = [
    { key: 'citrixServer', label: 'Citrix Server' },
    { key: 'vsCitrix', label: 'VS Citrix' },
    { key: 'utilityServer', label: 'Utility Server' },
    { key: 'reportingServer', label: 'Reporting Server' },
    { key: 'dbServer', label: 'DB Server' },
    { key: 'thirdParty', label: 'Third Party' },
  ];
  appCategories.forEach(({ key, label }) => {
    lines.push([esc(`--- ${label} ---`), '""', '""', '""'].join(','));
    const apps = applications?.[key] || [];
    if (apps.length === 0) {
      lines.push([esc('NA'), esc('NA'), esc('NA'), esc('NA')].join(','));
    } else {
      apps.forEach((app) => {
        lines.push([esc(app), esc('Installed'), esc('Installed'), esc('Installed')].join(','));
      });
    }
  });

  // Construct and download CSV file
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeCustomerCode = metadata.customerCode || 'SPEC';
  link.setAttribute('href', url);
  link.setAttribute('download', `${safeCustomerCode}_Technical_Details_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
