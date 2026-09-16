import React from 'react';

export const LearnScreen = ({ onNavigate }) => {
  const LEARNING_SECTIONS = [
    {
      id: 'section-product-recordings',
      iconEmoji: '🎥',
      materialIcon: 'smart_display',
      title: 'Product Recorded Videos',
      description: 'Access recorded CATMAN product learning and onboarding sessions.',
      sourceLabel: 'SharePoint — CATMAN Support Site',
      sourceBadgeColor: 'bg-[#eff4ff] text-[#004B87] border-[#d3e4ff]',
      folderPath: 'Accelerated Onboarding → Recordings',
      url: 'https://jda365.sharepoint.com/sites/a_Catman-Support-Site/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2Fa%5FCatman%2DSupport%2DSite%2FShared%20Documents%2FAccelerated%20Onboarding%2FRecordings&viewid=13467b13%2D32f0%2D427d%2D9eec%2Da55330a58557',
      actionText: 'View Recordings',
      btnGradient: 'from-[#004B87] to-[#0070BA] hover:from-[#003966] hover:to-[#005a96]',
    },
    {
      id: 'section-kt-videos',
      iconEmoji: '📚',
      materialIcon: 'local_library',
      title: 'Recorded KT Videos',
      description: 'Access recorded Knowledge Transfer and onboarding sessions.',
      sourceLabel: 'SharePoint — CATMAN Onboarding Site',
      sourceBadgeColor: 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]',
      folderPath: 'Project Handbook → Reference Documents → Training Documents',
      url: 'https://jda365.sharepoint.com/sites/a_CatmanOnboardingSite/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2Fa%5FCatmanOnboardingSite%2FShared%20Documents%2FProject%20Handbook%2FReference%20Documents%2FTraining%20Documents&viewid=871b5e77%2Dcf03%2D4786%2D845e%2D7d3eb6c585c6&csf=1&TeamsCID=a07cf5db%2D421d%2D493d%2D89ae%2D596ed1e0821f&cidOR=SPO&FolderCTID=0x012000AE6245FFA9177C4584F91D41C635CD4F&CT=1782833837203&OR=OWA%2DNT%2DMail&CID=014ce7d1%2Dae9e%2D5f15%2D7dea%2D5033a3227b4e&SI=NonSentItems',
      actionText: 'View KT Videos',
      btnGradient: 'from-[#006688] to-[#0099bb] hover:from-[#004f6a] hover:to-[#00809d]',
    },
    {
      id: 'section-sky-learning',
      iconEmoji: '🎓',
      materialIcon: 'school',
      title: 'Sky Learning — CATMAN Courses',
      description: 'Explore CATMAN courses and learning programs available through Sky Learning.',
      sourceLabel: 'Blue Yonder Sky Learning Portal',
      sourceBadgeColor: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
      folderPath: 'Blue Yonder LMS Learner Home → Category Management Curriculum',
      url: 'https://blueyonder.csod.com/ui/lms-learner-home/home?tab_page_id=-200300006&tab_id=-1',
      actionText: 'Open Sky Learning',
      btnGradient: 'from-[#004B87] to-[#00b7f1] hover:from-[#003966] hover:to-[#00a3d7]',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5FAFD] pb-24">
      <div className="px-6 sm:px-8 py-8 flex flex-col gap-6 max-w-[1100px] mx-auto w-full">
        {/* Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#e6eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#004B87] font-bold">
                Knowledge & Training Hub
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b7f1]"></span>
              <span className="text-xs text-[#6d7980]">CATMAN Learning Centers</span>
            </div>
            <h1 className="text-[26px] text-[#121c2a] font-bold tracking-tight">
              Learning & Training Resources
            </h1>
            <p className="text-xs sm:text-sm text-[#3d484f] mt-1 max-w-2xl leading-relaxed">
              Official Blue Yonder training portals, recorded product deep-dives, and knowledge transfer sessions for Category Management practitioners.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#004B87] hover:bg-[#e6eeff] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto border border-[#d3e4ff]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Dashboard
          </button>
        </div>

        {/* 3 Learning Sections (Vertical Layout) */}
        <div className="flex flex-col gap-6">
          {LEARNING_SECTIONS.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl shadow-sm border border-[#e6eeff] hover:border-[#c2daf8] transition-all p-6 sm:p-7 flex flex-col gap-5 relative overflow-hidden group"
            >
              {/* Decorative Accent Top Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004B87] via-[#00b7f1] to-[#004B87] opacity-70 group-hover:opacity-100 transition-opacity" />

              {/* Header row with source and path */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${section.sourceBadgeColor}`}>
                    {section.sourceLabel}
                  </span>
                  <span className="text-[11px] text-[#6d7980] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">folder_open</span>
                    {section.folderPath}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#d8e8fc] border border-[#d3e4ff] flex items-center justify-center shrink-0 shadow-xs">
                    <span className="text-2xl select-none" role="img" aria-label={section.title}>
                      {section.iconEmoji}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-[19px] sm:text-[20px] text-[#121c2a] font-bold tracking-tight">
                      {section.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#3d484f] mt-1 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="shrink-0 pt-2 sm:pt-0">
                  <a
                    href={section.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r ${section.btnGradient} text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap`}
                  >
                    <span>{section.actionText}</span>
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
