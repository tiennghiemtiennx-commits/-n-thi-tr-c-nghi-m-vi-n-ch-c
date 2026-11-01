/**
 * TypeScript Type Definitions for OnVienChucBacNinh
 * Nền tảng Ôn Thi Viên Chức Bắc Ninh
 */

export type Role = 'admin' | 'user';

export type Difficulty = 'Dễ' | 'Trung bình' | 'Khó';

export type AnswerKey = 'A' | 'B' | 'C' | 'D';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'suspended';
  avatar?: string;
  phone?: string;
  password?: string;
}

export interface Topic {
  topicId: string;
  code: string;
  name: string;
  legalDocument: string;
  documentNumber: string;
  description: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export interface Question {
  questionId: string;
  topicId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: AnswerKey;
  difficulty: Difficulty;
  explanation?: string;
  legalReference?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'draft';
}

export type AttemptType = 'topic_practice' | 'topic_exam' | 'random_exam' | 'wrong_recovery';

export interface AttemptAnswer {
  questionId: string;
  topicId: string;
  selectedAnswer: AnswerKey | null;
  correctAnswerSnapshot: AnswerKey;
  questionSnapshot: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    explanation?: string;
    legalReference?: string;
    difficulty: Difficulty;
  };
  isCorrect: boolean;
  answeredAt: string;
  flagged?: boolean;
}

export interface Attempt {
  attemptId: string;
  userId: string;
  title: string;
  attemptType: AttemptType;
  topicIds: string[];
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number; // Formula: (correctCount / totalQuestions) * 10
  accuracy: number; // In percent (0 - 100)
  durationSeconds: number;
  startedAt: string;
  submittedAt: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  answers: AttemptAnswer[];
}

export interface UserWrongQuestion {
  id: string;
  userId: string;
  questionId: string;
  topicId: string;
  wrongCount: number;
  correctStreak: number;
  lastWrongAt: string;
  lastCorrectAt?: string;
  lastSelectedAnswer: AnswerKey;
  status: 'needs_review' | 'recovered';
}

export type MasteryLevel = 'Chưa đủ dữ liệu' | 'Chưa thành thạo' | 'Đang học' | 'Khá' | 'Thành thạo' | 'Rất thành thạo';

export interface UserTopicProgress {
  userId: string;
  topicId: string;
  totalAttempts: number;
  uniqueQuestionsAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number; // 0 - 100
  consistency: number; // 0 - 100
  recovery: number; // 0 - 100
  difficultyCoverage: number; // 0 - 100
  masteryScore: number; // 0 - 100
  masteryLevel: MasteryLevel;
  isEligible: boolean; // >= 10 unique questions
  updatedAt: string;
}

export interface ImportRowError {
  row: number;
  message: string;
  field?: string;
}

export interface ParsedExcelRow {
  rowNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: AnswerKey;
  difficulty: Difficulty;
  explanation?: string;
  legalReference?: string;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
  duplicateOf?: string;
}

export interface ImportHistoryRecord {
  importId: string;
  adminId: string;
  adminName: string;
  topicId: string;
  topicName: string;
  fileName: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  importMode: 'append' | 'replace';
  importedAt: string;
  status: 'completed' | 'failed' | 'partial';
}

export interface StudyRecommendation {
  id: string;
  type: 'urgent' | 'warning' | 'positive' | 'tip';
  title: string;
  description: string;
  topicId?: string;
  actionText?: string;
  actionType?: 'practice_topic' | 'review_wrong' | 'random_exam';
}
