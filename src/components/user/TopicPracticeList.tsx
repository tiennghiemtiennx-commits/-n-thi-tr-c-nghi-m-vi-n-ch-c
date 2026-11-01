import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Topic } from '../../types';
import { getMasteryLevelBadgeColor } from '../../utils/mastery';
import {
  BookOpen,
  Search,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TopicPracticeListProps {
  onSelectTopic: (topic: Topic) => void;
}

export const TopicPracticeList: React.FC<TopicPracticeListProps> = ({ onSelectTopic }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const topics = storageService.getTopics();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = topics.filter(t => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(s) ||
      t.code.toLowerCase().includes(s) ||
      t.legalDocument.toLowerCase().includes(s) ||
      t.documentNumber.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ngân hàng 10 chủ đề cố định</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Ôn tập theo từng chủ đề pháp luật
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chọn chủ đề để luyện tập có phản hồi ngay hoặc làm bài thi thử bấm giờ theo cấu trúc chuẩn.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên luật, số hiệu..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* 10 Topics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map(topic => {
          const prog = storageService.getUserTopicProgress(currentUser.uid, topic.topicId);
          const badge = getMasteryLevelBadgeColor(prog.masteryLevel);
          const percentPracticed = topic.questionCount > 0
            ? Math.min(100, Math.round((prog.uniqueQuestionsAnswered / topic.questionCount) * 100))
            : 0;

          return (
            <div
              key={topic.topicId}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    {topic.code}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {prog.masteryLevel} {prog.isEligible && `• ${prog.masteryScore}%`}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {topic.name}
                  </h3>
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{topic.legalDocument}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Số hiệu văn bản: <span className="font-mono text-slate-700 font-semibold">{topic.documentNumber}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Tiến độ: <strong>{prog.uniqueQuestionsAnswered}</strong>/{topic.questionCount} câu
                  </span>
                  <span>Độ chính xác: <strong className="text-blue-600">{prog.accuracy}%</strong></span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentPracticed}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {topic.questionCount === 0 ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Chưa có câu hỏi
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        {topic.questionCount} câu hỏi chuẩn
                      </span>
                    )}
                  </span>

                  <button
                    onClick={() => onSelectTopic(topic)}
                    className="bg-[#123B70] hover:bg-[#2563EB] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Bắt đầu ôn tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
