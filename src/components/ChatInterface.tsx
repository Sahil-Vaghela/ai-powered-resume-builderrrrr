import React, { useRef, useEffect } from 'react';
import {
  Menu,
  Layout,
  FileText,
  FilePlus2,
  Lightbulb,
  Eye,
  PanelLeft,
} from 'lucide-react';
import { ChatMessageItem } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatMessage } from '../engine/conversationEngine';
import { QuestionDef } from '../engine/questionEngine';
import { ResumeData } from '../engine/resumeEngine';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentQuestion: QuestionDef;
  resume: ResumeData;
  isTyping: boolean;
  onAnswer: (answer: any) => void;
  onSkip: () => void;
  onPrevious?: () => void;
  onEditMessage: (message: ChatMessage) => void;
  onOpenTemplates: () => void;
  onOpenPreview: () => void;
  onStartNewResume: () => void;
  onContinuePrevious: () => void;
  hasStarted: boolean;
  setHasStarted: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentQuestion,
  resume,
  isTyping,
  onAnswer,
  onSkip,
  onPrevious,
  onEditMessage,
  onOpenTemplates,
  onOpenPreview,
  onStartNewResume,
  onContinuePrevious,
  hasStarted,
  setHasStarted,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, currentQuestion.id, hasStarted]);

  // Handler for action cards
  const handleActionClick = (action: string) => {
    if (action === 'new') {
      onStartNewResume();
      setHasStarted(true);
    } else if (action === 'templates') {
      onOpenTemplates();
    } else if (action === 'continue') {
      onContinuePrevious();
      setHasStarted(true);
    } else if (action === 'tips') {
      setHasStarted(true);
      onAnswer("Tell me the top ATS resume tips to get interviews");
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0 bg-[#E9EAF2] overflow-hidden relative">
      {/* Top Header */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 border-b border-[#C8CAD4]/30 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu toggle (320px - 767px) */}
          <button
            onClick={onOpenMobileMenu}
            title="Open menu"
            className="flex md:hidden p-2 rounded-xl neu-button-secondary text-[#34364A] hover:text-[#7776B8] cursor-pointer shrink-0 min-h-[40px] min-w-[40px] items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop/Tablet collapse button toggle */}
          {isSidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              title="Expand sidebar"
              className="hidden md:flex p-2 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#34364A] cursor-pointer shrink-0"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-[#34364A] tracking-tight truncate">
              ResumeCraft Assistant
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {hasStarted && (
            <button
              onClick={onOpenPreview}
              title="View full resume document"
              className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl neu-button-secondary text-[#34364A] hover:text-[#7776B8] flex items-center gap-1 sm:gap-1.5 cursor-pointer min-h-[36px]"
            >
              <Eye className="w-3.5 h-3.5 text-[#7776B8]" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={onOpenTemplates}
            title="Browse resume templates"
            className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-xl neu-button-secondary text-[#34364A] hover:text-[#7776B8] flex items-center gap-1 sm:gap-1.5 cursor-pointer min-h-[36px]"
          >
            <Layout className="w-3.5 h-3.5 text-[#7776B8]" />
            <span className="hidden xs:inline">Templates</span>
          </button>
        </div>
      </header>

      {/* Main Center Area */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 w-full min-w-0">
        {!hasStarted ? (
          /* Welcome Screen (ChatGPT-style center view) */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center max-w-5xl mx-auto my-auto animate-fadeIn select-none w-full min-w-0">
            {/* Logo Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl neu-raised flex items-center justify-center text-[#7776B8] font-black text-xl sm:text-2xl mb-4 sm:mb-6 shrink-0 shadow-sm">
              RC
            </div>

            {/* Responsive Heading with clamp() */}
            <h1 className="text-clamp-heading font-extrabold text-[#34364A] tracking-tight mb-2 sm:mb-3 max-w-2xl px-2">
              How can I help you build your resume today?
            </h1>

            {/* Subtitle */}
            <p className="text-clamp-subheading text-[#7E8494] max-w-lg mb-6 sm:mb-10 px-3 font-normal">
              A guided, step-by-step conversation to create your professional resume.
            </p>

            {/* Quick Action Cards:
                - Desktop (1200px+): 1 horizontal row (xl:grid-cols-4)
                - Laptop & Tablet (768px-1199px): 2x2 grid (sm:grid-cols-2 lg:grid-cols-4)
                - Mobile (320px-767px): 1 column on narrow (grid-cols-1), 2 columns on sm (sm:grid-cols-2)
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl px-2">
              <button
                onClick={() => handleActionClick('new')}
                className="p-3.5 sm:p-4 rounded-2xl neu-raised hover:neu-raised-hover active:neu-pressed text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[92px]"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl neu-inset text-[#7776B8] flex items-center justify-center shrink-0">
                    <FilePlus2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#34364A] group-hover:text-[#7776B8] leading-tight">
                    Create a New Resume
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#7E8494] pl-10 leading-snug">
                  Start fresh with guided questions for your experience.
                </p>
              </button>

              <button
                onClick={() => handleActionClick('templates')}
                className="p-3.5 sm:p-4 rounded-2xl neu-raised hover:neu-raised-hover active:neu-pressed text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[92px]"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl neu-inset text-[#7776B8] flex items-center justify-center shrink-0">
                    <Layout className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#34364A] group-hover:text-[#7776B8] leading-tight">
                    Browse Templates
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#7E8494] pl-10 leading-snug">
                  Explore 6 modern, ATS-friendly document formats.
                </p>
              </button>

              <button
                onClick={() => handleActionClick('continue')}
                className="p-3.5 sm:p-4 rounded-2xl neu-raised hover:neu-raised-hover active:neu-pressed text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[92px]"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl neu-inset text-[#7776B8] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#34364A] group-hover:text-[#7776B8] leading-tight">
                    Continue Previous
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#7E8494] pl-10 leading-snug">
                  Resume from where you left off or inspect draft.
                </p>
              </button>

              <button
                onClick={() => handleActionClick('tips')}
                className="p-3.5 sm:p-4 rounded-2xl neu-raised hover:neu-raised-hover active:neu-pressed text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[92px]"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl neu-inset text-[#7776B8] flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#34364A] group-hover:text-[#7776B8] leading-tight">
                    Resume Tips
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#7E8494] pl-10 leading-snug">
                  Action verbs and recruiter-approved formatting advice.
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Chat Mode: Conversation Messages with comfortable responsive spacing */
          <div className="w-full max-w-3xl mx-auto p-3 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 min-w-0">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} onEdit={onEditMessage} />
            ))}

            {/* Current Active Bot Question */}
            {!isTyping && currentQuestion && (
              <div className="flex items-start gap-2.5 sm:gap-3 my-2.5 sm:my-3 justify-start animate-fadeIn min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neu-raised text-[#7776B8] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  RC
                </div>

                <div className="max-w-[88%] sm:max-w-[78%] flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider">
                      ResumeCraft
                    </span>
                  </div>

                  <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl neu-raised text-xs sm:text-sm leading-relaxed text-[#34364A] break-words overflow-hidden w-full">
                    <div className="font-semibold whitespace-pre-line text-[#34364A]">
                      {currentQuestion.question}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#7E8494] py-2 animate-fadeIn">
                <div className="w-7 h-7 rounded-xl neu-raised text-[#7776B8] flex items-center justify-center text-xs font-bold shrink-0">
                  RC
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl neu-inset">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7776B8] animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#7776B8] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#7776B8] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Chat Input Container with safe area support */}
      <div className="shrink-0 w-full safe-pb">
        <ChatInput
          question={hasStarted ? currentQuestion : undefined}
          resume={resume}
          onSubmit={(answer) => {
            if (!hasStarted) {
              setHasStarted(true);
            }
            onAnswer(answer);
          }}
          onSkip={hasStarted && currentQuestion?.skipAllowed ? onSkip : undefined}
          onPrevious={hasStarted ? onPrevious : undefined}
          isSubmitting={isTyping}
        />
      </div>
    </div>
  );
};
