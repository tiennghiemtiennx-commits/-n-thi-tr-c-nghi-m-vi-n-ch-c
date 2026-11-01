import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, UserTab, AdminTab } from './components/common/Header';
import { Footer } from './components/common/Footer';

// User Views
import { UserDashboard } from './components/user/UserDashboard';
import { TopicPracticeList } from './components/user/TopicPracticeList';
import { PracticeSetupModal } from './components/user/PracticeSetupModal';
import { PracticeSession } from './components/user/PracticeSession';
import { ExamResultView } from './components/user/ExamResultView';
import { RandomExamSetup } from './components/user/RandomExamSetup';
import { WrongQuestionsView } from './components/user/WrongQuestionsView';
import { ProgressMasteryView } from './components/user/ProgressMasteryView';
import { AttemptHistoryView } from './components/user/AttemptHistoryView';
import { UserProfileView } from './components/user/UserProfileView';
import { LoginModal } from './components/auth/LoginModal';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminTopicList } from './components/admin/AdminTopicList';
import { AdminQuestionBank } from './components/admin/AdminQuestionBank';
import { AdminExcelImport } from './components/admin/AdminExcelImport';
import { AdminUserList } from './components/admin/AdminUserList';
import { AdminHistoryList } from './components/admin/AdminHistoryList';
import { AdminSettings } from './components/admin/AdminSettings';

import { storageService } from './services/storageService';
import { Topic, Question, Attempt, Difficulty, AttemptType } from './types';
import { generateExamQuestions } from './utils/examGenerator';

interface ActiveSessionConfig {
  questions: Question[];
  title: string;
  attemptType: AttemptType;
  topicIds: string[];
  mode: 'practice' | 'exam';
  timerMinutes: number;
}

