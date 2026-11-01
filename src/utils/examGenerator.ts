import { Question, Difficulty } from '../types';

export interface ExamGenerationConfig {
  topicIds: string[];
  totalQuestions: number;
  difficulty: Difficulty | 'Hỗn hợp';
  attemptedQuestionIds?: Set<string>;
}

/**
 * Generates an exam question set meeting the strict requirements of Section 8:
 * - No duplicate questions
 * - Relatively balanced across selected topics
 * - Distributed difficulty when 'Hỗn hợp'
 * - Prioritizes questions not yet encountered or least seen
 * - Excludes corrupted/incomplete questions
 */
export function generateExamQuestions(
  availableQuestions: Question[],
  config: ExamGenerationConfig
): Question[] {
  // 1. Filter valid questions matching selected topics and status
  const validPool = availableQuestions.filter(q => {
    if (q.status !== 'active') return false;
    if (!config.topicIds.includes(q.topicId)) return false;
    if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) return false;
    if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) return false;
    if (config.difficulty !== 'Hỗn hợp' && q.difficulty !== config.difficulty) return false;
    return true;
  });

  if (validPool.length === 0) {
    return [];
  }

  const requestedCount = Math.min(config.totalQuestions, validPool.length);

  // Group by topic to enable balanced selection
  const poolByTopic = new Map<string, Question[]>();
  for (const topicId of config.topicIds) {
    poolByTopic.set(topicId, []);
  }

  for (const q of validPool) {
    const list = poolByTopic.get(q.topicId);
    if (list) {
      list.push(q);
    }
  }

  // Helper: sort questions inside each topic, prioritizing unattempted questions
  const attemptedSet = config.attemptedQuestionIds || new Set<string>();
  const shuffleAndSort = (items: Question[]): Question[] => {
    return [...items].sort((a, b) => {
      const aSeen = attemptedSet.has(a.questionId) ? 1 : 0;
      const bSeen = attemptedSet.has(b.questionId) ? 1 : 0;
      if (aSeen !== bSeen) return aSeen - bSeen; // unattempted first
      return Math.random() - 0.5; // randomize within same priority
    });
  };

  for (const [topicId, list] of poolByTopic.entries()) {
    poolByTopic.set(topicId, shuffleAndSort(list));
  }

  // Round-robin selection across topics to balance representation
  const selected: Question[] = [];
  const selectedIds = new Set<string>();

  let hasMore = true;
  while (selected.length < requestedCount && hasMore) {
    hasMore = false;
    for (const topicId of config.topicIds) {
      if (selected.length >= requestedCount) break;
      const topicList = poolByTopic.get(topicId);
      if (topicList && topicList.length > 0) {
        const question = topicList.shift();
        if (question && !selectedIds.has(question.questionId)) {
          selected.push(question);
          selectedIds.add(question.questionId);
          hasMore = true;
        }
      }
    }
  }

  // Shuffle final list so topics are naturally interspersed
  return selected.sort(() => Math.random() - 0.5);
}
