// Customer Technical Details Workbook Dataset
// Models complete, independent Excel-style customer sheets with DEV, TEST, and PROD
// Strictly configured for 15 demo customers (Customer 1 - Customer 15)

export const ALLOWED_IMPLEMENTATION_TYPES = [
  'New Implementation',
  'Upgrade',
  'J2C',
];

export const ALLOWED_SIZES = [
  'Very Small',
  'Small',
  'Medium',
  'Large',
  'Very Large',
];

export const ALLOWED_STATUSES = [
  'Active',
  'In Progress',
  'Inactive',
];

export const ALLOWED_REGIONS = [
  'Azure Region - US2',
  'East US',
  'West US',
  'Central US',
  'West Europe',
  'Southeast Asia',
];

export const DEFAULT_APPLICATIONS_TEMPLATE = {
  citrixServer: [
    'Floor Planning',
    'PDF Writer',
    'Space Planning',
    'CKB Studio',
    'CKB Console',
    'CKB Data Manager',
    'Microsoft SQL Server Management Studio',
    'MS Excel',
  ],
  vsCitrix: [
    'Floor Planning',
    'Space Planning',
    'Space Automation Professional',
    'Visual Studio Professional',
    'Category Knowledge Base',
  ],
  utilityServer: [
    'Floor Planning',
    'PDF Writer',
    'Space Planning',
    'Microsoft SQL Server Management Studio',
    'MS Excel',
    'CKB Builder',
    'CKB Console',
    'CKB Data Manager',
  ],
  reportingServer: [
    'Reporting Services',
    'NA',
  ],
  dbServer: [
    'Microsoft SQL Server',
  ],
  thirdParty: [
    'NA',
  ],
};

// Creates a completely blank environment record (no values copied from another customer)
export const createBlankEnvironment = (version = 'V2025.4') => ({
  version,
  // SERVER DETAILS
  citrixServer: '',
  utilityServer: '',
  dbServerName: '',
  vsCitrix: '',
  reportingServer: '',
  channelClusteringServer: 'NA',
  daasServer: '',
  // DATABASE ACCOUNTS
  databaseName: '',
  dbKeyVaultName: '',
  storageAccountKeyVaultName: '',
  // GMSA ACCOUNTS
  gmsaAccountName: '',
  // SFTP
  sftpUserName: '',
  sftpGateway: '',
  // URLS
  realm: '',
  citrixUrl: '',
  luminatePortalUrl: '',
  directOpenAccessUrl: '',
  contentServiceUrl: '',
  imageServerUrl: '',
  zabbixUrl: '',
  directSpacePlanningWebUrl: '',
  directStrategicAssortmentUrl: '',
  directStrategicSpaceUrl: '',
});

// Creates a fresh blank customer sheet structure
export const createBlankCustomerSheet = (metadata = {}) => {
  const customerName = metadata.customerName || 'New Customer';
  const slug = customerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const version = metadata.version || 'V2025.4';

  return {
    id: `customer-${slug}-${Date.now()}`,
    name: customerName,
    isTemplate: false,
    metadata: {
      customerName,
      customerCode: metadata.customerCode || '',
      jpowerId: metadata.jpowerId || '',
      primarySme: metadata.primarySme || '',
      secondarySme: metadata.secondarySme || '',
      implementationType: metadata.implementationType || 'New Implementation',
      size: metadata.size || 'Medium',
      status: metadata.status || 'In Progress',
      mscDss: metadata.mscDss || 'MSC + DSS',
      cloudRegion: metadata.cloudRegion || 'Azure Region - US2',
    },
    environments: {
      DEV: createBlankEnvironment(version),
      TEST: createBlankEnvironment(version),
      PROD: createBlankEnvironment(version),
    },
    applications: {
      citrixServer: ['Floor Planning', 'Space Planning', 'MS Excel'],
      vsCitrix: ['Visual Studio Professional', 'Category Knowledge Base'],
      utilityServer: ['Floor Planning', 'CKB Console'],
      reportingServer: ['Reporting Services'],
      dbServer: ['Microsoft SQL Server'],
      thirdParty: ['NA'],
    },
  };
};

// Helper to create realistic environment details for demo customers
const createCustomerEnvironment = (custNum, envType, version) => {
  const cId = `cust${custNum}`;
  const envLower = envType.toLowerCase();
  const envShort = envType === 'PROD' ? 'prd' : envLower;
  const domain = 'bycloud.net';

  return {
    version,
    // SERVER DETAILS
    citrixServer: `ctx-${cId}-${envShort}01.${domain}`,
    utilityServer: `utl-${cId}-${envShort}01.${domain}`,
    dbServerName: `sql-${cId}-${envShort}01.database.windows.net`,
    vsCitrix: `vsc-${cId}-${envShort}01.${domain}`,
    reportingServer: `rep-${cId}-${envShort}01.${domain}`,
    channelClusteringServer: 'NA',
    daasServer: `das-${cId}-${envShort}01.${domain}`,
    // DATABASE ACCOUNTS
    databaseName: `catman_${cId}_${envLower}_db`,
    dbKeyVaultName: `kv-${cId}-${envLower}-secrets`,
    storageAccountKeyVaultName: `kv-${cId}-${envLower}-storage`,
    // GMSA ACCOUNTS
    gmsaAccountName: `CORP\\svc-${cId}-${envLower}-gmsa$`,
    // SFTP
    sftpUserName: `sftp_${cId}_${envLower}`,
    sftpGateway: `sftp-gateway-us2.${domain}:22`,
    // URLS
    realm: `${cId}-${envLower}`,
    citrixUrl: `https://citrix-${envLower}.${cId}.${domain}`,
    luminatePortalUrl: `https://portal-${envLower}.${cId}.${domain}`,
    directOpenAccessUrl: `https://doa-${envLower}.${cId}.${domain}/catman`,
    contentServiceUrl: `https://cs-${envLower}.${cId}.${domain}/api/v1`,
    imageServerUrl: `https://img-${envLower}.${cId}.${domain}/assets`,
    zabbixUrl: `https://zabbix.${domain}/hosts?filter=${cId}-${envLower}`,
    directSpacePlanningWebUrl: `https://spw-${envLower}.${cId}.${domain}/planogram`,
    directStrategicAssortmentUrl: `https://sa-${envLower}.${cId}.${domain}/assortment`,
    directStrategicSpaceUrl: `https://ss-${envLower}.${cId}.${domain}/strategic-space`,
  };
};

