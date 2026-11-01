import React, { useState } from 'react';
import { Topic, Difficulty } from '../../types';
import { X, Play, Clock, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface PracticeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  onStart: (config: {
    topic: Topic;
    questionCount: number;
    difficulty: Difficulty | 'Hỗn hợp';
    mode: 'practice' | 'exam';
    timerMinutes: number; // 0 = unlimited
  }) => void;
}

export const PracticeSetupModal: React.FC<PracticeSetupModalProps> = ({
  isOpen,
  onClose,
  topic,
  onStart
}) => {
  if (!isOpen || !topic) return null;

  const totalAvailable = topic.questionCount;
  const questionCountOptions = [10, 20, 30, 50].filter(count => count <= totalAvailable);

  const [questionCount, setQuestionCount] = useState<number>(() => {
    if (totalAvailable <= 0) return 0;
    if (totalAvailable <= 10) return totalAvailable;
    return 10;
  });

  const [isAllSelected, setIsAllSelected] = useState<boolean>(totalAvailable <= 10);
  const [difficulty, setDifficulty] = useState<Difficulty | 'Hỗn hợp'>('Hỗn hợp');
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [timerMinutes, setTimerMinutes] = useState<number>(mode === 'exam' ? 15 : 0);

  const handleSelectCount = (count: number) => {
    setIsAllSelected(false);
    setQuestionCount(count);
  };

  const handleSelectAll = () => {
    setIsAllSelected(true);
    setQuestionCount(totalAvailable);
  };

  const handleStart = () => {
    const finalCount = isAllSelected ? totalAvailable : questionCount;
    if (finalCount <= 0) return;

    onStart({
      topic,
      questionCount: finalCount,
      difficulty,
      mode,
      timerMinutes: mode === 'exam' ? timerMinutes : 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#123B70] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Thiết lập ôn tập • {topic.code}
            </div>
            <h3 className="text-lg font-black mt-0.5 text-white">{topic.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-6">
          {totalAvailable === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Chưa có câu hỏi trong ngân hàng</p>
                <p className="mt-1">
                  Chủ đề này hiện chưa có câu hỏi hoạt động. Vui lòng vào tài khoản Admin để nhập dữ liệu bằng file Excel trước khi bắt đầu.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Option 1: Chế độ làm bài */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Chọn chế độ ôn luyện
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('practice');
                      setTimerMinutes(0);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === 'practice'
                        ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Chế độ Luyện tập
                      </span>
                      {mode === 'practice' && <CheckCircle className="w-4 h-4 text-[#2563EB]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Phản hồi đúng/sai ngay từng câu, hiển thị giải thích và căn cứ pháp lý để ghi nhớ.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('exam');
                      setTimerMinutes(15);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === 'exam'
                        ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        Chế độ Thi thử
                      </span>
                      {mode === 'exam' && <CheckCircle className="w-4 h-4 text-[#2563EB]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Có bấm giờ, ẩn đáp án đúng trong quá trình thi, chấm điểm thang 10 sau khi nộp bài.
                    </p>
                  </button>
                </div>
              </div>

              {/* Option 2: Số lượng câu hỏi */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Số lượng câu hỏi
                  </label>
                  <span className="text-xs text-slate-500">
                    Hiện có: <strong className="text-slate-900">{totalAvailable}</strong> câu
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {questionCountOptions.map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleSelectCount(count)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isAllSelected && questionCount === count
                          ? 'bg-[#123B70] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {count} câu
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isAllSelected
                        ? 'bg-[#123B70] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({totalAvailable} câu)
                  </button>
                </div>
              </div>

              {/* Option 3: Mức độ câu hỏi */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  3. Độ khó câu hỏi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Hỗn hợp', 'Dễ', 'Trung bình', 'Khó'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        difficulty === level
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 4 (If Exam mode): Thời gian làm bài */}
              {mode === 'exam' && (
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    4. Thời gian làm bài
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { val: 0, label: 'Không giới hạn' },
                      { val: 15, label: '15 phút' },
                      { val: 30, label: '30 phút' },
                      { val: 45, label: '45 phút' },
                      { val: 60, label: '60 phút' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setTimerMinutes(opt.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={totalAvailable === 0}
            onClick={handleStart}
            className="bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Bắt đầu ôn tập</span>
          </button>
        </div>
      </div>
    </div>
  );
};
