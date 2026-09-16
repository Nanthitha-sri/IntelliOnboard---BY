import React, { useState } from 'react';
import { BOT_ICON } from '../data/mockData';





export const FloatingAssistant = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickResponse, setQuickResponse] = useState(null);

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    if (quickInput.toLowerCase().includes('customer 1')) {
      setQuickResponse('Customer 1 has 2 onboarding projects (Upgrade & New Implementation). Target go-live: Nov 30, 2026.');
    } else if (quickInput.toLowerCase().includes('server') || quickInput.toLowerCase().includes('fleet')) {
      setQuickResponse('15 demo customer worksheets configured across DEV, TEST, and PROD. All nodes operating normally.');
    } else {
      setQuickResponse(`OB audited "${quickInput}". All 15 demo customer onboarding engagements are within SLA thresholds.`);
    }
  };

  return (
    <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Expanded Quick Chat Window */}
      {isOpen &&
      <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#e6eeff] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e6eeff]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-xs font-bold text-[#121c2a]">IntelliOnboard AI Assistant</span>
            </div>
            <button
            onClick={() => setIsOpen(false)}
            className="text-[#6d7980] hover:text-[#121c2a] cursor-pointer">
            
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <p className="text-xs text-[#3d484f] leading-relaxed">
            Need help with SOW intake, sizing matrices, or customer status? Ask below or open full assistant.
          </p>

          {quickResponse &&
        <div className="p-3 bg-[#eff4ff] rounded-xl text-xs text-[#004B87] font-medium border border-[#e6eeff]">
              {quickResponse}
            </div>
        }

          <form onSubmit={handleQuickAsk} className="flex items-center gap-2">
            <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-2 text-xs bg-[#eff4ff] rounded-xl outline-none border border-[#e6eeff] focus:bg-white text-[#121c2a]" />
          
            <button
            type="submit"
            className="p-2 bg-[#004B87] text-white rounded-xl hover:bg-[#27609d] cursor-pointer">
            
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#e6eeff] flex justify-between items-center text-xs">
            <button
            onClick={() => {
              setIsOpen(false);
              onNavigate('talk-with-ob');
            }}
            className="text-[#006688] font-bold hover:underline flex items-center gap-1 cursor-pointer">
            
              <span>Open Full Assistant</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
            <span className="text-[10px] text-[#6d7980] font-mono">AI v2.4.1</span>
          </div>
        </div>
      }

      {/* Floating Pill & Launcher Button */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-[#e6eeff] text-xs font-semibold text-[#121c2a] cursor-pointer hover:shadow-xl transition-all">
          
          <span className="w-2 h-2 rounded-full bg-[#00b7f1] animate-ping"></span>
          <span>How can I help you?</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Assistant"
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#004B87] via-[#27609d] to-[#00b7f1] p-0.5 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer ring-4 ring-white">
          
          <div className="w-full h-full rounded-full bg-[#004B87] flex items-center justify-center overflow-hidden p-2">
            <img
              src={BOT_ICON}
              alt="Bot"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect x="4" y="8" width="16" height="12" rx="2"/><circle cx="9" cy="13" r="1.5"/><circle cx="15" cy="13" r="1.5"/></svg>';
              }} />
            
          </div>
        </button>
      </div>
    </div>);

};