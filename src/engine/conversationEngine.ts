import flowData from '../data/conversation-flow.json';
import chatbotResponses from '../data/chatbot-responses.json';
import { getQuestionById, QuestionDef } from './questionEngine';
import { ResumeData, setNestedValue } from './resumeEngine';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  questionId?: string;
  field?: string;
  timestamp: string;
  type?: string;
  data?: any;
  isEditable?: boolean;
}

export interface ConversationStepResult {
  nextQuestionId: string | null;
  updatedResume: ResumeData;
  updatedMessages: ChatMessage[];
  updatedCurrentRecord: any;
  isCompleted: boolean;
}

export function getInitialQuestionId(): string {
  return flowData.startQuestionId;
}

export function determineNextQuestionId(
  currentQuestionId: string,
  userAnswer: any,
  resume: ResumeData,
  currentRecord: any = {}
): string | null {
  const step = flowData.steps.find((s) => s.questionId === currentQuestionId);
  if (!step) return null;

  // Check conditions if any
  if (step.conditions && step.conditions.length > 0) {
    for (const rawCond of step.conditions) {
      const cond = rawCond as any;
      if (cond.answerEquals !== undefined) {
        if (String(userAnswer).toLowerCase() === String(cond.answerEquals).toLowerCase()) {
          return cond.next;
        }
      }
      if (cond.contextCheck && currentRecord[cond.contextCheck] !== undefined) {
        if (Boolean(currentRecord[cond.contextCheck]) === true) {
          return cond.next;
        }
      }
    }
  }

  // If answer was "no" on a check or repeat question, or standard flow
  if (step.defaultNext === 'DONE') {
    return null;
  }

  return step.defaultNext;
}

// Generate an encouraging prefix or reaction
export function getRandomEncouragement(): string {
  const list = chatbotResponses.encouragements;
  return list[Math.floor(Math.random() * list.length)];
}

// Process a submitted answer
export function processAnswer(
  currentQuestion: QuestionDef,
  userAnswer: any,
  currentResume: ResumeData,
  currentRecord: any = {},
  existingMessages: ChatMessage[] = []
): ConversationStepResult {
  let updatedResume = { ...currentResume };
  let updatedRecord = { ...currentRecord };

  // 1. Handle repeating records vs direct fields
  if (currentQuestion.recordSection && currentQuestion.recordField) {
    const section = currentQuestion.recordSection as keyof ResumeData;
    const field = currentQuestion.recordField;

    // Check if user is answering a boolean choice like currentlyStudying/currentlyWorking
    if (field === 'status') {
      updatedRecord.currentlyStudying = userAnswer === 'current';
    } else if (field === 'currentlyWorking') {
      updatedRecord.currentlyWorking = userAnswer === 'yes' || userAnswer === true;
    } else {
      updatedRecord[field] = userAnswer;
    }

    // Check if this question commits the record (e.g. edu_grade, exp_responsibilities, proj_contributions, cert_url, achieve_year)
    // Or if moving to a repeat ask
    if (
      currentQuestion.id === 'edu_grade' ||
      currentQuestion.id === 'exp_responsibilities' ||
      currentQuestion.id === 'proj_contributions' ||
      currentQuestion.id === 'cert_url' ||
      currentQuestion.id === 'achieve_year'
    ) {
      const recordWithId = {
        id: updatedRecord.id || `${section}-${Date.now()}`,
        ...updatedRecord,
      };

      const existingArray = (updatedResume[section] as any[]) || [];
      const index = existingArray.findIndex((item) => item.id === recordWithId.id);

      if (index >= 0) {
        const copy = [...existingArray];
        copy[index] = recordWithId;
        updatedResume = { ...updatedResume, [section]: copy };
      } else {
        updatedResume = {
          ...updatedResume,
          [section]: [...existingArray, recordWithId],
        };
      }
      // Reset current record for potential next one
      updatedRecord = {};
    }
  } else if (currentQuestion.field) {
    // Normal direct nested path, e.g. "personal.fullName" or "skills"
    if (currentQuestion.field === 'skills') {
      updatedResume = {
        ...updatedResume,
        skills: { ...updatedResume.skills, ...(userAnswer || {}) },
      };
    } else if (currentQuestion.field === 'template') {
      updatedResume = {
        ...updatedResume,
        template: userAnswer || 'modern',
      };
    } else {
      updatedResume = setNestedValue(updatedResume, currentQuestion.field, userAnswer);
    }
  }

  // 2. Format user answer display text for the chat bubble
  let userDisplayText = String(userAnswer);
  if (currentQuestion.type === 'skill_selector') {
    const totalSelected = Object.values(userAnswer || {}).reduce(
      (sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    userDisplayText = `Selected ${totalSelected} technical skills`;
  } else if (Array.isArray(userAnswer)) {
    userDisplayText = userAnswer.join(', ');
  } else if (typeof userAnswer === 'boolean') {
    userDisplayText = userAnswer ? 'Yes' : 'No';
  } else if (currentQuestion.type === 'radio_cards' || currentQuestion.type === 'boolean_choice') {
    if (currentQuestion.options) {
      const match = currentQuestion.options.find((o) => o.value === userAnswer);
      if (match) userDisplayText = match.label;
    }
  }

  // 3. Create user chat message
  const userMessage: ChatMessage = {
    id: `msg-user-${Date.now()}`,
    sender: 'user',
    text: userDisplayText,
    questionId: currentQuestion.id,
    field: currentQuestion.field || currentQuestion.recordField,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isEditable: !['edu_repeat_ask', 'exp_repeat_ask', 'proj_repeat_ask', 'cert_repeat_ask', 'achieve_repeat_ask'].includes(currentQuestion.id),
  };

  // 4. Calculate next question ID
  const nextQuestionId = determineNextQuestionId(
    currentQuestion.id,
    userAnswer,
    updatedResume,
    updatedRecord
  );

  const updatedMessages = [...existingMessages, userMessage];

  return {
    nextQuestionId,
    updatedResume,
    updatedMessages,
    updatedCurrentRecord: updatedRecord,
    isCompleted: nextQuestionId === null,
  };
}

export function getSectionForQuestion(questionId: string): string {
  const q = getQuestionById(questionId);
  return q ? q.section : 'personal';
}
