import { UserWrongQuestion, AnswerKey } from '../types';

export const RECOVERY_STREAK_REQUIRED = 2;

/**
 * Updates or creates a UserWrongQuestion record upon answering a question.
 * Follows Master Prompt Section 9:
 * - When incorrect: increment wrongCount, reset correctStreak to 0, status is 'needs_review'
 * - When correct: increment correctStreak. If streak >= 2, status becomes 'recovered'
 * - Previous history is never lost.
 */
export function processQuestionAnswerForWrongList(
  existingRecord: UserWrongQuestion | undefined,
  userId: string,
  questionId: string,
  topicId: string,
  selectedAnswer: AnswerKey,
  isCorrect: boolean,
  timestamp: string = new Date().toISOString()
): UserWrongQuestion | null {
  if (!isCorrect) {
    if (!existingRecord) {
      return {
        id: `wq_${userId}_${questionId}`,
        userId,
        questionId,
        topicId,
        wrongCount: 1,
        correctStreak: 0,
        lastWrongAt: timestamp,
        lastSelectedAnswer: selectedAnswer,
        status: 'needs_review'
      };
    } else {
      return {
        ...existingRecord,
        wrongCount: existingRecord.wrongCount + 1,
        correctStreak: 0,
        lastWrongAt: timestamp,
        lastSelectedAnswer: selectedAnswer,
        status: 'needs_review'
      };
    }
  }

  // Answer was correct:
  if (existingRecord) {
    const newStreak = existingRecord.correctStreak + 1;
    const isNowRecovered = newStreak >= RECOVERY_STREAK_REQUIRED;
    return {
      ...existingRecord,
      correctStreak: newStreak,
      lastCorrectAt: timestamp,
      status: isNowRecovered ? 'recovered' : 'needs_review'
    };
  }

  // User answered correctly and had no existing wrong record: no wrong entry needed
  return null;
}
