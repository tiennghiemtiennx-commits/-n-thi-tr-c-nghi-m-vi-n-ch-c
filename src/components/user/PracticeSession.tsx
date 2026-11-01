import React, { useState, useEffect } from 'react';
import { Question, Attempt, AttemptAnswer, AnswerKey, Difficulty, AttemptType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeSessionProps {
  questions: Question[];
  title: string;
  attemptType: AttemptType;
  topicIds: string[];
  mode: 'practice' | 'exam';
  timerMinutes: number; // 0 = unlimited
  onComplete: (attempt: Attempt) => void;
  onExit: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  questions,
  title,
  attemptType,
  topicIds,
  mode,
  timerMinutes,
  onComplete,
  onExit
}) => {
  const { currentUser } = useAuth();
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // User selected answers: map of questionId -> AnswerKey
  const [userAnswers, setUserAnswers] = useState<Record<string, AnswerKey>>({});
  // Flagged for review (Exam mode)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  // Practice mode revealed answers: questionId -> boolean
  const [practiceRevealed, setPracticeRevealed] = useState<Record<string, boolean>>({});

  // Countdown timer state
  const totalSeconds = timerMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [startTime] = useState<string>(new Date().toISOString());
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Timer countdown
  useEffect(() => {
    if (mode !== 'exam' || totalSeconds <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, totalSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (key: AnswerKey) => {
    if (!currentQ) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.questionId]: key
    }));

    if (mode === 'practice') {
      // In practice mode, immediately reveal answer and explanation
      setPracticeRevealed(prev => ({
        ...prev,
        [currentQ.questionId]: true
      }));

      // Log answer into storage service
      const isCorrect = key === currentQ.correctAnswer;
      storageService.recordQuestionAnswer(
        currentUser.uid,
        currentQ.questionId,
        currentQ.topicId,
        key,
        isCorrect
      );
    }
  };

  const toggleFlagCurrent = () => {
    if (!currentQ) return;
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQ.questionId]: !prev[currentQ.questionId]
    }));
  };

  // Compile final attempt and evaluate
  const handleSubmitExam = () => {
    const submittedAt = new Date().toISOString();
    const durationSeconds = Math.max(
      1,
      Math.round((new Date(submittedAt).getTime() - new Date(startTime).getTime()) / 1000)
    );

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const answersList: AttemptAnswer[] = questions.map(q => {
      const selected = userAnswers[q.questionId] || null;
      const isCorrect = selected === q.correctAnswer;

      if (!selected) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        questionId: q.questionId,
        topicId: q.topicId,
        selectedAnswer: selected,
        correctAnswerSnapshot: q.correctAnswer,
        questionSnapshot: {
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          explanation: q.explanation,
          legalReference: q.legalReference,
          difficulty: q.difficulty
        },
        isCorrect,
        answeredAt: submittedAt,
        flagged: Boolean(flaggedQuestions[q.questionId])
      };
    });

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const attempt: Attempt = {
      attemptId: `att_${Date.now()}`,
      userId: currentUser.uid,
      title,
      attemptType,
      topicIds,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      score: Math.round(score * 10) / 10,
      accuracy: Math.round(accuracy),
      durationSeconds,
      startedAt: startTime,
      submittedAt,
      status: 'completed',
      answers: answersList
    };

    // Save to persistent storage
    storageService.saveAttempt(attempt);

    // Confetti celebration if score >= 8
    if (score >= 8) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    onComplete(attempt);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  if (!currentQ) {
    return (
      <div className="bg-white p-8 rounded-2xl border text-center">
        <p className="text-sm text-slate-600">Không có câu hỏi khả dụng.</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const isCurrentRevealed = mode === 'practice' && practiceRevealed[currentQ.questionId];
  const selectedChoice = userAnswers[currentQ.questionId];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Session Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn dừng buổi làm bài này? Tiến độ chưa nộp sẽ không được lưu điểm.')) {
                onExit();
              }
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Thoát</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                mode === 'practice' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
              }`}>
                {mode === 'practice' ? 'Luyện tập' : 'Thi thử'}
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{title}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Câu {currentIndex + 1} / {totalQuestions}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          {mode === 'exam' && totalSeconds > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              secondsRemaining < 300
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          )}

          {/* Exam Mode: Flag current question */}
          {mode === 'exam' && (
            <button
              onClick={toggleFlagCurrent}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                flaggedQuestions[currentQ.questionId]
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Đánh dấu câu hỏi cần xem lại"
            >
              <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentQ.questionId] ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">Đánh dấu</span>
            </button>
          )}

          {/* Submit CTA */}
          {mode === 'exam' ? (
            <button
              onClick={() => setShowSubmitConfirmModal(true)}
              className="bg-[#123B70] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          ) : (
            <button
              onClick={handleSubmitExam}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hoàn thành ({answeredCount}/{totalQuestions})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Question & Options */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Question Meta Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Câu hỏi #{currentIndex + 1}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentQ.difficulty === 'Dễ'
                    ? 'bg-emerald-50 text-emerald-700'
                    : currentQ.difficulty === 'Trung bình'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {currentQ.difficulty}
                </span>
              </div>

              {currentQ.legalReference && (
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{currentQ.legalReference}</span>
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as AnswerKey[]).map(key => {
                const optionText = currentQ[`option${key}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'];
                const isSelected = selectedChoice === key;

                // Color logic for practice mode vs exam mode
                let optionStyle = 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';
                let indicatorStyle = 'border-slate-300 text-slate-600 bg-slate-50';

                if (mode === 'practice' && isCurrentRevealed) {
                  if (key === currentQ.correctAnswer) {
                    optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/30';
                    indicatorStyle = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (isSelected && key !== currentQ.correctAnswer) {
                    optionStyle = 'border-rose-400 bg-rose-50/80 text-rose-950 ring-2 ring-rose-500/30';
                    indicatorStyle = 'bg-rose-600 text-white border-rose-600';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-[#2563EB] bg-blue-50/70 text-[#123B70] ring-2 ring-blue-500/20';
                  indicatorStyle = 'bg-[#2563EB] text-white border-[#2563EB]';
                }

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectAnswer(key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${optionStyle}`}
                  >
                    <span className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${indicatorStyle}`}>
                      {key}
                    </span>
                    <span className="text-sm font-medium leading-relaxed pt-0.5">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* In Practice Mode: Immediate Explanation & Citation Box */}
            {mode === 'practice' && isCurrentRevealed && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  {selectedChoice === currentQ.correctAnswer ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Chính xác! Đáp án đúng là {currentQ.correctAnswer}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Chưa chính xác. Đáp án đúng là {currentQ.correctAnswer}
                    </span>
                  )}
                </div>

                {currentQ.explanation && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Giải thích:</strong> {currentQ.explanation}
                  </p>
                )}

                {currentQ.legalReference && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Căn cứ pháp lý: <strong>{currentQ.legalReference}</strong></span>
                  </p>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <div className="text-xs font-medium text-slate-400">
                {currentIndex + 1} / {totalQuestions}
              </div>

              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#123B70] hover:bg-[#2563EB] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Câu tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : mode === 'exam' ? (
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmModal(true)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Nộp bài thi</span>
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem kết quả</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 col: Question Palette Navigator */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách câu hỏi
              </h4>
              <span className="text-xs font-bold text-slate-700">
                Đã làm: {answeredCount}/{totalQuestions}
              </span>
            </div>

            {/* Grid of question numbers */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(userAnswers[q.questionId]);
                const isFlagged = Boolean(flaggedQuestions[q.questionId]);

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent';

                if (isCurrent) {
                  btnClass = 'ring-2 ring-[#2563EB] bg-blue-100 text-[#123B70] font-black';
                } else if (isAnswered) {
                  btnClass = 'bg-[#123B70] text-white font-bold';
                }

                if (isFlagged) {
                  btnClass += ' ring-2 ring-amber-400';
                }

                return (
                  <button
                    key={q.questionId}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs transition-all relative flex items-center justify-center border cursor-pointer ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#123B70]"></span>
                <span>Đã trả lời ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200"></span>
                <span>Chưa trả lời ({unansweredCount})</span>
              </div>
              {mode === 'exam' && (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-400"></span>
                  <span>Đã đánh dấu xem lại</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal (for Exam Mode) */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Xác nhận nộp bài thi</h3>
              <p className="text-xs text-slate-500">
                Hệ thống sẽ ghi nhận và chấm điểm toàn bộ bài thi của bạn.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Số câu đã trả lời:</span>
                <strong className="text-emerald-600 font-bold">{answeredCount} câu</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Số câu chưa trả lời:</span>
                <strong className={unansweredCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                  {unansweredCount} câu
                </strong>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Bạn còn {unansweredCount} câu chưa chọn đáp án. Các câu chưa trả lời sẽ được tính 0 điểm.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirmModal(false);
                  handleSubmitExam();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
