import { ResumeData, INITIAL_RESUME_DATA } from './resumeEngine';
import sampleResume from '../data/sample-resume.json';

const STORAGE_KEYS = {
  RESUME: 'resumecraft_resume_data',
  CURRENT_STEP: 'resumecraft_current_step',
  MESSAGES: 'resumecraft_chat_messages',
  CURRENT_RECORD: 'resumecraft_current_record',
};

export function saveResumeToStorage(data: ResumeData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save resume to localStorage', err);
  }
}

export function loadResumeFromStorage(): ResumeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUME);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load resume from localStorage', err);
  }
  return null;
}

export function saveConversationState(currentStepId: string, messages: any[], currentRecord: any = {}): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStepId);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEYS.CURRENT_RECORD, JSON.stringify(currentRecord));
  } catch (err) {
    console.error('Failed to save conversation state to localStorage', err);
  }
}

export function loadConversationState(): { currentStepId: string | null; messages: any[] | null; currentRecord: any | null } {
  try {
    const step = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
    const rawMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const rawRecord = localStorage.getItem(STORAGE_KEYS.CURRENT_RECORD);
    return {
      currentStepId: step || null,
      messages: rawMessages ? JSON.parse(rawMessages) : null,
      currentRecord: rawRecord ? JSON.parse(rawRecord) : null,
    };
  } catch (err) {
    console.error('Failed to load conversation state', err);
    return { currentStepId: null, messages: null, currentRecord: null };
  }
}

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RESUME);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_RECORD);
  } catch (err) {
    console.error('Failed to clear localStorage', err);
  }
}

export function hasSavedProgress(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.RESUME));
  } catch {
    return false;
  }
}

export function getSampleResume(): ResumeData {
  return sampleResume as ResumeData;
}
