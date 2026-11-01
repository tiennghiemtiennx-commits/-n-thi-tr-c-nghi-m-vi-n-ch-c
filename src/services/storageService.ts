import {
  User,
  Topic,
  Question,
  Attempt,
  UserWrongQuestion,
  UserTopicProgress,
  ImportHistoryRecord,
  AnswerKey,
  StudyRecommendation
} from '../types';
import { FIXED_TOPICS } from '../constants/topics';
import { SEED_QUESTIONS } from '../data/seedQuestions';
import { calculateMastery } from '../utils/mastery';
import { processQuestionAnswerForWrongList } from '../utils/wrongQuestions';

const STORAGE_KEYS = {
  USERS: 'ovc_bn_users',
  TOPICS: 'ovc_bn_topics',
  QUESTIONS: 'ovc_bn_questions',
  ATTEMPTS: 'ovc_bn_attempts',
  WRONG_QUESTIONS: 'ovc_bn_wrong_questions',
  IMPORT_HISTORY: 'ovc_bn_import_history',
  CURRENT_USER: 'ovc_bn_current_user',
  FIREBASE_CONFIG: 'ovc_bn_firebase_config'
};

export const INITIAL_USERS: User[] = [
  {
    uid: 'usr-student-01',
    displayName: 'Nguyễn Văn An',
    email: 'nguyenvanan@bacninh.edu.vn',
    role: 'user',
    createdAt: '2026-02-01T08:00:00.000Z',
    lastLoginAt: '2026-11-01T02:00:00.000Z',
    status: 'active',
    phone: '0912 345 678',
    password: 'password123'
  },
  {
    uid: 'usr-admin-01',
    displayName: 'Ban Quản Trị Sở GD&ĐT Bắc Ninh',
    email: 'admin@onvienchucbacninh.vn',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-11-01T02:30:00.000Z',
    status: 'active',
    phone: '0222 3822 555',
    password: 'admin123'
  }
];

