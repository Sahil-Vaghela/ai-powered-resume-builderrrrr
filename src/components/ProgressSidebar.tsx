import React from 'react';
import {
  MessageSquare,
  Layout,
  FileText,
  Plus,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onNewResume: () => void;
  onSelectChat: () => void;
  onOpenTemplates: () => void;
  onOpenMyResumes: () => void;
  activeTab: 'chat' | 'templates' | 'resumes';
  hasResumeData: boolean;
}

export const ProgressSidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onNewResume,
  onSelectChat,
  onOpenTemplates,
  onOpenMyResumes,
  activeTab,
  hasResumeData,
}) => {
  // Mobile item click handler (triggers action and closes mobile drawer)
  const handleItemClick = (callback: () => void) => {
    callback();
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 select-none">
      <div>
        {/* Header with Logo and Close/Collapse */}
        <div className="flex items-center justify-between mb-5 px-1 min-h-[44px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl neu-raised flex items-center justify-center text-[#7776B8] font-bold text-xs shrink-0">
              RC
            </div>
            <span className="font-bold text-base text-[#34364A] tracking-tight truncate">
              ResumeCraft
            </span>
          </div>

          {/* Desktop/Tablet collapse button */}
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="hidden md:flex p-2 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#34364A] cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            title="Close menu"
            className="flex md:hidden p-2 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#34364A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Resume Button */}
        <button
          onClick={() => handleItemClick(onNewResume)}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl neu-button-primary text-xs font-semibold text-white mb-5 cursor-pointer transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Resume</span>
        </button>

        {/* Navigation Items */}
        <div className="space-y-2">
          <button
            onClick={() => handleItemClick(onSelectChat)}
            className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'neu-pressed text-[#7776B8]'
                : 'neu-subtle text-[#34364A] hover:text-[#7776B8]'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Chat with ResumeCraft</span>
          </button>

          <button
            onClick={() => handleItemClick(onOpenTemplates)}
            className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'neu-pressed text-[#7776B8]'
                : 'neu-subtle text-[#34364A] hover:text-[#7776B8]'
            }`}
          >
            <Layout className="w-4 h-4 shrink-0" />
            <span className="truncate">Resume Templates</span>
          </button>

          <button
            onClick={() => handleItemClick(onOpenMyResumes)}
            className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'resumes'
                ? 'neu-pressed text-[#7776B8]'
                : 'neu-subtle text-[#34364A] hover:text-[#7776B8]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">My Resumes</span>
            </div>
            {hasResumeData && (
              <span className="w-2 h-2 rounded-full bg-[#6D9B83] shrink-0" title="Active resume available" />
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-1 text-[11px] text-[#7E8494] font-medium safe-pb">
        <span>ResumeCraft • Soft UI</span>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#34364A]/30 backdrop-blur-xs md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer (Slide-in) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] max-w-[85vw] bg-[#E9EAF2] border-r border-[#C8CAD4]/40 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* 3. Desktop / Tablet In-Flow Sidebar */}
      {isCollapsed ? (
        <aside className="hidden md:flex w-16 h-full bg-[#E9EAF2] border-r border-[#C8CAD4]/40 flex-col items-center py-4 select-none shrink-0 transition-all duration-200">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="w-10 h-10 rounded-xl neu-button-secondary flex items-center justify-center text-[#34364A] hover:text-[#7776B8] mb-6 cursor-pointer"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onNewResume}
            title="New Resume"
            className="w-10 h-10 rounded-xl neu-button-primary flex items-center justify-center text-white mb-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="space-y-3 flex flex-col items-center">
            <button
              onClick={onSelectChat}
              title="Chat with ResumeCraft"
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                activeTab === 'chat'
                  ? 'neu-pressed text-[#7776B8]'
                  : 'neu-button-secondary text-[#7E8494] hover:text-[#34364A]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTemplates}
              title="Resume Templates"
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                activeTab === 'templates'
                  ? 'neu-pressed text-[#7776B8]'
                  : 'neu-button-secondary text-[#7E8494] hover:text-[#34364A]'
              }`}
            >
              <Layout className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenMyResumes}
              title="My Resumes"
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                activeTab === 'resumes'
                  ? 'neu-pressed text-[#7776B8]'
                  : 'neu-button-secondary text-[#7E8494] hover:text-[#34364A]'
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </aside>
      ) : (
        <aside className="hidden md:flex md:w-[210px] lg:w-[220px] xl:w-[250px] h-full bg-[#E9EAF2] border-r border-[#C8CAD4]/40 flex-col select-none shrink-0 transition-all duration-200 overflow-hidden">
          {navContent}
        </aside>
      )}
    </>
  );
};
