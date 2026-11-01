import { MasteryLevel, UserTopicProgress, Attempt } from '../types';

export interface MasteryInput {
  userId: string;
  topicId: string;
  uniqueQuestionIdsAnswered: string[];
  totalAnswersCount: number;
  correctAnswersCount: number;
  recentAttemptAccuracies: number[]; // array of accuracy % per attempt (e.g. [80, 90, 85])
  totalWrongQuestionsCount: number;
  recoveredWrongQuestionsCount: number;
  difficultyLevelsAnswered: Set<'Dễ' | 'Trung bình' | 'Khó'>;
}

/**
 * Calculates Mastery Score & Status according to Master Prompt Section 10:
 * Mastery Score = Accuracy * 0.50 + Consistency * 0.25 + Recovery * 0.15 + Difficulty Coverage * 0.10
 * Normalized to 0–100 scale.
 */
export function calculateMastery(input: MasteryInput): {
  masteryScore: number;
  masteryLevel: MasteryLevel;
  isEligible: boolean;
  accuracy: number;
  consistency: number;
  recovery: number;
  difficultyCoverage: number;
} {
  const uniqueCount = input.uniqueQuestionIdsAnswered.length;
  const isEligible = uniqueCount >= 10;

  // 1. Accuracy Component (0 - 100)
  const accuracy = input.totalAnswersCount > 0
    ? Math.min(100, Math.max(0, (input.correctAnswersCount / input.totalAnswersCount) * 100))
    : 0;

  // 2. Consistency Component (0 - 100)
  // Evaluates stability across multiple attempts. Low variance / sustained high scores give higher consistency.
  let consistency = 70; // baseline for single attempt
  if (input.recentAttemptAccuracies.length > 1) {
    const scores = input.recentAttemptAccuracies;
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation means higher consistency.
    // If standard deviation is 0, consistency is mean score; variance penalizes up to 30 points.
    const variancePenalty = Math.min(35, stdDev * 1.5);
    consistency = Math.min(100, Math.max(0, mean - variancePenalty));
  } else if (input.recentAttemptAccuracies.length === 1) {
    consistency = input.recentAttemptAccuracies[0];
  } else {
    consistency = accuracy;
  }

  // 3. Recovery Component (0 - 100)
  // Ability to overcome questions that were previously answered incorrectly
  let recovery = 100;
  if (input.totalWrongQuestionsCount > 0) {
    recovery = Math.min(100, Math.max(0, (input.recoveredWrongQuestionsCount / input.totalWrongQuestionsCount) * 100));
  } else {
    // If user has never made a mistake and has good accuracy, grant high recovery score
    recovery = accuracy > 0 ? accuracy : 70;
  }

  // 4. Difficulty Coverage Component (0 - 100)
  // Checks exposure across Dễ, Trung bình, Khó
  const coveredLevels = input.difficultyLevelsAnswered.size;
  let difficultyCoverage = 0;
  if (coveredLevels >= 3) {
    difficultyCoverage = 100;
  } else if (coveredLevels === 2) {
    difficultyCoverage = 70;
  } else if (coveredLevels === 1) {
    difficultyCoverage = 40;
  } else {
    difficultyCoverage = 0;
  }

  // Final Weighted Mastery Score
  const rawScore =
    accuracy * 0.50 +
    consistency * 0.25 +
    recovery * 0.15 +
    difficultyCoverage * 0.10;

  const masteryScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  // Determine Mastery Level Tier
  let masteryLevel: MasteryLevel = 'Chưa đủ dữ liệu';
  if (!isEligible) {
    masteryLevel = 'Chưa đủ dữ liệu';
  } else if (masteryScore >= 95) {
    masteryLevel = 'Rất thành thạo';
  } else if (masteryScore >= 80) {
    masteryLevel = 'Thành thạo';
  } else if (masteryScore >= 60) {
    masteryLevel = 'Khá';
  } else if (masteryScore >= 40) {
    masteryLevel = 'Đang học';
  } else {
    masteryLevel = 'Chưa thành thạo';
  }

  return {
    masteryScore,
    masteryLevel,
    isEligible,
    accuracy: Math.round(accuracy),
    consistency: Math.round(consistency),
    recovery: Math.round(recovery),
    difficultyCoverage: Math.round(difficultyCoverage)
  };
}

/**
 * Maps mastery level to Tailwind color badge classes
 */
export function getMasteryLevelBadgeColor(level: MasteryLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (level) {
    case 'Rất thành thạo':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Thành thạo':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Khá':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'Đang học':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Chưa thành thạo':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'Chưa đủ dữ liệu':
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  }
}
