import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Topic } from '../../types';
import {
  BookOpen,
  Shuffle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface UserDashboardProps {
  onSelectTopic: (topic: Topic) => void;
  onNavigateTab: (tab: any) => void;
  onStartExam: (config: any) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onSelectTopic,
  onNavigateTab,
  onStartExam
}) => {
  const { currentUser } = useAuth();
  const topics = storageService.getTopics();
  const attempts = storageService.getAttempts(currentUser.uid);
  const allProgress = storageService.getAllUserTopicProgress(currentUser.uid);
  const wrongQuestions = storageService.getUserWrongQuestions(currentUser.uid);

  // Overall Statistics
  const totalQuestionsAnswered = allProgress.reduce((sum, p) => sum + p.totalCorrect + p.totalIncorrect, 0);
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.totalCorrect, 0);
  const overallAccuracy = totalQuestionsAnswered > 0
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
    : 0;

  const unrecoveredWrongCount = wrongQuestions.filter(w => w.status === 'needs_review').length;
  const recentAttempt = attempts[0];
  const recentTopic = recentAttempt?.topicIds?.[0]
    ? storageService.getTopicById(recentAttempt.topicIds[0])
    : topics[0];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Welcome Banner with Large, Clear Typography */}
      <div className="bg-gradient-to-r from-[#123B70] via-[#1b467f] to-[#2563EB] rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs sm:text-sm font-bold border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Kỳ thi tuyển dụng viên chức Giáo dục & Đào tạo Bắc Ninh 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Xin chào, {currentUser.displayName}!
          </h1>

          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-3xl">
            Chào mừng bạn đến với <strong>OnVienChucBacNinh</strong>. Hãy chọn một trong 3 hình thức ôn luyện bên dưới để tiếp tục rèn luyện kỹ năng làm bài trắc nghiệm.
          </p>
        </div>
      </div>

      {/* 4 Clear High-Level Metric Cards (Larger Numbers & Clear Labels) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Câu đã làm */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Đã làm</span>
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {totalQuestionsAnswered}
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
            {totalCorrect} câu trả lời đúng
          </div>
        </div>

        {/* Card 2: Tỷ lệ đúng */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Tỷ lệ đúng</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className={`text-3xl sm:text-4xl font-black ${overallAccuracy >= 70 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {totalQuestionsAnswered > 0 ? `${overallAccuracy}%` : '0%'}
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
            Độ chính xác trung bình
          </div>
        </div>

        {/* Card 3: Câu cần ôn lại */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Câu cần ôn lại</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className={`text-3xl sm:text-4xl font-black ${unrecoveredWrongCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {unrecoveredWrongCount}
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
            {unrecoveredWrongCount > 0 ? 'Cần làm đúng 2 lần' : 'Không có câu sai'}
          </div>
        </div>

        {/* Card 4: Số đề đã thi */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Đã hoàn thành</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {attempts.length}
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
            Lượt thi & luyện tập
          </div>
        </div>
      </div>

      {/* 3 Main Clear Learning Action Portals (Non-overlapping, Large & Prominent) */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900">
          Chọn mục ôn luyện
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Action 1: Ôn theo chủ đề */}
          <div
            onClick={() => onNavigateTab('topics')}
            className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 hover:border-[#123B70] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-6 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#123B70] flex items-center justify-center group-hover:bg-[#123B70] group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#123B70] transition-colors">
                1. Ôn theo chủ đề
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ngân hàng 10 chủ đề pháp luật chuẩn hóa (Luật Viên chức, Luật Giáo dục, Nghị định 259...). Xem đáp án và giải thích ngay.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">10 Chủ đề</span>
              <span className="text-xs sm:text-sm font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Vào ôn ngay</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Action 2: Luyện đề ngẫu nhiên */}
          <div
            onClick={() => onNavigateTab('random_exam')}
            className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-6 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Shuffle className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                2. Thi thử ngẫu nhiên
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tạo đề thi tổng hợp nhiều chủ đề, có bấm giờ tự động, chấm điểm theo thang 10 mô phỏng bài thi thật.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">15 - 60 phút</span>
              <span className="text-xs sm:text-sm font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Tạo đề thi</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Action 3: Sổ tay câu sai */}
          <div
            onClick={() => onNavigateTab('wrong_questions')}
            className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-6 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                3. Ôn tập câu sai
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tập trung luyện lại các câu hỏi bạn từng trả lời sai cho đến khi trả lời đúng 2 lần liên tiếp để khắc phục lỗ hổng.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                {unrecoveredWrongCount} câu cần sửa
              </span>
              <span className="text-xs sm:text-sm font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Luyện câu sai</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning or Quick Topic CTA */}
      {recentTopic && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Chủ đề gợi ý tiếp theo
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {recentTopic.code}: {recentTopic.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Căn cứ pháp lý: {recentTopic.legalDocument} ({recentTopic.documentNumber})
            </p>
          </div>

          <button
            onClick={() => onSelectTopic(recentTopic)}
            className="bg-[#123B70] hover:bg-[#2563EB] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-colors shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Bắt đầu ôn tập chủ đề này</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
