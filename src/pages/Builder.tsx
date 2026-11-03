import React, { useState, useEffect } from 'react';
import { ProgressSidebar } from '../components/ProgressSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { ResumePreview } from '../components/ResumePreview';
import { TemplateSelector } from '../components/TemplateSelector';
import { ResumeEditor } from '../components/ResumeEditor';
import {
  ResumeData,
  INITIAL_RESUME_DATA,
} from '../engine/resumeEngine';
import {
  ChatMessage,
  getInitialQuestionId,
  processAnswer,
  getSectionForQuestion,
} from '../engine/conversationEngine';
import {
  getQuestionById,
  formatQuestionPrompt,
  QuestionDef,
} from '../engine/questionEngine';
import {
  saveResumeToStorage,
  loadResumeFromStorage,
  saveConversationState,
  loadConversationState,
  clearAllStorage,
  getSampleResume,
} from '../engine/storageEngine';
import sectionsData from '../data/resume-sections.json';
import chatbotResponses from '../data/chatbot-responses.json';
import { X } from 'lucide-react';

interface BuilderProps {
  onBackToHome?: () => void;
  initialResumeData?: ResumeData;
}

export const Builder: React.FC<BuilderProps> = ({ initialResumeData }) => {
  // Centralized Resume State
  const [resume, setResume] = useState<ResumeData>(() => {
    if (initialResumeData) return initialResumeData;
    const saved = loadResumeFromStorage();
    return saved || INITIAL_RESUME_DATA;
  });

  // Conversation Question History for Previous button
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);

  // Current Question ID
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(() => {
    const savedState = loadConversationState();
    return savedState.currentStepId || getInitialQuestionId();
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedState = loadConversationState();
    if (savedState.messages && savedState.messages.length > 0) {
      return savedState.messages;
    }
    return [
      {
        id: 'msg-greeting-1',
        sender: 'bot',
        text: chatbotResponses.greetings[0],
        timestamp: 'Just now',
      },
    ];
  });

  // Has started chat state (welcome screen vs active chat)
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    const saved = loadResumeFromStorage();
    if (saved && saved.personal && saved.personal.fullName) return true;
    const savedState = loadConversationState();
    if (savedState.messages && savedState.messages.some((m: ChatMessage) => m.sender === 'user')) {
      return true;
    }
    return false;
  });

  const [currentRecord, setCurrentRecord] = useState<any>(() => {
    const savedState = loadConversationState();
    return savedState.currentRecord || {};
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    saveResumeToStorage(resume);
  }, [resume]);

  useEffect(() => {
    saveConversationState(currentQuestionId, messages, currentRecord);
  }, [currentQuestionId, messages, currentRecord]);

  const currentQuestionRaw = getQuestionById(currentQuestionId) || getQuestionById('full_name')!;
  const activeQuestionPrompt = formatQuestionPrompt(currentQuestionRaw, resume, currentRecord);
  const currentQuestion: QuestionDef = {
    ...currentQuestionRaw,
    question: activeQuestionPrompt,
  };

  // Check if resume has any user filled info
  const hasResumeData = Boolean(
    resume.personal.fullName ||
    resume.career.summary ||
    resume.education.length > 0 ||
    resume.experience.length > 0
  );

  // Handler: User submits an answer
  const handleAnswer = (answer: any) => {
    setIsTyping(true);
    setQuestionHistory((prev) => [...prev, currentQuestionId]);

    const result = processAnswer(
      currentQuestion,
      answer,
      resume,
      currentRecord,
      messages
    );

    setResume(result.updatedResume);
    setMessages(result.updatedMessages);
    setCurrentRecord(result.updatedCurrentRecord);

    setTimeout(() => {
      setIsTyping(false);

      if (result.nextQuestionId) {
        setCurrentQuestionId(result.nextQuestionId);

        const nextQ = getQuestionById(result.nextQuestionId);
        if (nextQ && nextQ.section !== currentQuestion.section) {
          const transitionText =
            (chatbotResponses.sectionTransitions as any)[nextQ.section] ||
            chatbotResponses.encouragements[0];
          
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-trans-${Date.now()}`,
              sender: 'bot',
              text: transitionText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else {
        setCurrentQuestionId('review_complete');
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-done-${Date.now()}`,
            sender: 'bot',
            text: chatbotResponses.allDone,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        // Open resume preview modal upon completion
        setShowResumeModal(true);
      }
    }, 350);
  };

  // Handler: User skips an optional question
  const handleSkip = () => {
    setQuestionHistory((prev) => [...prev, currentQuestionId]);

    const skippedMessage: ChatMessage = {
      id: `msg-user-skip-${Date.now()}`,
      sender: 'user',
      text: 'Skipped this step',
      questionId: currentQuestion.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(true);
    setMessages((prev) => [...prev, skippedMessage]);

    setTimeout(() => {
      setIsTyping(false);

      const result = processAnswer(
        currentQuestion,
        '',
        resume,
        currentRecord,
        messages
      );

      setResume(result.updatedResume);
      if (result.nextQuestionId) {
        setCurrentQuestionId(result.nextQuestionId);
      } else {
        setCurrentQuestionId('review_complete');
      }
    }, 250);
  };

  // Handler: Previous button
  const handlePrevious = () => {
    if (questionHistory.length === 0) return;
    const prevHistory = [...questionHistory];
    const prevQId = prevHistory.pop();
    setQuestionHistory(prevHistory);

    if (prevQId) {
      setCurrentQuestionId(prevQId);
    }
  };

  // Handler: Edit previous message
  const handleEditMessage = (message: ChatMessage) => {
    if (message.questionId) {
      setCurrentQuestionId(message.questionId);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-bot-edit-${Date.now()}`,
          sender: 'bot',
          text: `Let's update that answer. Please type or select your correction below:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Handler: New Resume
  const handleStartNewResume = () => {
    clearAllStorage();
    setResume(INITIAL_RESUME_DATA);
    setCurrentRecord({});
    setQuestionHistory([]);
    setCurrentQuestionId(getInitialQuestionId());
    setHasStarted(true);
    setMessages([
      {
        id: `msg-greet-new-${Date.now()}`,
        sender: 'bot',
        text: "Let's build your new resume! What is your full name?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Handler: Continue Previous Resume
  const handleContinuePrevious = () => {
    const saved = loadResumeFromStorage();
    if (saved) {
      setResume(saved);
    }
    setHasStarted(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#E9EAF2] font-sans">
      {/* 1. LEFT SIDEBAR (Desktop/Tablet in-flow, Mobile slide-in drawer) */}
      <ProgressSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onNewResume={handleStartNewResume}
        onSelectChat={() => {
          setShowResumeModal(false);
        }}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenMyResumes={() => setShowResumeModal(true)}
        activeTab={showResumeModal ? 'resumes' : 'chat'}
        hasResumeData={hasResumeData}
      />

      {/* 2. MAIN CHATGPT-STYLE WORKSPACE */}
      <main className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative">
        <ChatInterface
          messages={messages}
          currentQuestion={currentQuestion}
          resume={resume}
          isTyping={isTyping}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onPrevious={questionHistory.length > 0 ? handlePrevious : undefined}
          onEditMessage={handleEditMessage}
          onOpenTemplates={() => setShowTemplatesModal(true)}
          onOpenPreview={() => setShowResumeModal(true)}
          onStartNewResume={handleStartNewResume}
          onContinuePrevious={handleContinuePrevious}
          hasStarted={hasStarted}
          setHasStarted={setHasStarted}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </main>

      {/* Templates Selector Modal */}
      {showTemplatesModal && (
        <TemplateSelector
          currentTemplateId={resume.template}
          onSelect={(tplId) => {
            setResume((prev) => ({ ...prev, template: tplId }));
            setShowTemplatesModal(false);
          }}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {/* My Resumes / View Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-[#34364A]/50 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn">
          <div className="bg-[#E9EAF2] w-full max-w-5xl h-full sm:h-[92vh] sm:rounded-3xl neu-raised flex flex-col overflow-hidden border-0 sm:border border-[#C8CAD4]/40 shadow-2xl">
            {/* Modal Top Bar */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[#C8CAD4]/40 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-bold text-xs sm:text-sm text-[#34364A]">Resume Document</span>
                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full neu-inset text-[#7776B8] font-bold uppercase tracking-wider">
                  {resume.template}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowEditorModal(true)}
                  className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl neu-button-secondary text-[#34364A] cursor-pointer"
                >
                  Edit Data
                </button>

                <button
                  onClick={() => setShowResumeModal(false)}
                  title="Close resume view"
                  className="p-1.5 rounded-xl neu-button-secondary text-[#7E8494] hover:text-[#34364A] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Resume Document & Export Tools */}
            <div className="flex-1 overflow-hidden">
              <ResumePreview
                resume={resume}
                onSelectTemplate={(tplId) =>
                  setResume((prev) => ({ ...prev, template: tplId }))
                }
                onOpenEditor={() => setShowEditorModal(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Direct Resume Editor Modal */}
      {showEditorModal && (
        <ResumeEditor
          resume={resume}
          onSave={(updated) => setResume(updated)}
          onClose={() => setShowEditorModal(false)}
        />
      )}
    </div>
  );
};
