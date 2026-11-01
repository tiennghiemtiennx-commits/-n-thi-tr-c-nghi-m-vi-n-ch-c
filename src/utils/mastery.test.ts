import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMastery } from './mastery';

test('calculateMastery flags "Chưa đủ dữ liệu" when unique questions < 10', () => {
  const result = calculateMastery({
    userId: 'u1',
    topicId: 'topic-01',
    uniqueQuestionIdsAnswered: ['q1', 'q2', 'q3', 'q4', 'q5'], // only 5 unique
    totalAnswersCount: 20,
    correctAnswersCount: 19,
    recentAttemptAccuracies: [95, 95],
    totalWrongQuestionsCount: 1,
    recoveredWrongQuestionsCount: 1,
    difficultyLevelsAnswered: new Set(['Dễ', 'Trung bình', 'Khó'])
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.masteryLevel, 'Chưa đủ dữ liệu');
});

test('calculateMastery evaluates "Thành thạo" or "Rất thành thạo" when >= 10 unique questions and high metrics', () => {
  const uniqueQuestions = Array.from({ length: 15 }, (_, i) => `q-${i + 1}`);
  const result = calculateMastery({
    userId: 'u1',
    topicId: 'topic-01',
    uniqueQuestionIdsAnswered: uniqueQuestions,
    totalAnswersCount: 30,
    correctAnswersCount: 28,
    recentAttemptAccuracies: [90, 95, 92],
    totalWrongQuestionsCount: 2,
    recoveredWrongQuestionsCount: 2, // 100% recovered
    difficultyLevelsAnswered: new Set(['Dễ', 'Trung bình', 'Khó']) // 100% coverage
  });

  assert.equal(result.isEligible, true);
  assert.ok(result.masteryScore >= 80, `Mastery score ${result.masteryScore} should be >= 80`);
  assert.ok(result.masteryLevel === 'Thành thạo' || result.masteryLevel === 'Rất thành thạo');
});

test('calculateMastery weights accuracy, consistency, recovery, and coverage', () => {
  const uniqueQuestions = Array.from({ length: 12 }, (_, i) => `q-${i + 1}`);
  const result = calculateMastery({
    userId: 'u1',
    topicId: 'topic-02',
    uniqueQuestionIdsAnswered: uniqueQuestions,
    totalAnswersCount: 20,
    correctAnswersCount: 10, // 50% accuracy
    recentAttemptAccuracies: [50, 50],
    totalWrongQuestionsCount: 5,
    recoveredWrongQuestionsCount: 1, // 20% recovery
    difficultyLevelsAnswered: new Set(['Dễ']) // 1 difficulty level
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.accuracy, 50);
  assert.ok(result.masteryScore < 60, `Score ${result.masteryScore} should reflect low metrics`);
  assert.ok(['Đang học', 'Chưa thành thạo'].includes(result.masteryLevel));
});
