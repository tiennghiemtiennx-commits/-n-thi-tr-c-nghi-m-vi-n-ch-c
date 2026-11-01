import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Topic, UserTopicProgress } from '../../types';
import { getMasteryLevelBadgeColor } from '../../utils/mastery';
import {
  TrendingUp,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  PieChart
} from 'lucide-react';

interface ProgressMasteryViewProps {
  onSelectTopicForPractice: (topic: Topic) => void;
}

export const ProgressMasteryView: React.FC<ProgressMasteryViewProps> = ({
  onSelectTopicForPractice
}) => {
  const { currentUser } = useAuth();
  const topics = storageService.getTopics();
  const allProgress = storageService.getAllUserTopicProgress(currentUser.uid);
  const wrongQuestions = storageService.getUserWrongQuestions(currentUser.uid);
  const [selectedTopicDetail, setSelectedTopicDetail] = useState<UserTopicProgress | null>(null);

  // Overall calculations
  const totalQuestionsDone = allProgress.reduce((sum, p) => sum + p.totalCorrect + p.totalIncorrect, 0);
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.totalCorrect, 0);
  const totalRecovered = wrongQuestions.filter(w => w.status === 'recovered').length;
  const totalWrong = wrongQuestions.length;

  const eligibleTopics = allProgress.filter(p => p.isEligible);
  const avgMastery = eligibleTopics.length > 0
    ? Math.round(eligibleTopics.reduce((sum, p) => sum + p.masteryScore, 0) / eligibleTopics.length)
    : 0;

  // Automated contextual insights (per section 10.5)
  const insights: string[] = [];
  const strongTopic = [...allProgress].sort((a, b) => b.masteryScore - a.masteryScore)[0];
  const weakTopic = [...allProgress]
    .filter(p => p.uniqueQuestionsAnswered > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore)[0];

  if (strongTopic && strongTopic.masteryScore >= 60) {
    const t = topics.find(item => item.topicId === strongTopic.topicId);
    if (t) {
      insights.push(`Bạn đang có kết quả tốt ở chủ đề ${t.name} với mức độ thành thạo ${strongTopic.masteryScore}%.`);
    }
  }

  if (weakTopic && weakTopic.accuracy < 70) {
    const t = topics.find(item => item.topicId === weakTopic.topicId);
    if (t) {
      insights.push(`Chủ đề ${t.name} đang là nội dung cần ưu tiên ôn tập.`);
    }
  }

  if (totalWrong > 0) {
    insights.push(`Bạn đã khắc phục được ${totalRecovered}/${totalWrong} câu hỏi từng trả lời sai.`);
  }

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hệ thống phân tích & Đánh giá năng lực chuyên sâu</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Tiến độ học tập và Mức độ thành thạo kiến thức
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Website không chỉ đánh giá người dùng qua một điểm số duy nhất mà đo lường độ ổn định, khả năng phục hồi câu sai và mức độ bao phủ độ khó qua toàn bộ lịch sử ôn luyện.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center min-w-[140px] shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Thành thạo chung</span>
            <div className="text-3xl font-black text-[#123B70] mt-0.5">
              {eligibleTopics.length > 0 ? `${avgMastery}%` : 'Chưa đủ'}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {eligibleTopics.length}/10 chủ đề đủ dữ liệu
            </span>
          </div>
        </div>

        {/* Notice required by prompt Section 10.3 */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <em>Ghi chú:</em> Mức độ thành thạo được ước tính dựa trên kết quả luyện tập của bạn, không phải kết quả đánh giá chính thức của kỳ thi.
          </span>
        </div>
      </div>

      {/* Automatic Pedagogical Insights Box (Section 10.5) */}
      {insights.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nhận xét tiến độ tự động</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
            {insights.map((msg, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500">•</span>
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main 10 Topics Mastery Table (Section 10.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bảng theo dõi 10 chủ đề cố định</h3>
            <p className="text-xs text-slate-500">Cập nhật tự động sau mỗi lượt nộp bài độc lập</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Chủ đề pháp luật</th>
                <th className="py-3.5 px-4 text-center">Số câu đã luyện</th>
                <th className="py-3.5 px-4 text-center">Tỷ lệ đúng</th>
                <th className="py-3.5 px-4 text-center">Mức độ thành thạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topics.map(topic => {
                const prog = allProgress.find(p => p.topicId === topic.topicId) || storageService.getUserTopicProgress(currentUser.uid, topic.topicId);
                const badge = getMasteryLevelBadgeColor(prog.masteryLevel);
                const percentDone = topic.questionCount > 0
                  ? Math.min(100, Math.round((prog.uniqueQuestionsAnswered / topic.questionCount) * 100))
                  : 0;

                return (
                  <tr key={topic.topicId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Col 1: Topic */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 text-sm">{topic.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{topic.legalDocument}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{topic.documentNumber}</div>
                    </td>

                    {/* Col 2: Questions practiced */}
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-slate-900 text-sm">
                        {prog.uniqueQuestionsAnswered} <span className="text-slate-400 font-normal">/ {topic.questionCount}</span>
                      </div>
                      <div className="w-20 mx-auto bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-[#2563EB] h-full rounded-full"
                          style={{ width: `${percentDone}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Col 3: Accuracy */}
                    <td className="py-4 px-4 text-center">
                      <div className={`font-black text-sm ${prog.accuracy >= 75 ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {prog.totalCorrect + prog.totalIncorrect > 0 ? `${prog.accuracy}%` : '—'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {prog.totalCorrect} đúng / {prog.totalCorrect + prog.totalIncorrect} câu
                      </div>
                    </td>

                    {/* Col 4: Mastery Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {prog.masteryLevel} {prog.isEligible && `(${prog.masteryScore}%)`}
                      </span>
                      {!prog.isEligible && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Cần thêm {10 - prog.uniqueQuestionsAnswered} câu khác nhau
                        </div>
                      )}
                    </td>

                    {/* Col 5: Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTopicDetail(prog)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-white cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => onSelectTopicForPractice(topic)}
                          className="px-3 py-1 text-xs font-bold text-white bg-[#123B70] hover:bg-[#2563EB] rounded-lg transition-colors cursor-pointer"
                        >
                          Ôn tập
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Explanation Section (Section 10.2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Thuật toán tính điểm thành thạo chuẩn hóa (Mastery Score)</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Điểm số thành thạo được chuẩn hóa về thang điểm 0–100 dựa trên 4 trọng số khoa học, chống hiện tượng spam lặp đi lặp lại một câu hỏi:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500">Độ chính xác khi làm bài</div>
            <div className="text-2xl font-black text-blue-600 mt-1">50%</div>
            <p className="text-[11px] text-slate-500 mt-1">Tỷ lệ trả lời đúng trên tổng số câu hỏi đã làm.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500">Tính ổn định qua nhiều lần thi</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">25%</div>
            <p className="text-[11px] text-slate-500 mt-1">Độ lệch chuẩn điểm số giữa các lượt làm bài độc lập.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500">Khả năng khắc phục câu sai</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">15%</div>
            <p className="text-[11px] text-slate-500 mt-1">Tỷ lệ câu sai đã đạt chuỗi 2 lần đúng liên tiếp.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500">Độ bao phủ các mức độ khó</div>
            <div className="text-2xl font-black text-amber-600 mt-1">10%</div>
            <p className="text-[11px] text-slate-500 mt-1">Mức độ tiếp cận và trả lời các câu Dễ, Trung bình, Khó.</p>
          </div>
        </div>

        {/* Tier mapping table (Section 10.4) */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 mb-2">Thang phân loại cấp độ:</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">&lt; 10 câu: Chưa đủ dữ liệu</span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">0–39: Chưa thành thạo</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">40–59: Đang học</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">60–79: Khá</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">80–94: Thành thạo</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">95–100: Rất thành thạo</span>
          </div>
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopicDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">Chi tiết phân rã điểm thành thạo</h4>
              <button
                onClick={() => setSelectedTopicDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Độ chính xác (50%):</span>
                <strong className="text-slate-900 font-bold">{selectedTopicDetail.accuracy}%</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Tính ổn định (25%):</span>
                <strong className="text-slate-900 font-bold">{selectedTopicDetail.consistency}%</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Khắc phục câu sai (15%):</span>
                <strong className="text-slate-900 font-bold">{selectedTopicDetail.recovery}%</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Bao phủ độ khó (10%):</span>
                <strong className="text-slate-900 font-bold">{selectedTopicDetail.difficultyCoverage}%</strong>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold bg-blue-50/70 p-3 rounded-xl text-blue-900">
                <span>Tổng điểm thành thạo:</span>
                <span>{selectedTopicDetail.masteryScore}/100</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTopicDetail(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
