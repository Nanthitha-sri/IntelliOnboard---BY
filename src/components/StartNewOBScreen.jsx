import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  loadCustomerRegistry,
  saveCustomerMeta,
  loadOnboardingProjects,
  saveOnboardingProjects,
  DEMO_CUSTOMERS_LIST,
} from '../data/customerStore.js';

// Certified SME Directory for Searchable Selection
const AVAILABLE_SMES = [
  { id: 'sme-1', name: 'Alex Vance', role: 'Lead Enterprise Architect', email: 'alex.vance@blueyonder.com' },
  { id: 'sme-2', name: 'Sarah Jenkins', role: 'Cloud Infrastructure Principal', email: 'sarah.jenkins@blueyonder.com' },
  { id: 'sme-3', name: 'Elena Rostova', role: 'Database & Sizing Lead', email: 'elena.rostova@blueyonder.com' },
  { id: 'sme-4', name: 'Marcus Brody', role: 'Solution Architecture SME', email: 'marcus.brody@blueyonder.com' },
  { id: 'sme-5', name: 'David Ross', role: 'Integration Specialist', email: 'david.ross@blueyonder.com' },
  { id: 'sme-6', name: 'Tyler Chen', role: 'Systems Deployment Engineer', email: 'tyler.chen@blueyonder.com' },
  { id: 'sme-7', name: 'Rachel Adams', role: 'Operations & Support Lead', email: 'rachel.adams@blueyonder.com' },
  { id: 'sme-8', name: 'Vikram Patel', role: 'Premier Support Architect', email: 'vikram.patel@blueyonder.com' },
  { id: 'sme-9', name: 'Mark Sterling', role: 'Cloud Reliability Engineer', email: 'mark.sterling@blueyonder.com' },
];

// Available Products for Entitlement (Exact 10 from specification)
const ENTITLEMENT_PRODUCTS = [
  { id: 'SP', name: 'SP' },
  { id: 'SP Plus', name: 'SP Plus' },
  { id: 'SP Web', name: 'SP Web' },
  { id: 'FP', name: 'FP' },
  { id: 'FP Plus', name: 'FP Plus' },
  { id: 'CKB', name: 'CKB' },
  { id: 'Assortment Opt', name: 'Assortment Opt' },
  { id: 'Web Publisher', name: 'Web Publisher' },
  { id: 'Reporting', name: 'Reporting' },
  { id: 'SAPm', name: 'SAPm' },
];

// Configurable Business Rules for Voyager Sizing
const SIZING_RULES = [
  {
    size: 'Very Large',
    minGcUsers: 200,
    minPodCount: 6,
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Hyperscale dedicated multi-region cluster with automated failover and elastic scaling',
    rationale: 'GC Users ≥ 200 OR POD Count ≥ 6',
  },
  {
    size: 'Large',
    minGcUsers: 100,
    minPodCount: 4,
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'High-density multi-pod enterprise architecture for heavy concurrent optimization workloads',
    rationale: 'GC Users ≥ 100 OR POD Count ≥ 4',
  },
  {
    size: 'Medium',
    minGcUsers: 40,
    minPodCount: 2,
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Balanced dual-pod production cluster with redundant background batch processing',
    rationale: 'GC Users ≥ 40 OR POD Count ≥ 2',
  },
  {
    size: 'Small',
    minGcUsers: 0,
    minPodCount: 0,
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Standard single-pod tier with scheduled snapshots and baseline compute capacity',
    rationale: 'Baseline (GC Users < 40 and POD Count < 2)',
  },
];

// Determine Voyager Size using business rules
const evaluateVoyagerSizing = (gcUsers, podCount) => {
  const users = Number(gcUsers) || 0;
  const pods = Number(podCount) || 0;

  for (const rule of SIZING_RULES) {
    if (rule.size === 'Very Large' && (users >= rule.minGcUsers || pods >= rule.minPodCount)) {
      return rule;
    }
    if (rule.size === 'Large' && (users >= rule.minGcUsers || pods >= rule.minPodCount)) {
      return rule;
    }
    if (rule.size === 'Medium' && (users >= rule.minGcUsers || pods >= rule.minPodCount)) {
      return rule;
    }
  }
  return SIZING_RULES[3]; // Small fallback
};

