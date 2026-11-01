import React, { useState } from 'react';
import { Attempt, AnswerKey } from '../../types';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  BookOpen,
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ExamResultViewProps {
  attempt: Attempt;
  onRetry: () => void;
  onReviewWrong: () => void;
  onBackToDashboard: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  onRetry,
  onReviewWrong,
  onBackToDashboard
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs} giây`;
  };

  const filteredAnswers = attempt.answers.filter(ans => {
    if (filterMode === 'incorrect') return !ans.isCorrect;
    if (filterMode === 'correct') return ans.isCorrect;
    return true;
  });

  const isPassed = attempt.score >= 5.0;

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Result Card Hero */}
      <div className={`p-6 sm:p-8 rounded-3xl border text-white shadow-md relative overflow-hidden ${
        isPassed
          ? 'bg-gradient-to-br from-[#123B70] via-[#1E40AF] to-[#2563EB] border-blue-400/30'
          : 'bg-gradient-to-br from-slate-800 via-slate-900 to-[#123B70] border-slate-700'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/20">
              Kết quả bài thi hoàn thành
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{attempt.title}</h1>
            <p className="text-xs sm:text-sm text-blue-100">
              Đã ghi nhận lịch sử vào hệ thống OnVienChucBacNinh • {new Date(attempt.submittedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Big Score Box */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[160px]">
            <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">Điểm số</div>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              {attempt.score.toFixed(1)}
              <span className="text-lg font-normal text-blue-200">/10</span>
            </div>
            <div className="text-xs font-semibold text-white/90 mt-1">
              Đúng {attempt.correctCount}/{attempt.totalQuestions} ({attempt.accuracy}%)
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
          <div className="bg-white/10 rounded-xl p-3">
            <span className="text-blue-200 block text-[11px]">Số câu đúng</span>
            <strong className="text-base font-bold text-emerald-300">{attempt.correctCount} câu</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <span className="text-blue-200 block text-[11px]">Số câu sai</span>
            <strong className="text-base font-bold text-rose-300">{attempt.incorrectCount} câu</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <span className="text-blue-200 block text-[11px]">Chưa trả lời</span>
            <strong className="text-base font-bold text-amber-300">{attempt.unansweredCount} câu</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <span className="text-blue-200 block text-[11px]">Thời gian làm</span>
            <strong className="text-base font-bold text-white">{formatDuration(attempt.durationSeconds)}</strong>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onRetry}
            className="bg-[#123B70] hover:bg-[#2563EB] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài này</span>
          </button>

          {attempt.incorrectCount > 0 && (
            <button
              onClick={onReviewWrong}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Ôn tập {attempt.incorrectCount} câu làm sai</span>
            </button>
          )}
        </div>

        <button
          onClick={onBackToDashboard}
          className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Về trang chủ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Detailed Answers Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chi tiết câu hỏi và đáp án</h3>
            <p className="text-xs text-slate-500">
              Đối chiếu đáp án đã chọn, đáp án chuẩn của cơ quan thẩm quyền và căn cứ pháp lý
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả ({attempt.totalQuestions})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'incorrect' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Câu sai ({attempt.incorrectCount + attempt.unansweredCount})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Câu đúng ({attempt.correctCount})
            </button>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          {filteredAnswers.map((ans, idx) => {
            const q = ans.questionSnapshot;
            const isAnswered = ans.selectedAnswer !== null;

            return (
              <div
                key={ans.questionId}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  ans.isCorrect
                    ? 'bg-white border-slate-200'
                    : 'bg-rose-50/30 border-rose-200'
                }`}
              >
                {/* Question title row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      Câu #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      q.difficulty === 'Dễ'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'Trung bình'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <div>
                    {ans.isCorrect ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đúng (+1.0 điểm)
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        {isAnswered ? 'Sai' : 'Chưa làm'} (0 điểm)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm sm:text-base font-bold text-slate-900 mb-4">
                  {q.questionText}
                </div>

                {/* 4 Options Grid */}
                <div className="space-y-2 mb-4">
                  {(['A', 'B', 'C', 'D'] as AnswerKey[]).map(key => {
                    const text = q[`option${key}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'];
                    const isSelectedByUser = ans.selectedAnswer === key;
                    const isTheCorrectKey = ans.correctAnswerSnapshot === key;

                    let rowStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    let badgeStyle = 'bg-white border-slate-300 text-slate-600';

                    if (isTheCorrectKey) {
                      rowStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                      badgeStyle = 'bg-emerald-600 border-emerald-600 text-white';
                    } else if (isSelectedByUser && !isTheCorrectKey) {
                      rowStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-medium ring-1 ring-rose-300';
                      badgeStyle = 'bg-rose-600 border-rose-600 text-white';
                    }

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${rowStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-md border font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}>
                          {key}
                        </span>
                        <div className="flex-1 pt-0.5">
                          {text}
                        </div>
                        {isSelectedByUser && (
                          <span className="text-[11px] font-bold shrink-0 self-center px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">
                            Bạn chọn
                          </span>
                        )}
                        {isTheCorrectKey && (
                          <span className="text-[11px] font-bold shrink-0 self-center px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation and Legal Reference */}
                {(q.explanation || q.legalReference) && (
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
                    {q.explanation && (
                      <p>
                        <strong className="text-slate-900">Giải thích chi tiết:</strong> {q.explanation}
                      </p>
                    )}
                    {q.legalReference && (
                      <p className="text-slate-500 flex items-center gap-1.5 pt-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Căn cứ pháp lý: <strong className="text-slate-700">{q.legalReference}</strong></span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