const CUSTOMER_PROFILES = [
  { num: 1, primarySme: 'Devon Vance', secondarySme: 'Tyler Chen', type: 'Upgrade', size: 'Large', region: 'Azure Region - US2' },
  { num: 2, primarySme: 'Elena Rostova', secondarySme: 'David Ross', type: 'Upgrade', size: 'Large', region: 'East US' },
  { num: 3, primarySme: 'Alex Vance', secondarySme: 'Tyler Chen', type: 'New Implementation', size: 'Large', region: 'Central US' },
  { num: 4, primarySme: 'Mark Sterling', secondarySme: 'Elena Rostova', type: 'J2C', size: 'Medium', region: 'West US' },
  { num: 5, primarySme: 'David Ross', secondarySme: 'Sarah Jenkins', type: 'New Implementation', size: 'Large', region: 'Azure Region - US2' },
  { num: 6, primarySme: 'Tyler Chen', secondarySme: 'Alex Vance', type: 'J2C', size: 'Small', region: 'West Europe' },
  { num: 7, primarySme: 'Sarah Jenkins', secondarySme: 'David Ross', type: 'Upgrade', size: 'Medium', region: 'West US' },
  { num: 8, primarySme: 'Elena Rostova', secondarySme: 'Alex Vance', type: 'J2C', size: 'Large', region: 'Central US' },
  { num: 9, primarySme: 'Alex Vance', secondarySme: 'Marcus Brody', type: 'New Implementation', size: 'Large', region: 'East US' },
  { num: 10, primarySme: 'Elena Rostova', secondarySme: 'Tyler Chen', type: 'J2C', size: 'Very Large', region: 'Azure Region - US2' },
  { num: 11, primarySme: 'David Ross', secondarySme: 'Alex Vance', type: 'Upgrade', size: 'Small', region: 'Southeast Asia' },
  { num: 12, primarySme: 'Sarah Jenkins', secondarySme: 'Marcus Brody', type: 'New Implementation', size: 'Medium', region: 'Central US' },
  { num: 13, primarySme: 'Mark Sterling', secondarySme: 'Tyler Chen', type: 'J2C', size: 'Large', region: 'East US' },
  { num: 14, primarySme: 'Alex Vance', secondarySme: 'Elena Rostova', type: 'Upgrade', size: 'Very Small', region: 'West US' },
  { num: 15, primarySme: 'David Ross', secondarySme: 'Sarah Jenkins', type: 'New Implementation', size: 'Large', region: 'Azure Region - US2' },
];

export const INITIAL_WORKBOOK_CUSTOMERS = CUSTOMER_PROFILES.map(({ num, primarySme, secondarySme, type, size, region }) => {
  const customerName = `Customer ${num}`;
  const codeNum = String(num).padStart(3, '0');
  const customerCode = `CUST-${codeNum}`;
  const jpowerId = `445${String(num).padStart(2, '0')}`;

  return {
    id: `sheet-customer-${num}`,
    name: customerName,
    isTemplate: false,
    metadata: {
      customerName,
      customerCode,
      jpowerId,
      primarySme,
      secondarySme,
      implementationType: type,
      size,
      status: 'Active',
      mscDss: 'MSC + DSS',
      cloudRegion: region,
    },
    environments: {
      DEV: createCustomerEnvironment(num, 'DEV', 'V2026.2'),
      TEST: createCustomerEnvironment(num, 'TEST', 'V2026.2'),
      PROD: createCustomerEnvironment(num, 'PROD', 'V2025.1'),
    },
    applications: {
      citrixServer: [
        'Floor Planning',
        'PDF Writer',
        'Space Planning',
        'CKB Studio',
        'CKB Console',
        'CKB Data Manager',
        'Microsoft SQL Server Management Studio',
        'MS Excel',
      ],
      vsCitrix: [
        'Floor Planning',
        'Space Planning',
        'Space Automation Professional',
        'Visual Studio Professional',
        'Category Knowledge Base',
      ],
      utilityServer: [
        'Floor Planning',
        'PDF Writer',
        'Space Planning',
        'Microsoft SQL Server Management Studio',
        'MS Excel',
        'CKB Builder',
        'CKB Console',
        'CKB Data Manager',
      ],
      reportingServer: [
        'Reporting Services',
        'NA',
      ],
      dbServer: [
        'Microsoft SQL Server',
      ],
      thirdParty: [
        'NA',
      ],
    },
  };
});
