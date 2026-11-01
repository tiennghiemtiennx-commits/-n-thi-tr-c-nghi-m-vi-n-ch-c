import test from 'node:test';
import assert from 'node:assert/strict';
import { processQuestionAnswerForWrongList, RECOVERY_STREAK_REQUIRED } from './wrongQuestions';

test('creates new wrong record on first incorrect answer', () => {
  const result = processQuestionAnswerForWrongList(
    undefined,
    'user-1',
    'q-01-01',
    'topic-01',
    'B',
    false
  );

  assert.ok(result);
  assert.equal(result.wrongCount, 1);
  assert.equal(result.correctStreak, 0);
  assert.equal(result.status, 'needs_review');
  assert.equal(result.lastSelectedAnswer, 'B');
});

test('increments wrong count and resets streak to 0 on subsequent wrong answers', () => {
  const existing = {
    id: 'wq_1',
    userId: 'user-1',
    questionId: 'q-01-01',
    topicId: 'topic-01',
    wrongCount: 1,
    correctStreak: 1,
    lastWrongAt: '2026-11-01T00:00:00Z',
    lastSelectedAnswer: 'B' as const,
    status: 'needs_review' as const
  };

  const updated = processQuestionAnswerForWrongList(
    existing,
    'user-1',
    'q-01-01',
    'topic-01',
    'C',
    false
  );

  assert.ok(updated);
  assert.equal(updated.wrongCount, 2);
  assert.equal(updated.correctStreak, 0);
  assert.equal(updated.status, 'needs_review');
});

test('marks question as "recovered" ONLY when correct streak reaches required threshold (2)', () => {
  const existing = {
    id: 'wq_1',
    userId: 'user-1',
    questionId: 'q-01-01',
    topicId: 'topic-01',
    wrongCount: 2,
    correctStreak: 0,
    lastWrongAt: '2026-11-01T00:00:00Z',
    lastSelectedAnswer: 'B' as const,
    status: 'needs_review' as const
  };

  // 1st correct answer: streak becomes 1, status still needs_review
  const step1 = processQuestionAnswerForWrongList(
    existing,
    'user-1',
    'q-01-01',
    'topic-01',
    'A',
    true
  );
  assert.ok(step1);
  assert.equal(step1.correctStreak, 1);
  assert.equal(step1.status, 'needs_review');

  // 2nd correct answer: streak becomes 2 >= RECOVERY_STREAK_REQUIRED, status becomes 'recovered'
  const step2 = processQuestionAnswerForWrongList(
    step1,
    'user-1',
    'q-01-01',
    'topic-01',
    'A',
    true
  );
  assert.ok(step2);
  assert.equal(step2.correctStreak, 2);
  assert.equal(step2.status, 'recovered');
});