const MainApp: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>(isAdmin ? 'admin_dashboard' : 'dashboard');

  // Interactive Test State
  const [activeSession, setActiveSession] = useState<ActiveSessionConfig | null>(null);
  const [completedAttempt, setCompletedAttempt] = useState<Attempt | null>(null);

  // Setup modal for a specific topic
  const [setupTopic, setSetupTopic] = useState<Topic | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Filter pass-through for Admin Question Bank
  const [adminQuestionBankTopic, setAdminQuestionBankTopic] = useState<string>('all');
  const [adminImportTopic, setAdminImportTopic] = useState<string>('topic-01');

  // Handle Tab Switch
  const handleSelectTab = (tab: UserTab | AdminTab) => {
    setActiveSession(null);
    setCompletedAttempt(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch Topic Practice from setup modal
  const handleStartTopicPractice = (config: {
    topic: Topic;
    questionCount: number;
    difficulty: Difficulty | 'Hỗn hợp';
    mode: 'practice' | 'exam';
    timerMinutes: number;
  }) => {
    setSetupTopic(null);
    const allQuestions = storageService.getQuestions({ topicId: config.topic.topicId });

    const selectedQuestions = generateExamQuestions(allQuestions, {
      topicIds: [config.topic.topicId],
      totalQuestions: config.questionCount,
      difficulty: config.difficulty
    });

    if (selectedQuestions.length === 0) {
      alert('Không tìm thấy câu hỏi phù hợp với các tiêu chí này. Vui lòng kiểm tra lại.');
      return;
    }

    const title = `${config.mode === 'practice' ? 'Luyện tập' : 'Thi thử'}: ${config.topic.name} (${selectedQuestions.length} câu)`;
    setActiveSession({
      questions: selectedQuestions,
      title,
      attemptType: config.mode === 'practice' ? 'topic_practice' : 'topic_exam',
      topicIds: [config.topic.topicId],
      mode: config.mode,
      timerMinutes: config.timerMinutes
    });
    setCompletedAttempt(null);
  };

  // Launch Random Exam
  const handleStartRandomExam = (sessionConfig: {
    questions: Question[];
    title: string;
    topicIds: string[];
    timerMinutes: number;
  }) => {
    setActiveSession({
      questions: sessionConfig.questions,
      title: sessionConfig.title,
      attemptType: 'random_exam',
      topicIds: sessionConfig.topicIds,
      mode: 'exam',
      timerMinutes: sessionConfig.timerMinutes
    });
    setCompletedAttempt(null);
  };

  // Launch Practice directly on specified questions (e.g. wrong questions review)
  const handleStartCustomPractice = (questions: Question[], title: string) => {
    const topicIds = Array.from(new Set(questions.map(q => q.topicId)));
    setActiveSession({
      questions,
      title,
      attemptType: 'wrong_recovery',
      topicIds,
      mode: 'practice',
      timerMinutes: 0
    });
    setCompletedAttempt(null);
  };

  // When a test completes
  const handleTestComplete = (attempt: Attempt) => {
    setActiveSession(null);
    setCompletedAttempt(attempt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retry an attempt
  const handleRetryAttempt = (attempt: Attempt) => {
    const questions = storageService.getQuestions();
    const originalQuestions = attempt.answers
      .map(ans => questions.find(q => q.questionId === ans.questionId))
      .filter((q): q is Question => Boolean(q));

    if (originalQuestions.length === 0) {
      alert('Không tìm thấy câu hỏi gốc để làm lại.');
      return;
    }

    setActiveSession({
      questions: originalQuestions,
      title: `Làm lại: ${attempt.title}`,
      attemptType: attempt.attemptType,
      topicIds: attempt.topicIds,
      mode: attempt.attemptType === 'topic_practice' || attempt.attemptType === 'wrong_recovery' ? 'practice' : 'exam',
      timerMinutes: attempt.durationSeconds > 60 ? Math.ceil(attempt.durationSeconds / 60) : 15
    });
    setCompletedAttempt(null);
  };

  // Retry only wrong questions from an attempt
  const handleRetryWrongFromAttempt = () => {
    if (!completedAttempt) return;
    const questions = storageService.getQuestions();
    const incorrectIds = completedAttempt.answers
      .filter(a => !a.isCorrect)
      .map(a => a.questionId);

    const wrongQuestions = questions.filter(q => incorrectIds.includes(q.questionId));
    if (wrongQuestions.length === 0) return;

    handleStartCustomPractice(
      wrongQuestions,
      `Khắc phục ${wrongQuestions.length} câu làm sai trong bài thi vừa rồi`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] text-slate-800 font-sans antialiased">
      {/* Universal Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenExamSetup={() => handleSelectTab('random_exam')}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* State 1: Active Interactive Test in progress */}
        {activeSession ? (
          <PracticeSession
            questions={activeSession.questions}
            title={activeSession.title}
            attemptType={activeSession.attemptType}
            topicIds={activeSession.topicIds}
            mode={activeSession.mode}
            timerMinutes={activeSession.timerMinutes}
            onComplete={handleTestComplete}
            onExit={() => setActiveSession(null)}
          />
        ) : completedAttempt ? (
          /* State 2: Results & Review Screen */
          <ExamResultView
            attempt={completedAttempt}
            onRetry={() => handleRetryAttempt(completedAttempt)}
            onReviewWrong={handleRetryWrongFromAttempt}
            onBackToDashboard={() => {
              setCompletedAttempt(null);
              handleSelectTab('dashboard');
            }}
          />
        ) : (
          /* State 3: Normal Navigation Views */
          <>
            {/* USER VIEWS */}
            {currentTab === 'dashboard' && (
              <UserDashboard
                onSelectTopic={topic => setSetupTopic(topic)}
                onNavigateTab={handleSelectTab}
                onStartExam={handleStartRandomExam}
              />
            )}

            {currentTab === 'topics' && (
              <TopicPracticeList onSelectTopic={topic => setSetupTopic(topic)} />
            )}

            {currentTab === 'random_exam' && (
              <RandomExamSetup onStartExam={handleStartRandomExam} />
            )}

            {currentTab === 'wrong_questions' && (
              <WrongQuestionsView
                onStartPracticeOnQuestions={handleStartCustomPractice}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressMasteryView
                onSelectTopicForPractice={topic => setSetupTopic(topic)}
              />
            )}

            {currentTab === 'history' && (
              <AttemptHistoryView
                onViewAttemptDetail={attempt => setCompletedAttempt(attempt)}
                onRetryAttempt={handleRetryAttempt}
              />
            )}

            {currentTab === 'profile' && <UserProfileView />}

            {/* ADMIN VIEWS */}
            {currentTab === 'admin_dashboard' && (
              <AdminDashboard
                onNavigateTab={tab => handleSelectTab(tab)}
                onSelectTopicForImport={topicId => {
                  setAdminImportTopic(topicId);
                  handleSelectTab('admin_import');
                }}
              />
            )}

            {currentTab === 'admin_topics' && (
              <AdminTopicList
                onViewQuestions={topicId => {
                  setAdminQuestionBankTopic(topicId);
                  handleSelectTab('admin_questions');
                }}
                onImportExcel={topicId => {
                  setAdminImportTopic(topicId);
                  handleSelectTab('admin_import');
                }}
              />
            )}

            {currentTab === 'admin_questions' && (
              <AdminQuestionBank
                initialTopicId={adminQuestionBankTopic}
                onNavigateToImport={topicId => {
                  setAdminImportTopic(topicId);
                  handleSelectTab('admin_import');
                }}
              />
            )}

            {currentTab === 'admin_import' && (
              <AdminExcelImport
                initialTopicId={adminImportTopic}
                onImportComplete={topicId => {
                  setAdminQuestionBankTopic(topicId);
                  handleSelectTab('admin_questions');
                }}
              />
            )}

            {currentTab === 'admin_stats' && (
              <AdminDashboard
                onNavigateTab={tab => handleSelectTab(tab)}
              />
            )}

            {currentTab === 'admin_users' && <AdminUserList />}

            {currentTab === 'admin_history' && <AdminHistoryList />}

            {currentTab === 'admin_settings' && <AdminSettings />}
          </>
        )}
      </main>

      {/* Practice Configuration Modal (when clicking a topic) */}
      <PracticeSetupModal
        isOpen={Boolean(setupTopic)}
        onClose={() => setSetupTopic(null)}
        topic={setupTopic}
        onStart={handleStartTopicPractice}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setActiveSession(null);
          setCompletedAttempt(null);
          handleSelectTab('dashboard');
        }}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
