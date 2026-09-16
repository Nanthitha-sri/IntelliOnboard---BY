import React, { useState } from 'react';
import { BOT_ICON } from '../data/mockData';

export const TalkWithOBScreen = ({ onNavigate }) => {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hi, I'm OB 👋 How can I help you today?",
      timestamp: 'Just now',
      actionButtons: [
        { label: 'Customer Summary', action: () => handleSendPrompt('Customer Summary') },
        { label: 'Onboarding Status', action: () => handleSendPrompt('Onboarding Status') },
        { label: 'Project Details', action: () => handleSendPrompt('Project Details') },
        { label: 'Server Details', action: () => handleSendPrompt('Server Details') },
        { label: 'Find Customer', action: () => handleSendPrompt('Find Customer') },
        { label: 'ServiceNow Tickets', action: () => handleSendPrompt('ServiceNow Tickets') },
      ],
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSendPrompt = (prompt) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      let botResponse = '';
      let buttons = undefined;

      const lower = prompt.toLowerCase();

      if (lower.includes('customer summary') || (lower.includes('summary') && !lower.includes('project'))) {
        botResponse =
          "Here is the high-level summary of all 15 demo customer accounts:\n\n" +
          "• Total Accounts: Exactly 15 demo customers (Customer 1 to Customer 15)\n" +
          "• Total Onboarding Projects: 15 active/transitioned projects in the ledger\n" +
          "• Project Type Breakdown: 5 New Implementations, 5 Upgrades, 5 J2C migrations\n" +
          "• Execution Health: 10 projects currently In Progress, 5 Completed & Transitioned\n" +
          "• Technical Fleet: 15 dedicated customer sheets across DEV, TEST, and PROD environments.";
        buttons = [
          { label: 'Open Customer Onboarding', action: () => onNavigate('customer-onboarding') },
          { label: 'View Customer 1 Details', action: () => onNavigate('customer-details', { customer: 'Customer 1' }) },
          { label: 'Open Server Details', action: () => onNavigate('server-details') },
        ];
      } else if (lower.includes('onboarding status') || lower.includes('status')) {
        botResponse =
          "Current Onboarding Status across the 15 project ledger rows:\n\n" +
          "• New Implementation (5 projects): 3 In Progress, 2 Completed\n" +
          "• Upgrade (5 projects): 4 In Progress, 1 Completed\n" +
          "• J2C - Journey to Cloud (5 projects): 3 In Progress, 2 Completed\n\n" +
          "All milestones are running on schedule with 100% SLA adherence. Transition handoffs to Tier-1/Premier support POCs are active.";
        buttons = [
          { label: 'Go to Customer Onboarding', action: () => onNavigate('customer-onboarding') },
          { label: 'View Customer Details', action: () => onNavigate('customer-details', { customer: 'Customer 1' }) },
        ];
      } else if (lower.includes('project details') || lower.includes('project')) {
        botResponse =
          "Project-level ledger records for demo customers:\n\n" +
          "• Customer 1: 2 Projects (2026.1 Upgrade & 2025.2 New Implementation)\n" +
          "• Customer 2: 2 Projects (2026.1 Upgrade & 2025.4 J2C)\n" +
          "• Customer 3: 1 Project (2026.2 J2C migration to AWS Cloud)\n" +
          "• Customer 4: 1 Project (2026.1 New Implementation on Azure)\n" +
          "• Customer 5: 2 Projects (2025.3 New Implementation & 2026.3 Upgrade)\n" +
          "• Customer 6 - Customer 15: 1 Dedicated project each across BY Cloud and Azure Cloud.";
        buttons = [
          { label: 'Customer 1 Details', action: () => onNavigate('customer-details', { customer: 'Customer 1' }) },
          { label: 'Customer 2 Details', action: () => onNavigate('customer-details', { customer: 'Customer 2' }) },
          { label: 'Open Onboarding Ledger', action: () => onNavigate('customer-onboarding') },
        ];
      } else if (lower.includes('server details') || lower.includes('server') || lower.includes('fleet') || lower.includes('infrastructure')) {
        botResponse =
          "Server Details technical architecture for Customer 1 through Customer 15:\n\n" +
          "• Tabbed Customer Sheets: 15 isolated worksheets\n" +
          "• Environments: DEV, TEST, and PROD configurations per customer\n" +
          "• Infrastructure Parameters: Hostnames, IP addresses, OS versions, vCPU counts, Memory allocations, and DB ports\n" +
          "• Installed Applications: Category Management suite (Space Planning, Floor Planning, CKB, Planogram Generator).\n\n" +
          "You can view or modify server specifications directly in the Server Details section.";
        buttons = [
          { label: 'Open Server Details', action: () => onNavigate('server-details') },
          { label: 'Customer 1 Servers', action: () => onNavigate('server-details', { customer: 'Customer 1' }) },
          { label: 'Customer 2 Servers', action: () => onNavigate('server-details', { customer: 'Customer 2' }) },
        ];
      } else if (lower.includes('find customer') || lower.includes('find')) {
        botResponse =
          "Select any demo customer to navigate directly to their Customer Details or Server Details:";
        buttons = [
          { label: 'Customer 1', action: () => onNavigate('customer-details', { customer: 'Customer 1' }) },
          { label: 'Customer 2', action: () => onNavigate('customer-details', { customer: 'Customer 2' }) },
          { label: 'Customer 3', action: () => onNavigate('customer-details', { customer: 'Customer 3' }) },
          { label: 'Customer 4', action: () => onNavigate('customer-details', { customer: 'Customer 4' }) },
          { label: 'Customer 5', action: () => onNavigate('customer-details', { customer: 'Customer 5' }) },
          { label: 'View All Onboarding', action: () => onNavigate('customer-onboarding') },
        ];
      } else if (lower.includes('servicenow') || lower.includes('ticket') || lower.includes('snow')) {
        botResponse =
          "Active ServiceNow operational tickets across demo customers:\n\n" +
          "• INC-09412: SSL certificate validation for Customer 1 (PROD) - Status: In Progress (Assigned: Rachel Adams)\n" +
          "• CHG-08102: Memory sizing optimization for Customer 3 (TEST) - Status: Scheduled for weekend maintenance\n" +
          "• INC-09384: DB connection pool expansion for Customer 5 (PROD) - Status: Resolved\n" +
          "• RITM-04192: License subscription scaling for Customer 7 - Status: Approved";
        buttons = [
          { label: 'Inspect Customer 1 Server', action: () => onNavigate('server-details', { customer: 'Customer 1' }) },
          { label: 'Inspect Customer 3 Server', action: () => onNavigate('server-details', { customer: 'Customer 3' }) },
          { label: 'Open Customer Onboarding', action: () => onNavigate('customer-onboarding') },
        ];
      } else if (lower.includes('customer 1') || lower.includes('customer 2') || lower.includes('customer 3') || lower.includes('customer 4') || lower.includes('customer 5')) {
        const match = lower.match(/customer\s*([0-9]+)/);
        const custNum = match ? match[1] : '1';
        const custName = `Customer ${custNum}`;
        botResponse =
          `Record details for ${custName}:\n\n` +
          `• Account: ${custName}\n` +
          `• Status: Active Demo Account\n` +
          `• Onboarding: View project ledger, deliverables, TAM, and milestones in Customer Details.\n` +
          `• Server Infrastructure: DEV, TEST, and PROD server configurations available in Server Details.`;
        buttons = [
          { label: `View ${custName} Details`, action: () => onNavigate('customer-details', { customer: custName }) },
          { label: `View ${custName} Servers`, action: () => onNavigate('server-details', { customer: custName }) },
        ];
      } else {
        botResponse = `Understood. Processing your inquiry regarding "${prompt}". I've audited our active pipeline: all 15 demo customer onboardings (Customer 1 to Customer 15) are tracked, SLA conformance is 100%, and server sheets are updated across all environments.`;
        buttons = [
          { label: 'Customer Summary', action: () => handleSendPrompt('Customer Summary') },
          { label: 'Onboarding Status', action: () => handleSendPrompt('Onboarding Status') },
          { label: 'Server Details', action: () => handleSendPrompt('Server Details') },
        ];
      }

      const reply = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: 'Just now',
        actionButtons: buttons,
      };
      setMessages((prev) => [...prev, reply]);
    }, 450);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5FAFD] pb-24">
      <div className="px-6 sm:px-8 py-8 flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e6eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={BOT_ICON}
              alt="Bot"
              className="w-12 h-12 rounded-2xl p-2 bg-[#004B87] object-contain shadow-md"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
              }}
            />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] text-[#121c2a] font-bold">Talk with OB</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold">
                  AI Active
                </span>
              </div>
              <p className="text-xs text-[#3d484f]">
                Intelligent onboarding operational copilot. Query project status, server parameters, or navigate directly.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl bg-[#eff4ff] text-[#004B87] text-xs font-bold hover:bg-[#e6eeff] transition-colors cursor-pointer self-start sm:self-auto"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Chat Thread */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e6eeff] p-6 flex flex-col h-[580px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#004B87] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#004B87] to-[#00b7f1] text-white font-medium rounded-br-none'
                      : 'bg-[#eff4ff] text-[#121c2a] border border-[#e6eeff] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.actionButtons && m.actionButtons.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#d3e4ff]/60 flex flex-wrap gap-2">
                      {m.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={btn.action}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#dee9fc] text-[#004B87] text-xs font-bold shadow-xs transition-colors cursor-pointer border border-[#d3e4ff] flex items-center gap-1"
                        >
                          <span>{btn.label}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <span
                    className={`block text-[10px] mt-2 text-right ${
                      m.sender === 'user' ? 'text-white/70' : 'text-[#6d7980]'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputVal.trim()) handleSendPrompt(inputVal.trim());
            }}
            className="mt-4 pt-4 border-t border-[#e6eeff] flex items-center gap-3"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask OB anything about Customer 1 - 15, onboarding milestones, or servers..."
              className="flex-1 px-4 py-3 bg-[#eff4ff] rounded-xl text-sm text-[#121c2a] focus:bg-white focus:ring-2 focus:ring-[#00b7f1] outline-none border border-[#e6eeff] transition-all"
            />

            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#004B87] to-[#00b7f1] text-white text-sm font-bold shadow-sm hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
