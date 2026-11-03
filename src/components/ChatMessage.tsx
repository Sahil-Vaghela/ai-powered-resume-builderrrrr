import React from 'react';
import { Bot, User, Pencil } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../engine/conversationEngine';

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit?: (message: ChatMessageType) => void;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({ message, onEdit }) => {
  const isBot = message.sender === 'bot';

  return (
    <div
      className={`group flex items-start gap-2.5 sm:gap-3 my-2.5 sm:my-3 min-w-0 ${
        isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      {isBot && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neu-raised text-[#7776B8] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      )}

      <div
        className={`max-w-[88%] sm:max-w-[78%] flex flex-col min-w-0 ${
          isBot ? 'items-start' : 'items-end'
        }`}
      >
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider">
            {isBot ? 'ResumeCraft' : 'You'}
          </span>
          <span className="text-[10px] text-[#7E8494]">{message.timestamp}</span>

          {!isBot && message.isEditable && onEdit && (
            <button
              onClick={() => onEdit(message)}
              title="Edit this answer"
              className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[#7E8494] hover:text-[#7776B8] p-1 rounded cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>

        <div
          className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all break-words overflow-hidden ${
            isBot
              ? 'neu-raised text-[#34364A]'
              : 'neu-button-primary text-white font-medium'
          }`}
        >
          <div className="whitespace-pre-line break-words">{message.text}</div>
        </div>
      </div>

      {!isBot && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neu-inset text-[#7776B8] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      )}
    </div>
  );
};
