import questionsData from '../data/questions.json';
import suggestionsData from '../data/suggestions.json';
import { getNestedValue, ResumeData } from './resumeEngine';

export interface QuestionDef {
  id: string;
  section: string;
  question: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  skipAllowed?: boolean;
  field?: string;
  recordSection?: string;
  recordField?: string;
  validationRule?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  suggestionsKey?: string;
  suggestions?: string[];
  optionsKey?: string;
  options?: Array<{ value: string; label: string; desc?: string }>;
  tip?: string;
}

export function getQuestionById(questionId: string): QuestionDef | undefined {
  return questionsData.questions.find((q) => q.id === questionId) as QuestionDef | undefined;
}

export function formatQuestionPrompt(questionDef: QuestionDef, resume: ResumeData, currentRecord?: any): string {
  let text = questionDef.question;

  // Substitute {personal.fullName}
  text = text.replace(/\{personal\.fullName\}/g, resume.personal.fullName || 'there');
  
  // Substitute other nested tokens if present
  text = text.replace(/\{([\w.]+)\}/g, (match, path) => {
    if (currentRecord && currentRecord[path]) {
      return currentRecord[path];
    }
    const val = getNestedValue(resume, path);
    return val !== undefined && val !== null && val !== '' ? String(val) : '';
  });

  return text;
}

export function getSuggestionsForQuestion(questionDef: QuestionDef, resume?: ResumeData): string[] {
  if (questionDef.suggestions && questionDef.suggestions.length > 0) {
    return questionDef.suggestions;
  }
  if (questionDef.suggestionsKey && (suggestionsData as any)[questionDef.suggestionsKey]) {
    return (suggestionsData as any)[questionDef.suggestionsKey];
  }
  return [];
}

export function getOptionsForQuestion(questionDef: QuestionDef): Array<{ value: string; label: string; desc?: string }> {
  if (questionDef.options && questionDef.options.length > 0) {
    return questionDef.options;
  }
  if (questionDef.optionsKey && (suggestionsData as any)[questionDef.optionsKey]) {
    const rawOptions = (suggestionsData as any)[questionDef.optionsKey];
    if (Array.isArray(rawOptions)) {
      if (typeof rawOptions[0] === 'string') {
        return rawOptions.map((opt: string) => ({ value: opt, label: opt }));
      }
      return rawOptions;
    }
  }
  return [];
}

export function getSummarySuggestions(experienceLevel: string = 'fresher'): Array<{ category: string; text: string }> {
  const isFresher = experienceLevel === 'fresher';
  const templates = suggestionsData.summaryTemplates || [];
  
  return templates
    .filter((t) => (isFresher ? t.level === 'fresher' : t.level === 'experienced'))
    .map((t) => ({ category: t.category, text: t.text }));
}
