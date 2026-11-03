import React, { useState, useEffect } from 'react';
import { Send, SkipForward, ArrowLeft, Plus, Check } from 'lucide-react';
import { QuestionDef, getSuggestionsForQuestion, getOptionsForQuestion, getSummarySuggestions } from '../engine/questionEngine';
import { validateInput } from '../engine/validationEngine';
import skillsData from '../data/skills.json';
import templatesData from '../data/templates.json';
import { ResumeData } from '../engine/resumeEngine';

interface ChatInputProps {
  question?: QuestionDef;
  resume: ResumeData;
  onSubmit: (answer: any) => void;
  onSkip?: () => void;
  onPrevious?: () => void;
  isSubmitting?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  question,
  resume,
  onSubmit,
  onSkip,
  onPrevious,
  isSubmitting = false,
}) => {
  const [textValue, setTextValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Skill selector state
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string[]>>({
    programmingLanguages: [],
    frontend: [],
    backend: [],
    databases: [],
    frameworks: [],
    tools: [],
    other: [],
  });
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('programmingLanguages');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Multi-tag selector state (languages, interests)
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  useEffect(() => {
    setTextValue('');
    setError(null);
    setCustomSkillInput('');
    setCustomTagInput('');

    if (question?.type === 'skill_selector') {
      setSelectedSkills(resume.skills || {
        programmingLanguages: [],
        frontend: [],
        backend: [],
        databases: [],
        frameworks: [],
        tools: [],
        other: [],
      });
    } else if (question?.type === 'multi_tag_selector') {
      const existing = (resume as any)[question.field || ''] || [];
      setTags(Array.isArray(existing) ? existing : []);
    } else if (question?.type === 'summary_generator') {
      setTextValue(resume.career.summary || '');
    }
  }, [question?.id]);

  const suggestions = question ? getSuggestionsForQuestion(question, resume) : [];
  const options = question ? getOptionsForQuestion(question) : [];

  const handleSend = (overrideValue?: any) => {
    let valueToValidate: any = overrideValue !== undefined ? overrideValue : textValue;

    if (question?.type === 'skill_selector') {
      valueToValidate = selectedSkills;
      const totalCount = Object.values(selectedSkills).reduce((acc, arr) => acc + arr.length, 0);
      if (question.required && totalCount === 0) {
        setError('Please select at least 3 skills to continue.');
        return;
      }
      setError(null);
      onSubmit(selectedSkills);
      return;
    }

    if (question?.type === 'multi_tag_selector') {
      valueToValidate = tags;
      if (question.required && tags.length === 0) {
        setError('Please select or add at least one item.');
        return;
      }
      setError(null);
      onSubmit(tags);
      return;
    }

    if (question) {
      const validationResult = validateInput(
        valueToValidate,
        question.validationRule,
        question.validation,
        question.required
      );

      if (!validationResult.isValid) {
        setError(validationResult.errorMessage || 'Please enter a valid answer.');
        return;
      }
    } else {
      if (!textValue.trim()) return;
    }

    setError(null);
    onSubmit(valueToValidate);
    setTextValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) return;
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSkill = (category: string, skill: string) => {
    setSelectedSkills((prev) => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(skill)
        ? currentList.filter((s) => s !== skill)
        : [...currentList, skill];
      return { ...prev, [category]: updated };
    });
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const skill = customSkillInput.trim();
    setSelectedSkills((prev) => {
      const currentList = prev[activeSkillCategory] || [];
      if (!currentList.includes(skill)) {
        return { ...prev, [activeSkillCategory]: [...currentList, skill] };
      }
      return prev;
    });
    setCustomSkillInput('');
  };

  const toggleTag = (item: string) => {
    setTags((prev) => (prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]));
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    const tag = customTagInput.trim();
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setCustomTagInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2">
      {/* Validation Error Message */}
      {error && (
        <div className="mb-2 text-xs font-semibold text-[#C77D86] px-3.5 py-1.5 rounded-xl neu-inset animate-fadeIn text-center">
          {error}
        </div>
      )}

      {/* 1. Skill Selector Overlay within bottom area */}
      {question?.type === 'skill_selector' && (
        <div className="mb-3 p-3.5 rounded-2xl neu-raised space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {skillsData.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveSkillCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium transition cursor-pointer ${
                  activeSkillCategory === cat.id
                    ? 'neu-pressed text-[#7776B8]'
                    : 'neu-button-secondary text-[#34364A]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {(() => {
            const currentCat = skillsData.categories.find((c) => c.id === activeSkillCategory);
            const currentSkills = currentCat ? currentCat.skills : [];
            const selectedInCat = selectedSkills[activeSkillCategory] || [];
            return (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {currentSkills.map((sk) => {
                    const isSelected = selectedInCat.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(activeSkillCategory, sk)}
                        className={`text-xs px-2.5 py-1 rounded-xl transition cursor-pointer font-medium flex items-center gap-1 ${
                          isSelected
                            ? 'neu-pressed text-[#6D9B83]'
                            : 'neu-subtle text-[#34364A]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#6D9B83]" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[#C8CAD4]/30">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder={`+ Add custom skill to ${currentCat?.name || 'category'}...`}
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl neu-input"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="text-xs px-3 py-1.5 neu-button-secondary text-[#7776B8] rounded-xl font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#7E8494]">
              Selected:{' '}
              <strong className="text-[#34364A]">
                {Object.values(selectedSkills).reduce((acc, arr) => acc + arr.length, 0)}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => handleSend()}
              className="text-xs px-4 py-2 neu-button-primary rounded-xl font-bold cursor-pointer"
            >
              Confirm Skills
            </button>
          </div>
        </div>
      )}

      {/* 2. Options Chips for radio/boolean choice */}
      {question && (question.type === 'radio_cards' || question.type === 'boolean_choice') && (
        <div className="mb-2.5 flex flex-wrap gap-2 justify-center">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSend(opt.value)}
              className="text-xs px-3.5 py-2 rounded-xl neu-raised hover:neu-raised-hover active:neu-pressed text-[#34364A] hover:text-[#7776B8] font-semibold cursor-pointer transition"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* 3. Predefined Suggestion Chips */}
      {suggestions.length > 0 && question?.type !== 'skill_selector' && (
        <div className="mb-2 flex flex-wrap gap-1.5 justify-center max-h-20 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTextValue(s)}
              className="text-[11px] px-2.5 py-1 rounded-xl neu-subtle hover:neu-raised text-[#7E8494] hover:text-[#34364A] cursor-pointer transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 4. Multi-tag Chips (Languages, Interests) */}
      {question?.type === 'multi_tag_selector' && (
        <div className="mb-2.5 p-3 rounded-2xl neu-raised space-y-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-xl neu-inset text-[#34364A] font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="text-[#7E8494] hover:text-[#C77D86] cursor-pointer text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Type and add or pick suggestions above..."
              className="flex-1 text-xs px-3 py-1.5 rounded-xl neu-input"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="text-xs px-3 py-1.5 neu-button-secondary text-[#7776B8] rounded-xl font-semibold cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => handleSend()}
              className="text-xs px-3.5 py-1.5 neu-button-primary rounded-xl font-bold cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* 5. Summary Generator Options */}
      {question?.type === 'summary_generator' && (
        <div className="mb-2.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {getSummarySuggestions(resume.career.experienceLevel).map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTextValue(tpl.text)}
              className="text-[11px] px-2.5 py-1 rounded-xl neu-subtle text-[#34364A] hover:text-[#7776B8] text-left line-clamp-1 cursor-pointer"
            >
              ✦ {tpl.category}
            </button>
          ))}
        </div>
      )}

      {/* One Large ChatGPT-Style Chat Input Box */}
      {question?.type !== 'skill_selector' && (
        <div className="relative flex items-center rounded-2xl neu-inset bg-[#E9EAF2] p-1.5 pl-3 sm:pl-4 transition-all min-w-0">
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question?.placeholder || "Message ResumeCraft..."}
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-[#34364A] placeholder:text-[#7E8494] focus:outline-none pr-1.5 sm:pr-2 py-2 sm:py-2.5"
            autoFocus
          />

          <div className="flex items-center gap-1 sm:gap-1.5 pr-0.5 sm:pr-1 shrink-0">
            {question?.skipAllowed && onSkip && (
              <button
                type="button"
                onClick={onSkip}
                title="Skip optional question"
                className="text-[11px] sm:text-xs text-[#7E8494] hover:text-[#34364A] px-2 py-1.5 rounded-xl hover:neu-subtle transition cursor-pointer min-h-[36px] flex items-center"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isSubmitting || (question?.required && !textValue.trim())}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl neu-button-primary disabled:opacity-40 flex items-center justify-center cursor-pointer transition shrink-0 min-h-[36px] min-w-[36px]"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