class StorageService {
  private initialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    // Check if questions exist in localStorage
    const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!storedQuestions) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(SEED_QUESTIONS));
    }

    // Initialize users
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    } else {
      // Ensure existing users have passwords
      try {
        const parsed: User[] = JSON.parse(storedUsers);
        let updated = false;
        parsed.forEach(u => {
          if (!u.password) {
            u.password = u.role === 'admin' ? 'admin123' : 'password123';
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed));
        }
      } catch {}
    }

    // Default current user
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }

    this.initialized = true;
  }

  // ---- Users ----
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public getCurrentUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  }

  public setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  public registerUser(name: string, email: string, password: string = 'password123'): User {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email này đã được đăng ký tài khoản!');
    }

    const newUser: User = {
      uid: `usr_${Date.now()}`,
      displayName: name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
      password
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  public createUserByAdmin(data: {
    displayName: string;
    email: string;
    password?: string;
    role: 'admin' | 'user';
    phone?: string;
  }): User {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase().trim());
    if (existing) {
      throw new Error(`Email "${data.email}" đã tồn tại trong hệ thống!`);
    }

    const newUser: User = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: data.displayName.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role,
      password: data.password || 'password123',
      phone: data.phone?.trim() || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: '',
      status: 'active'
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  public updateUser(uid: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === uid);
    if (idx === -1) {
      throw new Error(`Không tìm thấy người dùng với mã ${uid}`);
    }

    // If changing email, ensure no conflict
    if (updates.email) {
      const conflict = users.find(u => u.uid !== uid && u.email.toLowerCase() === updates.email!.toLowerCase().trim());
      if (conflict) {
        throw new Error(`Email "${updates.email}" đã được sử dụng bởi tài khoản khác!`);
      }
    }

    users[idx] = {
      ...users[idx],
      ...updates
    };

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // If updating current user, refresh current user too
    const current = this.getCurrentUser();
    if (current.uid === uid) {
      this.setCurrentUser(users[idx]);
    }

    return users[idx];
  }

  public deleteUser(uid: string): boolean {
    const users = this.getUsers();
    const target = users.find(u => u.uid === uid);
    if (!target) return false;

    // Prevent deleting the main admin
    if (target.email === 'admin@onvienchucbacninh.vn') {
      throw new Error('Không thể xóa tài khoản Quản trị viên gốc của hệ thống!');
    }

    const filtered = users.filter(u => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));

    // If deleted user was active user, reset to student 01
    const current = this.getCurrentUser();
    if (current.uid === uid) {
      this.setCurrentUser(INITIAL_USERS[0]);
    }

    return true;
  }

  public verifyUserCredentials(email: string, pass: string): User {
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      throw new Error('Email không tồn tại trong hệ thống. Vui lòng liên hệ Admin để được cấp tài khoản!');
    }

    if (found.status === 'suspended') {
      throw new Error('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên!');
    }

    // Password check: if user has a password, compare it
    if (found.password && found.password !== pass) {
      throw new Error('Mật khẩu không chính xác! Vui lòng kiểm tra lại hoặc yêu cầu Admin cấp lại mật khẩu.');
    }

    const updated = { ...found, lastLoginAt: new Date().toISOString() };
    this.updateUser(found.uid, { lastLoginAt: updated.lastLoginAt });
    this.setCurrentUser(updated);
    return updated;
  }

  public switchTestUser(role: 'admin' | 'user'): User {
    const users = this.getUsers();
    const target = role === 'admin'
      ? users.find(u => u.role === 'admin') || INITIAL_USERS[1]
      : users.find(u => u.role === 'user') || INITIAL_USERS[0];
    this.setCurrentUser(target);
    return target;
  }

  // ---- Topics ----
  public getTopics(): Topic[] {
    const questions = this.getQuestions();
    // Count questions per topic dynamically
    const countMap = new Map<string, number>();
    for (const q of questions) {
      if (q.status === 'active') {
        countMap.set(q.topicId, (countMap.get(q.topicId) || 0) + 1);
      }
    }

    return FIXED_TOPICS.map(t => ({
      ...t,
      questionCount: countMap.get(t.topicId) || 0
    }));
  }

  public getTopicById(topicId: string): Topic | undefined {
    return this.getTopics().find(t => t.topicId === topicId);
  }

  // ---- Questions ----
  public getQuestions(filter?: {
    topicId?: string;
    difficulty?: string;
    search?: string;
  }): Question[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      let list: Question[] = raw ? JSON.parse(raw) : SEED_QUESTIONS;

      if (filter) {
        if (filter.topicId && filter.topicId !== 'all') {
          list = list.filter(q => q.topicId === filter.topicId);
        }
        if (filter.difficulty && filter.difficulty !== 'all') {
          list = list.filter(q => q.difficulty === filter.difficulty);
        }
        if (filter.search && filter.search.trim()) {
          const s = filter.search.toLowerCase();
          list = list.filter(
            q =>
              q.questionText.toLowerCase().includes(s) ||
              q.optionA.toLowerCase().includes(s) ||
              q.optionB.toLowerCase().includes(s) ||
              q.optionC.toLowerCase().includes(s) ||
              q.optionD.toLowerCase().includes(s) ||
              (q.legalReference && q.legalReference.toLowerCase().includes(s))
          );
        }
      }

      return list;
    } catch {
      return SEED_QUESTIONS;
    }
  }

  public addQuestion(question: Omit<Question, 'questionId' | 'createdAt' | 'updatedAt'>): Question {
    const questions = this.getQuestions();
    const newQ: Question = {
      ...question,
      questionId: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    questions.push(newQ);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return newQ;
  }

  public updateQuestion(questionId: string, updates: Partial<Question>): Question {
    const questions = this.getQuestions();
    const index = questions.findIndex(q => q.questionId === questionId);
    if (index === -1) {
      throw new Error(`Không tìm thấy câu hỏi với mã ${questionId}`);
    }

    questions[index] = {
      ...questions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return questions[index];
  }

  public deleteQuestion(questionId: string): boolean {
    const questions = this.getQuestions();
    const filtered = questions.filter(q => q.questionId !== questionId);
    if (filtered.length !== questions.length) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  public batchImportQuestions(
    topicId: string,
    importedRows: Omit<Question, 'questionId' | 'createdAt' | 'updatedAt' | 'topicId'>[],
    mode: 'append' | 'replace',
    fileName: string,
    adminId: string,
    adminName: string
  ): { successCount: number; historyRecord: ImportHistoryRecord } {
    let existingQuestions = this.getQuestions();

    const timestamp = new Date().toISOString();
    const newQuestions: Question[] = importedRows.map((row, idx) => ({
      ...row,
      topicId,
      questionId: `q_${Date.now()}_${idx + 1}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'active'
    }));

    if (mode === 'replace') {
      // Keep questions belonging to other topics, replace only this topic
      existingQuestions = existingQuestions.filter(q => q.topicId !== topicId);
      existingQuestions.push(...newQuestions);
    } else {
      existingQuestions.push(...newQuestions);
    }

    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(existingQuestions));

    // Save import history log
    const topic = this.getTopicById(topicId);
    const historyRecord: ImportHistoryRecord = {
      importId: `imp_${Date.now()}`,
      adminId,
      adminName,
      topicId,
      topicName: topic ? topic.name : topicId,
      fileName,
      totalRows: importedRows.length,
      successfulRows: newQuestions.length,
      failedRows: 0,
      importMode: mode,
      importedAt: timestamp,
      status: 'completed'
    };

    const history = this.getImportHistory();
    history.unshift(historyRecord);
    localStorage.setItem(STORAGE_KEYS.IMPORT_HISTORY, JSON.stringify(history));

    return { successCount: newQuestions.length, historyRecord };
  }

  // ---- Attempts (Lịch sử làm bài) ----
  public getAttempts(userId?: string): Attempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      let list: Attempt[] = data ? JSON.parse(data) : [];
      if (userId) {
        list = list.filter(a => a.userId === userId);
      }
      return list.sort((a, b) => new Date(b.submittedAt || b.startedAt).getTime() - new Date(a.submittedAt || a.startedAt).getTime());
    } catch {
      return [];
    }
  }

  public getAttemptById(attemptId: string): Attempt | undefined {
    return this.getAttempts().find(a => a.attemptId === attemptId);
  }

  public saveAttempt(attempt: Attempt): Attempt {
    const attempts = this.getAttempts();
    const existingIndex = attempts.findIndex(a => a.attemptId === attempt.attemptId);
    if (existingIndex >= 0) {
      attempts[existingIndex] = attempt;
    } else {
      attempts.unshift(attempt);
    }
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));

    // Process wrong questions and update recovery / stats for each answered question
    for (const ans of attempt.answers) {
      if (ans.selectedAnswer) {
        this.recordQuestionAnswer(
          attempt.userId,
          ans.questionId,
          ans.topicId,
          ans.selectedAnswer,
          ans.isCorrect
        );
      }
    }

    return attempt;
  }

  // ---- Wrong Questions ----
  public getUserWrongQuestions(
    userId: string,
    filter?: { topicId?: string; status?: 'needs_review' | 'recovered' | 'all' }
  ): UserWrongQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
      let list: UserWrongQuestion[] = data ? JSON.parse(data) : [];
      list = list.filter(wq => wq.userId === userId);

      if (filter) {
        if (filter.topicId && filter.topicId !== 'all') {
          list = list.filter(wq => wq.topicId === filter.topicId);
        }
        if (filter.status && filter.status !== 'all') {
          list = list.filter(wq => wq.status === filter.status);
        }
      }

      return list.sort((a, b) => new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime());
    } catch {
      return [];
    }
  }

  public recordQuestionAnswer(
    userId: string,
    questionId: string,
    topicId: string,
    selectedAnswer: AnswerKey,
    isCorrect: boolean
  ) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
      const allWrong: UserWrongQuestion[] = data ? JSON.parse(data) : [];

      const index = allWrong.findIndex(
        wq => wq.userId === userId && wq.questionId === questionId
      );
      const existing = index >= 0 ? allWrong[index] : undefined;

      const updated = processQuestionAnswerForWrongList(
        existing,
        userId,
        questionId,
        topicId,
        selectedAnswer,
        isCorrect
      );

      if (updated) {
        if (index >= 0) {
          allWrong[index] = updated;
        } else {
          allWrong.push(updated);
        }
        localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(allWrong));
      }
    } catch (err) {
      console.error('Failed to update wrong question state', err);
    }
  }

  // ---- Progress & Mastery ----
  public getUserTopicProgress(userId: string, topicId: string): UserTopicProgress {
    const attempts = this.getAttempts(userId);
    const wrongList = this.getUserWrongQuestions(userId, { topicId });
    const questionsInTopic = this.getQuestions({ topicId });

    // Aggregate answers from attempts involving this topic
    let totalAttemptsCount = 0;
    let totalCorrectCount = 0;
    let totalAnswersCount = 0;
    const uniqueQuestionsAnswered = new Set<string>();
    const recentAccuracies: number[] = [];
    const difficultyLevels = new Set<'Dễ' | 'Trung bình' | 'Khó'>();

    for (const attempt of attempts) {
      const answersForTopic = attempt.answers.filter(a => a.topicId === topicId && a.selectedAnswer !== null);
      if (answersForTopic.length > 0) {
        totalAttemptsCount++;
        const correctInThisAttempt = answersForTopic.filter(a => a.isCorrect).length;
        const accuracyInThisAttempt = (correctInThisAttempt / answersForTopic.length) * 100;
        recentAccuracies.push(accuracyInThisAttempt);

        for (const ans of answersForTopic) {
          totalAnswersCount++;
          if (ans.isCorrect) totalCorrectCount++;
          uniqueQuestionsAnswered.add(ans.questionId);
          if (ans.questionSnapshot?.difficulty) {
            difficultyLevels.add(ans.questionSnapshot.difficulty);
          }
        }
      }
    }

    const totalWrongCount = wrongList.length;
    const recoveredCount = wrongList.filter(wq => wq.status === 'recovered').length;

    const masteryResult = calculateMastery({
      userId,
      topicId,
      uniqueQuestionIdsAnswered: Array.from(uniqueQuestionsAnswered),
      totalAnswersCount,
      correctAnswersCount: totalCorrectCount,
      recentAttemptAccuracies: recentAccuracies.slice(0, 10), // last 10 attempts
      totalWrongQuestionsCount: totalWrongCount,
      recoveredWrongQuestionsCount: recoveredCount,
      difficultyLevelsAnswered: difficultyLevels
    });

    return {
      userId,
      topicId,
      totalAttempts: totalAttemptsCount,
      uniqueQuestionsAnswered: uniqueQuestionsAnswered.size,
      totalCorrect: totalCorrectCount,
      totalIncorrect: totalAnswersCount - totalCorrectCount,
      accuracy: masteryResult.accuracy,
      consistency: masteryResult.consistency,
      recovery: masteryResult.recovery,
      difficultyCoverage: masteryResult.difficultyCoverage,
      masteryScore: masteryResult.masteryScore,
      masteryLevel: masteryResult.masteryLevel,
      isEligible: masteryResult.isEligible,
      updatedAt: new Date().toISOString()
    };
  }

  public getAllUserTopicProgress(userId: string): UserTopicProgress[] {
    const topics = this.getTopics();
    return topics.map(t => this.getUserTopicProgress(userId, t.topicId));
  }

  // ---- Recommendations ----
  public getStudyRecommendations(userId: string): StudyRecommendation[] {
    const list: StudyRecommendation[] = [];
    const allProgress = this.getAllUserTopicProgress(userId);
    const wrongList = this.getUserWrongQuestions(userId, { status: 'needs_review' });

    // Recommendation 1: Pending wrong questions
    if (wrongList.length > 0) {
      list.push({
        id: 'rec_wrong',
        type: 'urgent',
        title: `Ôn tập ${wrongList.length} câu hỏi đã trả lời sai`,
        description: 'Khắc phục các lỗ hổng kiến thức bằng cách trả lời đúng 2 lần liên tiếp để đạt chuẩn ghi nhớ.',
        actionText: 'Ôn tập câu sai ngay',
        actionType: 'review_wrong'
      });
    }

    // Recommendation 2: Topics with lowest accuracy or mastery among eligible or active
    const activeProgress = allProgress.filter(p => p.uniqueQuestionsAnswered > 0);
    if (activeProgress.length > 0) {
      const sortedByScore = [...activeProgress].sort((a, b) => a.accuracy - b.accuracy);
      const lowest = sortedByScore[0];
      const topic = this.getTopicById(lowest.topicId);
      if (topic && lowest.accuracy < 75) {
        list.push({
          id: `rec_low_${lowest.topicId}`,
          type: 'warning',
          title: `Cần củng cố chủ đề: ${topic.name}`,
          description: `Tỷ lệ chính xác hiện tại là ${lowest.accuracy}%. Hãy làm thêm 15-20 câu để cải thiện độ ổn định.`,
          topicId: lowest.topicId,
          actionText: 'Luyện tập chủ đề này',
          actionType: 'practice_topic'
        });
      }
    }

    // Recommendation 3: Unattempted topics
    const unattempted = allProgress.filter(p => p.uniqueQuestionsAnswered === 0);
    if (unattempted.length > 0) {
      const targetTopic = this.getTopicById(unattempted[0].topicId);
      if (targetTopic) {
        list.push({
          id: `rec_new_${targetTopic.topicId}`,
          type: 'tip',
          title: `Khởi động chủ đề mới: ${targetTopic.name}`,
          description: `Văn bản căn cứ: ${targetTopic.legalDocument}. Làm 10 câu đầu tiên để đánh giá sơ bộ.`,
          topicId: targetTopic.topicId,
          actionText: 'Bắt đầu ngay',
          actionType: 'practice_topic'
        });
      }
    }

    // Recommendation 4: Random exam challenge
    if (activeProgress.length >= 3) {
      list.push({
        id: 'rec_random_exam',
        type: 'positive',
        title: 'Thử sức với đề thi ngẫu nhiên 30 câu',
        description: 'Tập dượt phản xạ dưới áp lực thời gian với đề thi tổng hợp nhiều chủ đề như trong kỳ thi thật.',
        actionText: 'Tạo đề ngẫu nhiên',
        actionType: 'random_exam'
      });
    }

    return list;
  }

  // ---- Import History ----
  public getImportHistory(): ImportHistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IMPORT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ---- Admin Stats ----
  public getAdminStats() {
    const questions = this.getQuestions();
    const users = this.getUsers();
    const attempts = this.getAttempts();
    const topics = this.getTopics();

    const activeQuestions = questions.filter(q => q.status === 'active');
    const questionsByTopic: Record<string, number> = {};
    for (const t of topics) {
      questionsByTopic[t.name] = 0;
    }
    for (const q of activeQuestions) {
      const t = topics.find(item => item.topicId === q.topicId);
      if (t) {
        questionsByTopic[t.name] = (questionsByTopic[t.name] || 0) + 1;
      }
    }

    const difficultyCounts = {
      'Dễ': activeQuestions.filter(q => q.difficulty === 'Dễ').length,
      'Trung bình': activeQuestions.filter(q => q.difficulty === 'Trung bình').length,
      'Khó': activeQuestions.filter(q => q.difficulty === 'Khó').length
    };

    return {
      totalTopics: topics.length,
      totalQuestions: activeQuestions.length,
      totalUsers: users.length,
      totalAttempts: attempts.length,
      questionsByTopic,
      difficultyCounts
    };
  }

  // ---- Reset & Backup ----
  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.WRONG_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.IMPORT_HISTORY);
    this.initialized = false;
    this.init();
  }

  public exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      questions: this.getQuestions(),
      attempts: this.getAttempts(),
      wrongQuestions: this.getUserWrongQuestions(this.getCurrentUser().uid),
      importHistory: this.getImportHistory()
    };
    return JSON.stringify(backup, null, 2);
  }
}

export const storageService = new StorageService();