export const StartNewOBScreen = ({ onNavigate, onAddProject }) => {
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------
  // WORKFLOW STEPS STATE (01 to 08)
  // -------------------------------------------------------------
  const [activeStep, setActiveStep] = useState(1);

  // 01 — SOW State
  const [sowFile, setSowFile] = useState({
    name: 'Customer_1_SOW_Master_2026.pdf',
    size: '3.8 MB',
    uploadedAt: 'Today at 09:30 AM',
    confidence: '98.4%',
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState('Extracted'); // 'AI Extracting' | 'Extracted' | 'Needs Review' | 'Complete'
  const [customerName, setCustomerName] = useState('Customer 1');
  const [isDragOver, setIsDragOver] = useState(false);

  // 02 — DATA State
  const [subscriptions, setSubscriptions] = useState(16);
  const [disasterRecovery, setDisasterRecovery] = useState('Multi-Region Active-Passive (RTO < 1hr, RPO < 15m)');
  const [supportLevel, setSupportLevel] = useState('Mission-Critical 24/7 (Tier 1)');

  // 03 — VOYAGER SIZE State
  const [gcUsers, setGcUsers] = useState(120);
  const [podCount, setPodCount] = useState(4);
  const [manualVoyagerOverride, setManualVoyagerOverride] = useState(null); // null means use recommended

  // 04 — ENTITLEMENT State
  const [selectedEntitlements, setSelectedEntitlements] = useState([
    'SP',
    'SP Plus',
    'SP Web',
    'CKB',
    'Reporting',
  ]);

  // 05 — SERVERS & SERVICENOW State
  const [targetPlatform, setTargetPlatform] = useState('Azure Cloud');
  const [serverTier, setServerTier] = useState('High-Performance Cluster (16 Core / 64GB)');
  const [instanceCountDesc, setInstanceCountDesc] = useState('4 App Nodes, 2 Web Gateways, 1 Primary DB + 1 Replica');
  const [sslPemCert, setSslPemCert] = useState('DigiCert Cloud Wildcard 2026');
  const [snowTicketNumber, setSnowTicketNumber] = useState('CHG0098412');
  const [jpowerRefId, setJpowerRefId] = useState('JPW-44501');
  const [snowRequestStatus, setSnowRequestStatus] = useState('Approved for Provisioning');
  const [tamContact, setTamContact] = useState('Devon Vance (devon.vance@blueyonder.com)');

  // 06 — SME ASSIGNMENT State
  const [primarySme, setPrimarySme] = useState('Alex Vance');
  const [secondarySme, setSecondarySme] = useState('David Ross');
  const [primarySmeSearch, setPrimarySmeSearch] = useState('');
  const [secondarySmeSearch, setSecondarySmeSearch] = useState('');
  const [showPrimarySmeDropdown, setShowPrimarySmeDropdown] = useState(false);
  const [showSecondarySmeDropdown, setShowSecondarySmeDropdown] = useState(false);

  // 07 — PROJECT TYPE State
  const [projectType, setProjectType] = useState('Upgrade'); // 'New Implementation' | 'Upgrade' | 'J2C'

  // ServiceNow Entitlement Fetch State
  const [isFetchingServiceNow, setIsFetchingServiceNow] = useState(false);
  const [serviceNowSyncedAt, setServiceNowSyncedAt] = useState(null);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessData, setSubmissionSuccessData] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  // Trigger brief toast
  const triggerToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Fetch Entitlements directly from ServiceNow
  const handleFetchServiceNowEntitlements = () => {
    setIsFetchingServiceNow(true);
    setTimeout(() => {
      let snowProducts = ['SP', 'SP Plus', 'SP Web', 'CKB', 'Reporting'];
      const lower = customerName.toLowerCase();
      if (lower.includes('4') || lower.includes('retail') || lower.includes('j2c')) {
        snowProducts = ['SP', 'SP Plus', 'SP Web', 'FP', 'FP Plus', 'CKB', 'Assortment Opt', 'Reporting', 'SAPm'];
      } else if (lower.includes('upgrade')) {
        snowProducts = ['SP', 'SP Plus', 'SP Web', 'CKB', 'Reporting', 'SAPm'];
      }
      setSelectedEntitlements(snowProducts);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setServiceNowSyncedAt(timeStr);
      setIsFetchingServiceNow(false);
      triggerToast(`ServiceNow: ${snowProducts.length} entitlements fetched for ${customerName} (Ref: ${snowTicketNumber})`);
    }, 600);
  };

  // Check if Customer already exists in registry
  const existingCustomersRegistry = useMemo(() => {
    return loadCustomerRegistry();
  }, []);

  const isExistingCustomer = useMemo(() => {
    const trimmed = customerName.trim();
    if (!trimmed) return false;
    return Boolean(
      existingCustomersRegistry[trimmed] ||
      DEMO_CUSTOMERS_LIST.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    );
  }, [customerName, existingCustomersRegistry]);

  // Sizing Calculation
  const recommendedSizingRule = useMemo(() => {
    return evaluateVoyagerSizing(gcUsers, podCount);
  }, [gcUsers, podCount]);

  const effectiveVoyagerSize = manualVoyagerOverride || recommendedSizingRule.size;

  // Simulate SOW Document Upload & AI Extraction
  const handleSowUpload = (fileName, customCustomer = null) => {
    setIsExtracting(true);
    setExtractStatus('AI Extracting');

    setTimeout(() => {
      const pickedCustomer = customCustomer || (fileName.includes('RetailNova') ? 'RetailNova Corp' : 'Customer 1');
      const isUpgrade = fileName.toLowerCase().includes('upgrade');
      const isJ2C = fileName.toLowerCase().includes('j2c');

      setSowFile({
        name: fileName,
        size: '3.8 MB',
        uploadedAt: 'Just now',
        confidence: '98.8%',
      });

      setCustomerName(pickedCustomer);

      if (isUpgrade) {
        setProjectType('Upgrade');
        setSubscriptions(16);
        setGcUsers(140);
        setPodCount(4);
        setDisasterRecovery('Multi-Region Active-Passive (RTO < 1hr, RPO < 15m)');
        setSupportLevel('Mission-Critical 24/7 (Tier 1)');
        setSelectedEntitlements(['SP', 'SP Plus', 'SP Web', 'CKB', 'Reporting']);
      } else if (isJ2C) {
        setProjectType('J2C');
        setSubscriptions(24);
        setGcUsers(260);
        setPodCount(6);
        setDisasterRecovery('Multi-Region Active-Active (RTO 0, RPO 0)');
        setSupportLevel('Mission-Critical 24/7 (Tier 1)');
        setSelectedEntitlements(['SP', 'SP Plus', 'SP Web', 'FP', 'FP Plus', 'CKB', 'Assortment Opt', 'Reporting', 'SAPm']);
      } else {
        setProjectType('New Implementation');
        setSubscriptions(10);
        setGcUsers(60);
        setPodCount(2);
        setDisasterRecovery('Standard Warm Standby (RTO < 4hr, RPO < 1hr)');
        setSupportLevel('Premier Production 24/5 (Tier 2)');
        setSelectedEntitlements(['SP', 'CKB', 'Reporting']);
      }

      setExtractStatus('Extracted');
      setIsExtracting(false);
      triggerToast('SOW processed! AI extracted core fields across all steps.');
    }, 850);
  };

  // File drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleSowUpload(file.name);
    }
  };

  // Toggle entitlement product
  const handleToggleEntitlement = (productId) => {
    setSelectedEntitlements((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((p) => p !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // -------------------------------------------------------------
  // FINAL SUBMISSION HANDLER
  // -------------------------------------------------------------
  const handleSubmitAndSave = () => {
    if (!customerName.trim()) {
      triggerToast('Please provide a valid Customer Name.');
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const trimmedCustomer = customerName.trim();
      const currentRegistry = loadCustomerRegistry();
      let customerMeta = currentRegistry[trimmedCustomer];

      // If customer does NOT exist, create new record in registry
      if (!customerMeta) {
        const safeName = trimmedCustomer.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        customerMeta = {
          customerName: trimmedCustomer,
          customerCode: `CUST-${safeName.slice(0, 4) || '901'}`,
          jpowerId: jpowerRefId || `JPW-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        saveCustomerMeta(trimmedCustomer, customerMeta);
      }

      // Load existing projects to determine next sequential project number for this customer
      const existingProjects = loadOnboardingProjects();
      const customerProjects = existingProjects.filter(
        (p) => p.customer?.toLowerCase() === trimmedCustomer.toLowerCase()
      );
      const nextSeqNumber = customerProjects.length + 1;
      const formattedProjectNumber = `Project ${String(nextSeqNumber).padStart(3, '0')}`;

      // Assemble complete Onboarding Record with all 18 attributes
      const newProjectId = `ob-${Date.now()}`;
      const newOnboardingProject = {
        id: newProjectId,
        customer: trimmedCustomer,
        projectNumber: formattedProjectNumber,
        solution: 'Category Management',
        type: projectType,
        status: 'In Progress',
        transitioned: 'No',
        implementationTeam: 'Cloud Delivery Pod Alpha',
        version: '2026.2.0',
        projectL3: primarySme,
        location: 'Dallas, TX',
        secondarySme: secondarySme,
        tShirtSize: effectiveVoyagerSize,
        noOfSubscriptions: Number(subscriptions) || 12,
        platform: targetPlatform,
        startDate: new Date().toISOString().split('T')[0],
        goLiveDate: '2026-12-15',
        supportPoc: `${supportLevel.split('(')[0].trim()}`,
        sslPem: sslPemCert,
        tam: tamContact.split('(')[0].trim(),
        // Additional request metadata preserved
        sowFileName: sowFile.name,
        serviceNowTicket: snowTicketNumber,
        jpowerId: customerMeta.jpowerId || jpowerRefId,
        gcUsers: Number(gcUsers) || 100,
        podCount: Number(podCount) || 4,
        entitlements: selectedEntitlements,
      };

      // Save to persistent storage
      const updatedLedger = [newOnboardingProject, ...existingProjects];
      saveOnboardingProjects(updatedLedger);

      // Notify parent App component
      if (onAddProject) {
        onAddProject(newOnboardingProject);
      }

      setIsSubmitting(false);
      setSubmissionSuccessData({
        project: newOnboardingProject,
        isExisting: isExistingCustomer,
      });
    }, 600);
  };

  // Steps definition for progressive stepper (7 Structured Steps)
  const STEPS_NAV = [
    { num: 1, id: 'sow', label: 'SOW', icon: 'description', status: extractStatus },
    { num: 2, id: 'data', label: 'Data', icon: 'database', status: 'Complete' },
    { num: 3, id: 'voyager', label: 'Voyager Size', icon: 'speed', status: manualVoyagerOverride ? 'Needs Review' : 'Complete' },
    { num: 4, id: 'entitlement', label: 'Entitlement', icon: 'checklist', status: serviceNowSyncedAt ? 'Complete' : 'Needs Review' },
    { num: 5, id: 'servers', label: 'Servers & ServiceNow', icon: 'dns', status: 'Complete' },
    { num: 6, id: 'sme', label: 'SME Assignment', icon: 'group', status: 'Complete' },
    { num: 7, id: 'type', label: 'Project Type', icon: 'swap_horiz', status: 'Complete' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5FAFD] text-[#121c2a] relative">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#002b4d] text-white text-xs font-semibold rounded-xl shadow-xl border border-[#00b7f1]/40 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[#00b7f1] text-[18px]">auto_awesome</span>
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main Top Header Banner */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 lg:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#004B87] font-mono text-[11px] font-bold border border-[#d3e4ff]">
                INTELLIGENT REQUEST BUILDER
              </span>
              <span className="text-xs text-[#6d7980]">Structured 7-Step Workflow</span>
            </div>
            <h1 className="text-2xl font-bold text-[#121c2a] tracking-tight">
              Start New Onboarding (OB)
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
              Upload SOW → AI extracts data → Review sizing & entitlements → Servers & ServiceNow → SME Assignment → Project Type → Submit & Save.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('customer-onboarding')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitAndSave}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#004B87] to-[#00b7f1] text-white text-xs font-bold shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>{isSubmitting ? 'Saving Request...' : 'Submit & Save Details'}</span>
            </button>
          </div>
        </div>

        {/* Progressive Step Breadcrumb / Pipeline */}
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[#f1f5f9] overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {STEPS_NAV.map((step, idx) => {
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(step.num)}
                  className={`flex-1 flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#eff4ff] border border-[#00b7f1] shadow-xs'
                      : isPast
                      ? 'hover:bg-slate-100/80 border border-transparent'
                      : 'hover:bg-slate-100/50 border border-transparent opacity-75'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-[#004B87] text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      `0${step.num}`
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-[11px] font-bold leading-tight truncate ${
                        isActive ? 'text-[#004B87]' : 'text-[#334155]'
                      }`}
                    >
                      {step.label}
                    </p>
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                      {step.status === 'AI Extracting' ? (
                        <span className="text-blue-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                          Extracting
                        </span>
                      ) : step.status === 'Needs Review' ? (
                        <span className="text-amber-600 font-semibold">Needs Review</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Ready</span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workflow Content Canvas */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 flex-1">
        <div className="space-y-8">
          {/* ============================================================== */}
          {/* 01 — SOW (STATEMENT OF WORK) */}
          {/* ============================================================== */}
          <section
            id="step-sow"
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              activeStep === 1 ? 'ring-2 ring-[#00b7f1] border-[#00b7f1]' : 'border-[#E2E8F0]'
            }`}
          >
            <div className="p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white to-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#004B87] font-bold text-sm flex items-center justify-center border border-[#d3e4ff]">
                  01
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    SOW (Statement of Work)
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#004B87] border border-blue-100">
                      Automated Extraction Engine
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Upload the project SOW to extract client details, scope commitments, SLA tiers, and infrastructure limits.
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#64748B]">Extraction Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    extractStatus === 'AI Extracting'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {extractStatus}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragOver
                    ? 'border-[#00b7f1] bg-[#eff4ff]'
                    : 'border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSowUpload(e.target.files[0].name);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-[#E2E8F0] flex items-center justify-center text-[#004B87]">
                    <span className="material-symbols-outlined text-[32px]">upload_file</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">
                      Drag and drop SOW document here
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      Supports PDF, DOCX, XLSX, and TXT files up to 50MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] hover:bg-[#F1F5F9] shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                    <span>Browse Files</span>
                  </button>
                </div>
              </div>

              {/* Sample SOW Instant Loaders for seamless testing */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-[#64748B]">Quick Load Demo SOWs:</span>
                <button
                  type="button"
                  onClick={() => handleSowUpload('Customer_1_SOW_Upgrade_2026.pdf', 'Customer 1')}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-[#eff4ff] text-[#004B87] hover:bg-[#d3e4ff] border border-[#d3e4ff] transition-colors cursor-pointer"
                >
                  Customer 1 (Upgrade)
                </button>
                <button
                  type="button"
                  onClick={() => handleSowUpload('Customer_4_SOW_J2C_Migration.pdf', 'Customer 4')}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-[#eff4ff] text-[#004B87] hover:bg-[#d3e4ff] border border-[#d3e4ff] transition-colors cursor-pointer"
                >
                  Customer 4 (J2C)
                </button>
                <button
                  type="button"
                  onClick={() => handleSowUpload('RetailNova_Corp_SOW_New_Implementation.pdf', 'RetailNova Corp')}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-[#eff4ff] text-[#004B87] hover:bg-[#d3e4ff] border border-[#d3e4ff] transition-colors cursor-pointer"
                >
                  RetailNova Corp (New Customer)
                </button>
              </div>

              {/* Uploaded Document Details Card */}
              {sowFile && (
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A]">{sowFile.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {sowFile.confidence} Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Size: {sowFile.size} • Uploaded: {sowFile.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004B87] bg-white px-3 py-1.5 rounded-lg border border-[#d3e4ff]">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      AI extracted information
                    </span>
                  </div>
                </div>
              )}

              {/* Customer Identification & Existing Customer Deduplication Check */}
              <div className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#d3e4ff] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#004B87] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">domain</span>
                    Customer Name (Extracted from SOW)
                  </label>
                  <span className="text-[11px] text-[#64748B]">
                    Editable: Select an existing customer or type a new company
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />

                  {/* Customer Quick Selector dropdown */}
                  <select
                    value={isExistingCustomer ? customerName : ''}
                    onChange={(e) => {
                      if (e.target.value) setCustomerName(e.target.value);
                    }}
                    className="px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] cursor-pointer"
                  >
                    <option value="">Or Pick From 15 Demo Customers...</option>
                    {DEMO_CUSTOMERS_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deduplication & Registry Status Message */}
                {isExistingCustomer ? (
                  <div className="flex items-start gap-2 text-xs text-blue-900 bg-blue-50/80 p-3 rounded-lg border border-blue-200">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0">
                      verified
                    </span>
                    <div>
                      <span className="font-bold">Existing Customer Identified ({customerName}):</span>{' '}
                      IntelliOnboard will <strong>not create a duplicate customer record</strong>. This onboarding request will be added as a subsequent project under {customerName}'s account.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
                      new_releases
                    </span>
                    <div>
                      <span className="font-bold">New Customer ({customerName || 'Pending'}):</span>{' '}
                      This customer is not yet in the customer registry. A new customer profile with assigned customer code and JPower ID will be automatically provisioned upon submission.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 02 — DATA */}
          {/* ============================================================== */}
          <section
            id="step-data"
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              activeStep === 2 ? 'ring-2 ring-[#00b7f1] border-[#00b7f1]' : 'border-[#E2E8F0]'
            }`}
          >
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#004B87] font-bold text-sm flex items-center justify-center border border-[#d3e4ff]">
                  02
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Data
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                      AI extracted information
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Strictly defined operational capacity parameters: Subscriptions, Disaster Recovery, and Support Level.
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#004B87]">Review & Modify</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Field 1: Subscriptions */}
              <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1E293B]">Subscriptions</label>
                  <span className="text-[10px] font-bold text-[#004B87] bg-white px-2 py-0.5 rounded border border-[#d3e4ff]">
                    AI Extracted
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={subscriptions}
                  onChange={(e) => setSubscriptions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                />
                <p className="text-[11px] text-[#64748B]">
                  Number of active application tenant subscriptions entitled.
                </p>
              </div>

              {/* Field 2: DR (Disaster Recovery) */}
              <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1E293B]">DR (Disaster Recovery)</label>
                  <span className="text-[10px] font-bold text-[#004B87] bg-white px-2 py-0.5 rounded border border-[#d3e4ff]">
                    AI Extracted
                  </span>
                </div>
                <select
                  value={disasterRecovery}
                  onChange={(e) => setDisasterRecovery(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] cursor-pointer"
                >
                  <option value="Multi-Region Active-Passive (RTO < 1hr, RPO < 15m)">
                    Multi-Region Active-Passive (RTO &lt; 1hr, RPO &lt; 15m)
                  </option>
                  <option value="Multi-Region Active-Active (RTO 0, RPO 0)">
                    Multi-Region Active-Active (RTO 0, RPO 0)
                  </option>
                  <option value="Standard Warm Standby (RTO < 4hr, RPO < 1hr)">
                    Standard Warm Standby (RTO &lt; 4hr, RPO &lt; 1hr)
                  </option>
                  <option value="Local High-Availability Redundancy">
                    Local High-Availability Redundancy
                  </option>
                </select>
                <p className="text-[11px] text-[#64748B]">
                  Disaster recovery failover topology and target RTO/RPO limits.
                </p>
              </div>

              {/* Field 3: Support Level */}
              <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1E293B]">Support Level</label>
                  <span className="text-[10px] font-bold text-[#004B87] bg-white px-2 py-0.5 rounded border border-[#d3e4ff]">
                    AI Extracted
                  </span>
                </div>
                <select
                  value={supportLevel}
                  onChange={(e) => setSupportLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] cursor-pointer"
                >
                  <option value="Mission-Critical 24/7 (Tier 1)">Mission-Critical 24/7 (Tier 1)</option>
                  <option value="Premier Production 24/5 (Tier 2)">Premier Production 24/5 (Tier 2)</option>
                  <option value="Standard Business Hours 9/5 (Tier 3)">Standard Business Hours 9/5 (Tier 3)</option>
                </select>
                <p className="text-[11px] text-[#64748B]">
                  SLA service escalation tier and support dispatch coverage.
                </p>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 03 — VOYAGER SIZE */}
          {/* ============================================================== */}
          <section
            id="step-voyager"
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              activeStep === 3 ? 'ring-2 ring-[#00b7f1] border-[#00b7f1]' : 'border-[#E2E8F0]'
            }`}
          >
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#004B87] font-bold text-sm flex items-center justify-center border border-[#d3e4ff]">
                  03
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Voyager Size
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#004B87] border border-blue-100">
                      Configurable Rules Engine
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Calculates recommended Voyager sizing tier based on GC Users and POD Count rules.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B]">Current Recommendation:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${recommendedSizingRule.badge}`}>
                  {recommendedSizingRule.size}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Inputs: GC Users & POD Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E293B]">GC Users (Global Client Users)</label>
                    <span className="text-[10px] font-semibold text-[#64748B]">Input Concurrency</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={gcUsers}
                    onChange={(e) => setGcUsers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                  <p className="text-[11px] text-[#64748B]">
                    Expected peak concurrent desktop client and web user sessions.
                  </p>
                </div>

                <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E293B]">POD Count</label>
                    <span className="text-[10px] font-semibold text-[#64748B]">Cluster Infrastructure</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={podCount}
                    onChange={(e) => setPodCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                  <p className="text-[11px] text-[#64748B]">
                    Number of dedicated container pod groups deployed in the cluster.
                  </p>
                </div>
              </div>

              {/* Recommendation Display Card */}
              <div className="p-5 rounded-2xl bg-[#eff4ff]/60 border border-[#d3e4ff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#004B87]">
                      Recommended Voyager Size
                    </span>
                    <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-[#d3e4ff] text-[#004B87]">
                      Rule: {recommendedSizingRule.rationale}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-extrabold text-[#004B87]">
                      {recommendedSizingRule.size}
                    </span>
                    <span className="text-xs text-[#475569]">
                      — {recommendedSizingRule.description}
                    </span>
                  </div>
                </div>

                {/* Manual Review / Override Selector */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#CBD5E1] shadow-2xs">
                  <label className="text-xs font-bold text-[#334155] whitespace-nowrap pl-1">
                    Value in Request:
                  </label>
                  <select
                    value={effectiveVoyagerSize}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === recommendedSizingRule.size) {
                        setManualVoyagerOverride(null);
                      } else {
                        setManualVoyagerOverride(val);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-[#004B87] bg-[#eff4ff] border border-[#d3e4ff] rounded-lg cursor-pointer focus:outline-none"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Very Large">Very Large</option>
                  </select>
                  {manualVoyagerOverride && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Manual Override
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 04 — ENTITLEMENT */}
          {/* ============================================================== */}
          <section
            id="step-entitlement"
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              activeStep === 4 ? 'ring-2 ring-[#00b7f1] border-[#00b7f1]' : 'border-[#E2E8F0]'
            }`}
          >
            <div className="p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white to-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#004B87] font-bold text-sm flex items-center justify-center border border-[#d3e4ff]">
                  04
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Entitlement
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#004B87] border border-blue-100">
                      Module Scope Checklist
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Select entitled CATMAN products or fetch customer entitlement records directly from ServiceNow.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Button for ServiceNow to fetch detail for this section */}
                <button
                  type="button"
                  onClick={handleFetchServiceNowEntitlements}
                  disabled={isFetchingServiceNow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004B87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  title="Fetch software entitlement records for this customer directly from ServiceNow"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isFetchingServiceNow ? 'animate-spin' : ''}`}>
                    {isFetchingServiceNow ? 'sync' : 'cloud_download'}
                  </span>
                  <span>{isFetchingServiceNow ? 'Fetching from ServiceNow...' : 'Fetch from ServiceNow'}</span>
                </button>

                {serviceNowSyncedAt && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    ServiceNow Synced ({serviceNowSyncedAt})
                  </span>
                )}

                <span className="text-xs font-bold text-[#004B87] bg-[#eff4ff] px-3 py-1 rounded-full border border-[#d3e4ff]">
                  {selectedEntitlements.length} of {ENTITLEMENT_PRODUCTS.length} Selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEntitlements(ENTITLEMENT_PRODUCTS.map((p) => p.id))}
                  className="text-xs font-semibold text-[#004B87] hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEntitlements([])}
                  className="text-xs font-semibold text-[#64748B] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Product multi-select checklist grid - sub details removed */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {ENTITLEMENT_PRODUCTS.map((product) => {
                  const isChecked = selectedEntitlements.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleToggleEntitlement(product.id)}
                      className={`px-4 py-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2 shadow-2xs ${
                        isChecked
                          ? 'bg-[#eff4ff] border-[#00b7f1] ring-1 ring-[#00b7f1]'
                          : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className={`text-xs font-bold ${isChecked ? 'text-[#004B87]' : 'text-[#334155]'}`}>
                        {product.name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-white transition-colors shrink-0 ${
                          isChecked ? 'bg-[#004B87]' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 05 — SERVERS & SERVICENOW */}
          {/* ============================================================== */}
          <section
            id="step-servers"
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              activeStep === 5 ? 'ring-2 ring-[#00b7f1] border-[#00b7f1]' : 'border-[#E2E8F0]'
            }`}
          >
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#004B87] font-bold text-sm flex items-center justify-center border border-[#d3e4ff]">
                  05
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Servers & ServiceNow
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#004B87] border border-blue-100">
                      Provisioning Request Scope
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    High-level server topology coordinates and ServiceNow change ticket linkages required for request initiation.
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#64748B] hidden sm:inline">
                (Detailed server specs managed in Server Details)
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group 1: Server Requirements */}
              <div className="space-y-4 bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#004B87] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">dns</span>
                  Server Request Coordinates
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">Target Cloud Platform</label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] cursor-pointer"
                  >
                    <option value="Azure Cloud">Azure Cloud (Primary US/EU)</option>
                    <option value="BY Cloud">Blue Yonder Cloud Native</option>
                    <option value="AWS">AWS (Amazon Web Services)</option>
                    <option value="GCP">Google Cloud Platform</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">Server Tier & Sizing Spec</label>
                  <input
                    type="text"
                    value={serverTier}
                    onChange={(e) => setServerTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">Estimated Node Distribution</label>
                  <input
                    type="text"
                    value={instanceCountDesc}
                    onChange={(e) => setInstanceCountDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">SSL / PEM Certificate Profile</label>
                  <input
                    type="text"
                    value={sslPemCert}
                    onChange={(e) => setSslPemCert(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>
              </div>

              {/* Group 2: ServiceNow Request Details */}
              <div className="space-y-4 bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#004B87] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                  ServiceNow Integration Information
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">ServiceNow Change / Request Ticket #</label>
                  <input
                    type="text"
                    value={snowTicketNumber}
                    onChange={(e) => setSnowTicketNumber(e.target.value)}
                    placeholder="e.g. CHG0098412"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">JPower / Opportunity Reference ID</label>
                  <input
                    type="text"
                    value={jpowerRefId}
                    onChange={(e) => setJpowerRefId(e.target.value)}
                    placeholder="e.g. JPW-44501"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">ServiceNow Status</label>
                  <select
                    value={snowRequestStatus}
                    onChange={(e) => setSnowRequestStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] cursor-pointer"
                  >
                    <option value="Approved for Provisioning">Approved for Provisioning</option>
                    <option value="Pending Security Review">Pending Security Review</option>
                    <option value="Draft Request">Draft Request</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155]">Technical Account Manager (TAM)</label>
                  <input
                    type="text"
                    value={tamContact}
                    onChange={(e) => setTamContact(e.target.value)}
                    placeholder="e.g. Devon Vance"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 06 — SME ASSIGNMENT */}
          {/* ============================================================== */}
          <section
            id="step-sme"
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              activeStep === 6 ? 'ring-2 ring-[#00b7f1] border-[#00b7f1]' : 'border-[#E2E8F0]'
            }`}
          >
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#004B87] font-bold text-sm flex items-center justify-center border border-[#d3e4ff]">
                  06
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    SME Assignment
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#004B87] border border-blue-100">
                      Certified Architects
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Assign Primary and Secondary Subject Matter Experts with searchable dropdown selection.
                  </p>
                </div>
              </div>

              <span className="text-xs text-[#004B87] font-semibold">Governance & Escalation</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary SME Searchable Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-[#1E293B] flex items-center justify-between">
                  <span>Primary SME (Lead Architect)</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Searchable</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPrimarySmeDropdown(!showPrimarySmeDropdown)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] flex items-center justify-between shadow-2xs hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#004B87] text-white flex items-center justify-center text-[10px] font-bold">
                        {primarySme.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{primarySme}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-500">expand_more</span>
                  </button>

                  {showPrimarySmeDropdown && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-[#CBD5E1] p-2 z-30 animate-in fade-in">
                      <input
                        type="text"
                        placeholder="Search SME name or role..."
                        value={primarySmeSearch}
                        onChange={(e) => setPrimarySmeSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F1F5F9] rounded-lg border-0 focus:ring-1 focus:ring-[#00b7f1] mb-2"
                      />
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {AVAILABLE_SMES.filter(
                          (s) =>
                            s.name.toLowerCase().includes(primarySmeSearch.toLowerCase()) ||
                            s.role.toLowerCase().includes(primarySmeSearch.toLowerCase())
                        ).map((sme) => (
                          <button
                            key={sme.id}
                            type="button"
                            onClick={() => {
                              setPrimarySme(sme.name);
                              setShowPrimarySmeDropdown(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              primarySme === sme.name ? 'bg-[#eff4ff] text-[#004B87] font-bold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-[#0F172A]">{sme.name}</p>
                              <p className="text-[10px] text-[#64748B]">{sme.role}</p>
                            </div>
                            {primarySme === sme.name && (
                              <span className="material-symbols-outlined text-[14px] text-[#004B87]">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Lead technical owner in Onboarding Ledger and Customer Technical Sheet.
                </p>
              </div>

              {/* Secondary SME Searchable Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-[#1E293B] flex items-center justify-between">
                  <span>Secondary SME (Support Architect)</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Searchable</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSecondarySmeDropdown(!showSecondarySmeDropdown)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] flex items-center justify-between shadow-2xs hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                        {secondarySme.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{secondarySme}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-500">expand_more</span>
                  </button>

                  {showSecondarySmeDropdown && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-[#CBD5E1] p-2 z-30 animate-in fade-in">
                      <input
                        type="text"
                        placeholder="Search SME name or role..."
                        value={secondarySmeSearch}
                        onChange={(e) => setSecondarySmeSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F1F5F9] rounded-lg border-0 focus:ring-1 focus:ring-[#00b7f1] mb-2"
                      />
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {AVAILABLE_SMES.filter(
                          (s) =>
                            s.name.toLowerCase().includes(secondarySmeSearch.toLowerCase()) ||
                            s.role.toLowerCase().includes(secondarySmeSearch.toLowerCase())
                        ).map((sme) => (
                          <button
                            key={sme.id}
                            type="button"
                            onClick={() => {
                              setSecondarySme(sme.name);
                              setShowSecondarySmeDropdown(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              secondarySme === sme.name ? 'bg-[#eff4ff] text-[#004B87] font-bold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-[#0F172A]">{sme.name}</p>
                              <p className="text-[10px] text-[#64748B]">{sme.role}</p>
                            </div>
                            {secondarySme === sme.name && (
                              <span className="material-symbols-outlined text-[14px] text-[#004B87]">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Secondary escalation and technical peer reviewer.
                </p>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 07 — PROJECT TYPE */}
          {/* ============================================================== */}
          <section
            id="step-type"
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              activeStep === 7 ? 'ring-2 ring-[#00b7f1] border-[#00b7f1]' : 'border-[#E2E8F0]'
            }`}
          >
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#004B87] font-bold text-sm flex items-center justify-center border border-[#d3e4ff]">
                  07
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Project Type
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#004B87] border border-blue-100">
                      Lifecycle Classification
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Select project classification: New Implementation, Upgrade, or Journey to Cloud (J2C).
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-[#004B87] bg-[#eff4ff] px-3 py-1 rounded-full border border-[#d3e4ff]">
                Selected: {projectType}
              </span>
            </div>

            <div className="p-6">
              {/* 3 Segmented Radio Option Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    type: 'New Implementation',
                    icon: 'add_chart',
                    desc: 'Greenfield CATMAN deployment. Initial cloud tenant, database initialization, and base catalog seed.',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  },
                  {
                    type: 'Upgrade',
                    icon: 'upgrade',
                    desc: 'Version advancement (e.g. 2024 to 2026). Schema migrations, backwards-compatibility validation, and staging.',
                    badge: 'bg-blue-50 text-blue-700 border-blue-200',
                  },
                  {
                    type: 'J2C',
                    icon: 'cloud_sync',
                    desc: 'Journey to Cloud. Migration from legacy on-premises database and hosts into cloud-native VPC.',
                    badge: 'bg-purple-50 text-purple-700 border-purple-200',
                  },
                ].map((opt) => {
                  const isSelected = projectType === opt.type;

                  return (
                    <label
                      key={opt.type}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#004B87] bg-[#eff4ff]/70 shadow-sm ring-1 ring-[#004B87]'
                          : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`material-symbols-outlined text-[24px] ${
                              isSelected ? 'text-[#004B87]' : 'text-slate-500'
                            }`}
                          >
                            {opt.icon}
                          </span>
                          <span className="text-sm font-bold text-[#0F172A]">{opt.type}</span>
                        </div>
                        <input
                          type="radio"
                          name="projectTypeSelection"
                          checked={isSelected}
                          onChange={() => setProjectType(opt.type)}
                          className="w-4 h-4 text-[#004B87] focus:ring-[#00b7f1] cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">{opt.desc}</p>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* BOTTOM PRIMARY ACTION BAR: [ Submit & Save Details ] */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Ready to Provision Onboarding Request
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Saving will create the onboarding ledger project for{' '}
                <strong className="text-[#004B87]">{customerName}</strong> without duplicating records.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('customer-onboarding')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAndSave}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-[#004B87] via-[#0b5c9e] to-[#00b7f1] text-white text-xs font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isSubmitting ? 'sync' : 'task_alt'}
                </span>
                <span>{isSubmitting ? 'Submitting & Saving...' : 'Submit & Save Details'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBMISSION SUCCESS CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {submissionSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                Onboarding Request Created
              </span>
              <h2 className="text-xl font-bold text-[#0F172A] mt-1.5">
                {submissionSuccessData.project.customer} — {submissionSuccessData.project.projectNumber}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                The onboarding request has been registered and is now available in the Customer Onboarding Ledger.
              </p>
            </div>

            {/* Summary Highlights */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Customer Name:</span>
                <span className="font-bold text-[#0F172A]">{submissionSuccessData.project.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Customer Status:</span>
                <span className="font-semibold text-blue-700">
                  {submissionSuccessData.isExisting ? 'Existing Customer (No Duplicates)' : 'New Customer Registered'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Project Type:</span>
                <span className="font-bold text-[#0F172A]">{submissionSuccessData.project.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Voyager Size:</span>
                <span className="font-bold text-[#004B87]">{submissionSuccessData.project.tShirtSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Primary SME:</span>
                <span className="font-semibold text-[#0F172A]">{submissionSuccessData.project.projectL3}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">ServiceNow Ticket:</span>
                <span className="font-mono text-[#0F172A]">{submissionSuccessData.project.serviceNowTicket}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccessData(null);
                  onNavigate('customer-onboarding');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#004B87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                View in Customer Onboarding
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccessData(null);
                  onNavigate('customer-details', { customer: submissionSuccessData.project.customer });
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#d3e4ff] text-[#004B87] border border-[#d3e4ff] text-xs font-bold transition-all cursor-pointer"
              >
                View Customer Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
