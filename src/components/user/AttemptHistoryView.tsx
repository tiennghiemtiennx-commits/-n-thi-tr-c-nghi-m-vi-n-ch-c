import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Attempt } from '../../types';
import {
  History,
  Clock,
  Award,
  ChevronRight,
  RotateCcw,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

interface AttemptHistoryViewProps {
  onViewAttemptDetail: (attempt: Attempt) => void;
  onRetryAttempt: (attempt: Attempt) => void;
}

export const AttemptHistoryView: React.FC<AttemptHistoryViewProps> = ({
  onViewAttemptDetail,
  onRetryAttempt
}) => {
  const { currentUser } = useAuth();
  const topics = storageService.getTopics();
  const attempts = storageService.getAttempts(currentUser.uid);

  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredAttempts = attempts.filter(att => {
    if (selectedType !== 'all' && att.attemptType !== selectedType) return false;
    if (selectedTopicId !== 'all') {
      if (!att.topicIds.includes(selectedTopicId)) return false;
    }
    return true;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}p ${secs}s`;
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Nhật ký ôn luyện cá nhân</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Lịch sử các lần làm bài thi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lưu trữ vĩnh viễn trên hệ thống, không bị mất khi đăng xuất hay làm bài mới.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Tổng số lượt làm bài</span>
          <span className="text-2xl font-black text-[#123B70]">{attempts.length} lượt</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Bộ lọc:</span>
        </div>

        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700"
        >
          <option value="all">Tất cả hình thức</option>
          <option value="topic_practice">Luyện tập theo chủ đề</option>
          <option value="topic_exam">Thi thử theo chủ đề</option>
          <option value="random_exam">Đề thi ngẫu nhiên</option>
          <option value="wrong_recovery">Ôn tập câu sai</option>
        </select>

        <select
          value={selectedTopicId}
          onChange={e => setSelectedTopicId(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 max-w-xs truncate"
        >
          <option value="all">Tất cả chủ đề</option>
          {topics.map(t => (
            <option key={t.topicId} value={t.topicId}>
              {t.code} - {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filteredAttempts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          Chưa có bài thi nào trong lịch sử phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttempts.map(att => {
            const isGood = att.score >= 7.0;

            return (
              <div
                key={att.attemptId}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {att.attemptType === 'random_exam'
                        ? 'Đề ngẫu nhiên'
                        : att.attemptType === 'topic_exam'
                        ? 'Thi thử chủ đề'
                        : att.attemptType === 'wrong_recovery'
                        ? 'Khắc phục câu sai'
                        : 'Luyện tập'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(att.submittedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {att.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>Thời gian: <strong className="text-slate-800">{formatDuration(att.durationSeconds)}</strong></span>
                    <span>•</span>
                    <span>Đúng: <strong className="text-emerald-600">{att.correctCount}</strong>/{att.totalQuestions} ({att.accuracy}%)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  {/* Score pill */}
                  <div className={`px-3.5 py-1.5 rounded-xl font-black text-sm border ${
                    isGood
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}>
                    {att.score.toFixed(1)} / 10
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRetryAttempt(att)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Làm lại đề này"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewAttemptDetail(att)}
                      className="bg-[#123B70] hover:bg-[#2563EB] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem đáp án</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
