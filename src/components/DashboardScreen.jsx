import React, { useState } from 'react';
import { HOSTING_MODEL_IMG, INITIAL_ACTIVITIES } from '../data/mockData';

export const DashboardScreen = ({ onNavigate, searchQuery = '' }) => {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [activeStageFilter, setActiveStageFilter] = useState(null);
  const [showSunsetModal, setShowSunsetModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Filter activities if search query is provided
  const filteredActivities = activities.filter((act) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      act.title.toLowerCase().includes(q) ||
      act.target.toLowerCase().includes(q) ||
      act.user.toLowerCase().includes(q)
    );
  });

  const lifecycleStages = [
    { name: 'Planning', count: 6, percentage: '4.2%', height: '12%', color: 'from-[#006688] to-[#00b7f1]' },
    { name: 'Provisioning', count: 8, percentage: '5.6%', height: '16%', color: 'from-[#006491] to-[#37b4f9]' },
    { name: 'Testing', count: 9, percentage: '6.3%', height: '18%', color: 'from-[#004B87] to-[#27609d]' },
    { name: 'Go Live', count: 3, percentage: '2.1%', height: '7%', color: 'from-[#004d67] to-[#006688]' },
    { name: 'Hypercare', count: 4, percentage: '2.8%', height: '9%', color: 'from-[#006491] to-[#c9e6ff]' },
    { name: 'Completed', count: 89, percentage: '62.7%', height: '89%', color: 'from-[#22C55E] to-[#22C55E]/75', isCompleted: true },
    { name: 'Decom', count: 3, percentage: '2.1%', height: '7%', color: 'from-[#6d7980] to-[#bcc8d0]' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5FAFD] pb-20">
      <div className="px-8 py-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* KPI Cards Grid - 7 Gradient Cards with High Contrast Visible Fonts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 lg:gap-5">
          
          {/* 1. Total Customers */}
          <div
            onClick={() => onNavigate('customer-details')}
            className="bg-gradient-to-br from-[#004B87] via-[#005FA3] to-[#007AC2] rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,75,135,0.15)] hover:shadow-[0_12px_24px_rgba(0,75,135,0.25)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group cursor-pointer border border-white/20"
          >
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-[12px] uppercase tracking-wider text-white/90 font-bold">
                Total Customers
              </span>
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-white leading-none tracking-tight drop-shadow-xs">
                42
              </span>
            </div>
          </div>

          {/* 2. Active Projects */}
          <div
            onClick={() => onNavigate('customer-onboarding')}
            className="bg-gradient-to-br from-[#00529B] via-[#026AA7] to-[#0098D8] rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,82,155,0.15)] hover:shadow-[0_12px_24px_rgba(0,82,155,0.25)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group cursor-pointer border border-white/20"
          >
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-[12px] uppercase tracking-wider text-white/90 font-bold">
                Active Projects
              </span>
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
                <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-white leading-none tracking-tight drop-shadow-xs">
                28
              </span>
            </div>
          </div>

          {/* 3. Pending Onboardings */}
          <div
            onClick={() => onNavigate('start-new-ob')}
            className="bg-gradient-to-br from-[#006688] via-[#0284C7] to-[#00B7F1] rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,102,136,0.15)] hover:shadow-[0_12px_24px_rgba(0,102,136,0.25)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group cursor-pointer border border-white/20"
          >
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-[12px] uppercase tracking-wider text-white/90 font-bold">
                Pending Onboardings
              </span>
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
                <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-white leading-none tracking-tight drop-shadow-xs">
                7
              </span>
            </div>
          </div>

          {/* 4. Projects in Hypercare */}
          <div className="bg-gradient-to-br from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] rounded-2xl p-5 shadow-[0_4px_16px_rgba(2,132,199,0.15)] hover:shadow-[0_12px_24px_rgba(2,132,199,0.25)] transition-all duration-300 relative overflow-hidden group border border-white/20">
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-[12px] uppercase tracking-wider text-white/90 font-bold">
                In Hypercare
              </span>
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
                <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-white leading-none tracking-tight drop-shadow-xs">
                4
              </span>
            </div>
          </div>

          {/* 5. On Hold */}
          <div
            onClick={() => onNavigate('customer-onboarding')}
            className="bg-gradient-to-br from-[#B45309] via-[#D97706] to-[#F59E0B] rounded-2xl p-5 shadow-[0_4px_16px_rgba(217,119,6,0.15)] hover:shadow-[0_12px_24px_rgba(217,119,6,0.25)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group cursor-pointer border border-white/20"
          >
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-[12px] uppercase tracking-wider text-white/90 font-bold">
                On Hold
              </span>
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
                <span className="material-symbols-outlined text-[20px]">pause_circle</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-white leading-none tracking-tight drop-shadow-xs">
                3
              </span>
            </div>
          </div>

          {/* 6. Completed Projects */}
          <div className="bg-gradient-to-br from-[#047857] via-[#059669] to-[#10B981] rounded-2xl p-5 shadow-[0_4px_16px_rgba(5,150,105,0.15)] hover:shadow-[0_12px_24px_rgba(5,150,105,0.25)] transition-all duration-300 relative overflow-hidden group border border-white/20">
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-[12px] uppercase tracking-wider text-white/90 font-bold">
                Completed Projects
              </span>
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-white leading-none tracking-tight drop-shadow-xs">
                89
              </span>
            </div>
          </div>

          {/* 7. Decommission Projects */}
          <div
            onClick={() => setShowSunsetModal(true)}
            className="bg-gradient-to-br from-[#334155] via-[#475569] to-[#64748B] rounded-2xl p-5 shadow-[0_4px_16px_rgba(71,85,105,0.15)] hover:shadow-[0_12px_24px_rgba(71,85,105,0.25)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group cursor-pointer border border-white/20"
          >
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-[12px] uppercase tracking-wider text-white/90 font-bold">
                Decommissioned
              </span>
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
                <span className="material-symbols-outlined text-[20px]">layers_clear</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-white leading-none tracking-tight drop-shadow-xs">
                3
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Split: 8 Analytics Modules & Activity Stream */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: 8 Operational Analytics Cards */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Row 1: Pipeline Lifecycle (Full Width in column) */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,75,135,0.05)] border border-[#e6eeff] flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[20px] text-[#121c2a] font-bold">Project Lifecycle Status</h2>
                </div>
                <div className="flex items-center gap-2"></div>
              </div>

              {/* Bar Chart Representation */}
              <div className="pt-4 flex flex-col gap-3">
                <div className="relative w-full h-48 bg-[#eff4ff]/60 rounded-xl p-4 flex items-end justify-between gap-3 sm:gap-4 border border-[#e6eeff]">
                  <div className="absolute inset-x-4 top-6 border-b border-[#bcc8d0]/30 pointer-events-none flex justify-between text-[10px] text-[#6d7980] font-mono"></div>
                  <div className="absolute inset-x-4 top-24 border-b border-[#bcc8d0]/20 pointer-events-none flex justify-between text-[10px] text-[#6d7980] font-mono">
                    <span>(50)</span>
                  </div>

                  {lifecycleStages.map((stage) => {
                    const isSelected = activeStageFilter === stage.name;
                    return (
                      <div
                        key={stage.name}
                        onClick={() => setActiveStageFilter(stage.name === activeStageFilter ? null : stage.name)}
                        className={`flex-1 h-full flex flex-col justify-end items-center group relative z-10 cursor-pointer transition-transform hover:-translate-y-0.5 ${
                          isSelected ? 'scale-105' : ''
                        }`}
                      >
                        <div className="mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                          <span
                            className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shadow-sm ring-1 ${
                              stage.isCompleted
                                ? 'text-[#22C55E] bg-[#22C55E]/10 ring-[#22C55E]/30'
                                : 'text-[#004B87] bg-white ring-[#E5E7EB]'
                            }`}
                          >
                            {stage.count}
                          </span>
                        </div>
                        <div className="w-full max-w-[38px] bg-[#d9e3f6]/60 rounded-t-lg h-32 flex items-end p-0.5 relative">
                          <div
                            className={`w-full bg-gradient-to-t ${stage.color} rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-sm`}
                            style={{ height: stage.height }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage Labels Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pt-1">
                  {lifecycleStages.map((stage) => (
                    <div key={stage.name} className="flex flex-col items-center gap-0.5">
                      <span
                        className={`text-xs font-semibold truncate w-full ${
                          stage.isCompleted ? 'text-[#22C55E]' : 'text-[#121c2a]'
                        }`}
                      >
                        {stage.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#6d7980]">{stage.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Customers by Region & Hosting Model (2 Col) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Customers by Region */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,75,135,0.05)] border border-[#e6eeff] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-[18px] text-[#121c2a] font-bold mb-4">Customers by Region</h2>
                    <span className="font-mono text-xs text-[#3d484f] font-semibold">42 Total</span>
                  </div>
                  
                  <div className="flex flex-col gap-3.5">
                    {/* US */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#121c2a]">United States</span>
                        <span className="font-mono font-semibold text-[#004B87]">24 (57%)</span>
                      </div>
                      <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#004B87] to-[#00b7f1] h-full rounded-full" style={{ width: '57%' }}></div>
                      </div>
                    </div>
                    {/* Europe */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#121c2a]">Europe</span>
                        <span className="font-mono font-semibold text-[#004B87]">11 (26%)</span>
                      </div>
                      <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#27609d] h-full rounded-full" style={{ width: '26%' }}></div>
                      </div>
                    </div>
                    {/* Australia */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#121c2a]">Australia</span>
                        <span className="font-mono font-semibold text-[#004B87]">4 (10%)</span>
                      </div>
                      <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#37b4f9] h-full rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                    {/* Asia Pacific */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#121c2a]">Asia Pacific</span>
                        <span className="font-mono font-semibold text-[#004B87]">3 (7%)</span>
                      </div>
                      <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#006688] h-full rounded-full" style={{ width: '7%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Hosting Model Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,75,135,0.05)] border border-[#e6eeff] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1"></div>
                  <h2 className="text-[18px] text-[#121c2a] font-bold mb-3">Hosting Model Distribution</h2>
                  <div className="flex items-center gap-4 my-2">
                    <img
                      alt="Hosting Model Topology"
                      className="w-20 h-20 object-contain rounded-xl bg-[#eff4ff] p-1.5 shrink-0 shadow-inner border border-[#e6eeff]"
                      src={HOSTING_MODEL_IMG}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%2300b7f1" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>';
                      }}
                    />
                    
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-[#121c2a] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#00b7f1]"></span>
                          BY Cloud
                        </span>
                        <span className="font-mono font-bold text-[#004B87]">52%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-[#121c2a] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#27609d]"></span>
                          Azure Cloud
                        </span>
                        <span className="font-mono font-bold text-[#004B87]">38%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-[#121c2a] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#6d7980]"></span>
                          On-Premise
                        </span>
                        <span className="font-mono font-bold text-[#3d484f]">10%</span>
                      </div>
                    </div>
                  </div>
                  {/* Segmented Bar */}
                  <div className="w-full bg-[#eff4ff] h-3 rounded-full overflow-hidden flex mt-3">
                    <div className="bg-[#00b7f1] h-full" style={{ width: '52%' }} title="BY Cloud 52%"></div>
                    <div className="bg-[#27609d] h-full" style={{ width: '38%' }} title="Azure Cloud 38%"></div>
                    <div className="bg-[#6d7980] h-full" style={{ width: '10%' }} title="On-Premise 10%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Recent Operational Activities Feed */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            {/* Activities Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,75,135,0.05)] border border-[#e6eeff] flex flex-col">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#eff4ff] text-[#27609d]">
                    <span className="material-symbols-outlined text-[20px]">dynamic_feed</span>
                  </span>
                  <h2 className="text-[18px] text-[#121c2a] font-bold">Recent Activities</h2>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" title="Live Stream Active"></span>
              </div>
              <p className="text-xs text-[#3d484f] mb-4">Audited engineering and operational events log.</p>

              {/* Timeline Container */}
              <div className="relative flex flex-col gap-3">
                {filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onNavigate('customer-onboarding')}
                    className="p-3.5 rounded-xl bg-white hover:bg-[#eff4ff] transition-all shadow-sm flex flex-col gap-1 cursor-pointer group border border-[#e6eeff]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#27609d] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#27609d]"></span>
                        {act.title}
                      </span>
                      <span className="font-mono text-xs text-[#6d7980]">{act.timeAgo}</span>
                    </div>
                    <p className="text-sm text-[#121c2a]">
                      {act.description} <span className="font-semibold text-[#004B87] group-hover:underline">{act.target}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#3d484f] font-mono mt-1">
                      <span className="material-symbols-outlined text-[14px]">
                        {act.avatarIcon || 'account_circle'}
                      </span>
                      <span>{act.user}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#e6eeff]">
                <span className="font-mono text-xs text-[#6d7980]">
                  Viewing {filteredActivities.length} of 148 logs
                </span>
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="text-xs uppercase tracking-wider text-[#006688] hover:text-[#004B87] font-bold transition-colors cursor-pointer"
                  type="button"
                >
                  Full Audit Trail →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sunsetting Protocol Modal */}
      {showSunsetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e6eeff]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff]">
              <div className="flex items-center gap-2 text-[#27609d]">
                <span className="material-symbols-outlined text-[24px]">layers_clear</span>
                <h3 className="font-bold text-lg">Sunsetting Protocol Status</h3>
              </div>
              <button
                onClick={() => setShowSunsetModal(false)}
                className="text-[#6d7980] hover:text-[#121c2a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm text-[#3d484f]">
              <p>The following systems are staged for final deprecation:</p>
              <div className="space-y-2">
                <div className="p-3 bg-[#eff4ff] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#121c2a]">Legacy Host A9</span>
                    <p className="text-[11px] text-[#6d7980]">Final cold storage archive complete</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold">
                    Purge in 6 days
                  </span>
                </div>
                <div className="p-3 bg-[#eff4ff] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#121c2a]">DC-Cluster-Old</span>
                    <p className="text-[11px] text-[#6d7980]">Snapshot verified on Azure Blob Storage</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] font-bold">
                    Snapshot Done
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-[#e6eeff]">
              <button
                onClick={() => setShowSunsetModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#27609d] rounded-xl shadow cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e6eeff]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff]">
              <div className="flex items-center gap-2 text-[#004B87]">
                <span className="material-symbols-outlined text-[24px]">history</span>
                <h3 className="font-bold text-lg">Full Operational Audit Log</h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-[#6d7980] hover:text-[#121c2a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-4 max-h-96 overflow-y-auto space-y-2 text-xs font-mono">
              {activities.map((act) => (
                <div key={act.id} className="p-2.5 rounded-lg bg-[#eff4ff] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#004B87]">{act.title}</span>: {act.description} {act.target}
                    <div className="text-[10px] text-[#6d7980]">{act.user}</div>
                  </div>
                  <span className="text-[#6d7980]">{act.timeAgo}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-3 border-t border-[#e6eeff]">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#004B87] rounded-xl shadow cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
