import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { UserWrongQuestion, Question } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Filter,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface WrongQuestionsViewProps {
  onStartPracticeOnQuestions: (questions: Question[], title: string) => void;
}

export const WrongQuestionsView: React.FC<WrongQuestionsViewProps> = ({
  onStartPracticeOnQuestions
}) => {
  const { currentUser } = useAuth();
  const topics = storageService.getTopics();
  const allQuestions = storageService.getQuestions();

  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_review' | 'recovered'>('needs_review');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  const wrongRecords = storageService.getUserWrongQuestions(currentUser.uid, {
    topicId: selectedTopicId,
    status: statusFilter
  });

  // Enrich with question details
  const enrichedList = wrongRecords.map(rec => {
    const q = allQuestions.find(item => item.questionId === rec.questionId);
    const t = topics.find(item => item.topicId === rec.topicId);
    return {
      record: rec,
      question: q,
      topic: t
    };
  }).filter(item => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      item.question?.questionText.toLowerCase().includes(s) ||
      item.topic?.name.toLowerCase().includes(s)
    );
  });

  const needsReviewCount = storageService
    .getUserWrongQuestions(currentUser.uid, { status: 'needs_review' })
    .length;
  const recoveredCount = storageService
    .getUserWrongQuestions(currentUser.uid, { status: 'recovered' })
    .length;

  const toggleExplanation = (questionId: string) => {
    setExpandedExplanation(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleStartReviewSession = (targetQuestions: Question[]) => {
    if (targetQuestions.length === 0) return;
    onStartPracticeOnQuestions(
      targetQuestions,
      `Ôn tập chuyên sâu ${targetQuestions.length} câu hỏi từng trả lời sai`
    );
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-3 border border-rose-100">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Sổ tay câu sai & Khắc phục lỗ hổng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Ngân hàng câu hỏi trả lời sai cá nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Hệ thống tự động ghi nhận câu sai từ mọi lượt luyện tập. Theo nguyên tắc: Bạn cần trả lời đúng <strong>2 lần liên tiếp</strong> ở các lượt độc lập để được xác nhận là <em>Đã khắc phục</em>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex gap-2">
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold block">Chưa khắc phục</span>
              <span className="text-xl font-black">{needsReviewCount}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold block">Đã khắc phục</span>
              <span className="text-xl font-black">{recoveredCount}</span>
            </div>
          </div>

          {needsReviewCount > 0 && (
            <button
              onClick={() => {
                const unrecoveredQuestions = enrichedList
                  .filter(item => item.record.status === 'needs_review' && item.question)
                  .map(item => item.question as Question);
                handleStartReviewSession(unrecoveredQuestions);
              }}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện lại các câu sai ngay</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('needs_review')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'needs_review' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Cần ôn ({needsReviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('recovered')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'recovered' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Đã khắc phục ({recoveredCount})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Topic Dropdown */}
          <div>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả 10 chủ đề pháp luật</option>
              {topics.map(t => (
                <option key={t.topicId} value={t.topicId}>
                  {t.code} - {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa câu hỏi..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
            </input>
          </div>
        </div>
      </div>

      {/* List of Wrong Questions */}
      {enrichedList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không có câu hỏi nào trong danh mục này</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tuyệt vời! Bạn không có câu hỏi nào cần ôn tập với bộ lọc hiện tại. Hãy tiếp tục luyện thi các chủ đề mới.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrichedList.map(({ record, question, topic }) => {
            if (!question) return null;
            const isRecovered = record.status === 'recovered';
            const isExpanded = expandedExplanation[question.questionId];

            return (
              <div
                key={record.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                  isRecovered ? 'border-emerald-200 bg-white' : 'border-rose-200 shadow-xs'
                }`}
              >
                {/* Meta Top */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {topic ? topic.code : 'Chủ đề'}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {topic?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {isRecovered ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã khắc phục ({record.correctStreak}/2 chuỗi đúng)
                      </span>
                    ) : (
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Đã sai {record.wrongCount} lần • Chuỗi đúng: {record.correctStreak}/2
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div className="text-sm sm:text-base font-bold text-slate-900 mb-3">
                  {question.questionText}
                </div>

                {/* Options mini-view */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                  {(['A', 'B', 'C', 'D'] as const).map(key => {
                    const text = question[`option${key}`];
                    const isCorrect = question.correctAnswer === key;
                    const wasSelected = record.lastSelectedAnswer === key;

                    let pillStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isCorrect) {
                      pillStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
                    } else if (wasSelected) {
                      pillStyle = 'bg-rose-50 border-rose-300 text-rose-950';
                    }

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${pillStyle}`}
                      >
                        <span className="font-bold shrink-0">{key}.</span>
                        <span className="flex-1">{text}</span>
                        {wasSelected && !isCorrect && (
                          <span className="text-[10px] text-rose-600 font-bold shrink-0">Bạn chọn sai</span>
                        )}
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-700 font-bold shrink-0">Đáp án đúng</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Toggle */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 my-3 animate-in fade-in">
                    {question.explanation && (
                      <p>
                        <strong>Giải thích:</strong> {question.explanation}
                      </p>
                    )}
                    {question.legalReference && (
                      <p className="text-slate-500 flex items-center gap-1 pt-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Căn cứ pháp lý: <strong>{question.legalReference}</strong></span>
                      </p>
                    )}
                  </div>
                )}

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Lần sai gần nhất: {new Date(record.lastWrongAt).toLocaleDateString('vi-VN')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExplanation(question.questionId)}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer font-medium"
                    >
                      {isExpanded ? 'Ẩn giải thích' : 'Xem giải thích'}
                    </button>
                    <button
                      onClick={() => handleStartReviewSession([question])}
                      className="px-3.5 py-1.5 bg-[#123B70] hover:bg-[#2563EB] text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Luyện lại câu này</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
