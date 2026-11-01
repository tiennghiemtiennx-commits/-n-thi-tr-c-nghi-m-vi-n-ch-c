import test from 'node:test';
import assert from 'node:assert/strict';
import { generateExamQuestions } from './examGenerator';
import { Question } from '../types';

const mockQuestions: Question[] = [
  {
    questionId: 'q1',
    topicId: 'topic-01',
    questionText: 'Q1?',
    optionA: 'A',
    optionB: 'B',
    optionC: 'C',
    optionD: 'D',
    correctAnswer: 'A',
    difficulty: 'Dễ',
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
  {
    questionId: 'q2',
    topicId: 'topic-01',
    questionText: 'Q2?',
    optionA: 'A',
    optionB: 'B',
    optionC: 'C',
    optionD: 'D',
    correctAnswer: 'B',
    difficulty: 'Trung bình',
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
  {
    questionId: 'q3',
    topicId: 'topic-02',
    questionText: 'Q3?',
    optionA: 'A',
    optionB: 'B',
    optionC: 'C',
    optionD: 'D',
    correctAnswer: 'C',
    difficulty: 'Dễ',
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
  {
    questionId: 'q4',
    topicId: 'topic-02',
    questionText: 'Q4?',
    optionA: 'A',
    optionB: 'B',
    optionC: 'C',
    optionD: 'D',
    correctAnswer: 'D',
    difficulty: 'Khó',
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
  {
    questionId: 'q5_corrupt',
    topicId: 'topic-01',
    questionText: 'Q5 incomplete?',
    optionA: 'A',
    optionB: '', // Missing option B
    optionC: 'C',
    optionD: 'D',
    correctAnswer: 'A',
    difficulty: 'Dễ',
    createdAt: '',
    updatedAt: '',
    status: 'active'
  }
];

test('generateExamQuestions excludes incomplete or corrupt questions', () => {
  const result = generateExamQuestions(mockQuestions, {
    topicIds: ['topic-01'],
    totalQuestions: 10,
    difficulty: 'Hỗn hợp'
  });

  const ids = result.map(q => q.questionId);
  assert.equal(ids.includes('q5_corrupt'), false);
  assert.equal(result.length, 2); // only q1 and q2 are valid for topic-01
});

test('generateExamQuestions enforces no duplicates and respects topic filters', () => {
  const result = generateExamQuestions(mockQuestions, {
    topicIds: ['topic-01', 'topic-02'],
    totalQuestions: 4,
    difficulty: 'Hỗn hợp'
  });

  assert.equal(result.length, 4);
  const ids = result.map(q => q.questionId);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, 4); // all unique
});

test('generateExamQuestions filters by specific difficulty', () => {
  const result = generateExamQuestions(mockQuestions, {
    topicIds: ['topic-01', 'topic-02'],
    totalQuestions: 10,
    difficulty: 'Khó'
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].questionId, 'q4');
  assert.equal(result[0].difficulty, 'Khó');
});
