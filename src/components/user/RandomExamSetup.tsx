import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { generateExamQuestions } from '../../utils/examGenerator';
import { Difficulty, Question } from '../../types';
import {
  Shuffle,
  Clock,
  Sparkles,
  CheckSquare,
  Square,
  Play,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface RandomExamSetupProps {
  onStartExam: (sessionConfig: {
    questions: Question[];
    title: string;
    topicIds: string[];
    timerMinutes: number;
  }) => void;
}

export const RandomExamSetup: React.FC<RandomExamSetupProps> = ({ onStartExam }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const topics = storageService.getTopics();
  const allQuestions = storageService.getQuestions();

  // Selected topics state (default: all 10 topics)
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(topics.map(t => t.topicId));
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<Difficulty | 'Hỗn hợp'>('Hỗn hợp');
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Calculate total available matching questions
  const totalInSelectedTopics = allQuestions.filter(
    q => q.status === 'active' && selectedTopicIds.includes(q.topicId)
  ).length;

  const countOptions = [20, 30, 40, 50, 100];

  const handleToggleTopic = (topicId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      if (selectedTopicIds.length === 1) {
        setErrorMessage('Bạn phải chọn ít nhất một chủ đề.');
        return;
      }
      setSelectedTopicIds(selectedTopicIds.filter(id => id !== topicId));
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId]);
    }
    setErrorMessage('');
  };

  const handleSelectAllTopics = () => {
    setSelectedTopicIds(topics.map(t => t.topicId));
    setErrorMessage('');
  };

  const handleClearAllTopics = () => {
    // Keep at least the first
    setSelectedTopicIds([topics[0].topicId]);
  };

  const handleGenerate = () => {
    if (selectedTopicIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 chủ đề.');
      return;
    }

    // Get previous attempts to prioritize unattempted questions
    const pastAttempts = storageService.getAttempts(currentUser.uid);
    const seenIds = new Set<string>();
    for (const att of pastAttempts) {
      for (const a of att.answers) {
        seenIds.add(a.questionId);
      }
    }

    const generated = generateExamQuestions(allQuestions, {
      topicIds: selectedTopicIds,
      totalQuestions: questionCount,
      difficulty,
      attemptedQuestionIds: seenIds
    });

    if (generated.length === 0) {
      setErrorMessage('Không tìm thấy câu hỏi phù hợp với các tiêu chí đã chọn. Vui lòng thử nới lỏng mức độ khó hoặc chọn thêm chủ đề.');
      return;
    }

    const title = `Đề thi tổng hợp ngẫu nhiên (${generated.length} câu • ${selectedTopicIds.length} chủ đề)`;
    onStartExam({
      questions: generated,
      title,
      topicIds: selectedTopicIds,
      timerMinutes
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
          <Shuffle className="w-3.5 h-3.5 text-blue-600" />
          <span>Thuật toán tạo đề thi ngẫu nhiên</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Luyện đề thi thử ngẫu nhiên
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Tạo đề thi tự động từ ngân hàng câu hỏi chuẩn. Hệ thống bảo đảm không trùng câu hỏi trong đề, cân đối số lượng giữa các chủ đề và mô phỏng áp lực phòng thi thật.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Section 1: Scope of Topics */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Phạm vi chủ đề ({selectedTopicIds.length}/10 chủ đề đã chọn)
              </label>
              <p className="text-[11px] text-slate-400">
                Chọn các nội dung văn bản bạn muốn đưa vào đề thi
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAllTopics}
                className="font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Chọn tất cả 10
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleClearAllTopics}
                className="font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Chỉ chọn 1
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {topics.map(t => {
              const isSelected = selectedTopicIds.includes(t.topicId);
              return (
                <button
                  key={t.topicId}
                  type="button"
                  onClick={() => handleToggleTopic(t.topicId)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/60 text-[#123B70]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="font-mono text-[10px] font-bold text-blue-600 block">
                      {t.code}
                    </span>
                    <strong className="text-slate-900 font-bold block">{t.name}</strong>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{t.documentNumber}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Number of questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Số lượng câu hỏi trong đề
            </label>
            <span className="text-xs text-slate-500">
              Số câu hiện có trong phạm vi chọn: <strong className="text-slate-900">{totalInSelectedTopics}</strong> câu
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {countOptions.map(cnt => {
              const isAvailable = cnt <= totalInSelectedTopics;
              return (
                <button
                  key={cnt}
                  type="button"
                  disabled={!isAvailable && totalInSelectedTopics < 10}
                  onClick={() => setQuestionCount(cnt)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-[#123B70] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cnt} câu
                  {!isAvailable && totalInSelectedTopics > 0 && cnt > totalInSelectedTopics && (
                    <span className="block text-[9px] font-normal opacity-70">
                      (Tối đa {totalInSelectedTopics})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Difficulty & Timer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Difficulty */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Mức độ câu hỏi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Hỗn hợp', 'Dễ', 'Trung bình', 'Khó'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    difficulty === d
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Giới hạn thời gian làm bài
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 0, label: 'Tự do' },
                { val: 15, label: '15p' },
                { val: 30, label: '30p' },
                { val: 45, label: '45p' },
                { val: 60, label: '60p' }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setTimerMinutes(opt.val)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timerMinutes === opt.val
                      ? 'bg-[#123B70] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Mỗi lượt thi được cấp một mã định danh riêng biệt để lưu lịch sử.</span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-black text-sm px-7 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Tạo đề & Bắt đầu thi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
