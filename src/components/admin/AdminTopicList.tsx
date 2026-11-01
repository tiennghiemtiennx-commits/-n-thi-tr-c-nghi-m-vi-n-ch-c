import React from 'react';
import { storageService } from '../../services/storageService';
import { Topic } from '../../types';
import { BookOpen, FileSpreadsheet, Database, Calendar, AlertCircle } from 'lucide-react';

interface AdminTopicListProps {
  onViewQuestions: (topicId: string) => void;
  onImportExcel: (topicId: string) => void;
}

export const AdminTopicList: React.FC<AdminTopicListProps> = ({
  onViewQuestions,
  onImportExcel
}) => {
  const topics = storageService.getTopics();

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Danh mục 10 chủ đề pháp luật chuẩn hóa</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Quản lý 10 chủ đề cố định
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo quy chế của nền tảng: Danh mục 10 chủ đề này là cố định và không cho phép xóa hay tạo thêm chủ đề mới trong phiên bản hiện tại. Admin chọn từng chủ đề để quản lý và tải lên câu hỏi.
        </p>
      </div>

      {/* Grid of 10 topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map(topic => (
          <div
            key={topic.topicId}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  {topic.code}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-0.5 rounded-full">
                  {topic.questionCount} câu hỏi
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {topic.name}
              </h3>

              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="text-slate-400">Văn bản căn cứ:</span>{' '}
                  <strong className="text-slate-800">{topic.legalDocument}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Số hiệu:</span>{' '}
                  <span className="font-mono font-bold text-slate-800">{topic.documentNumber}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {topic.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Cập nhật: {new Date(topic.updatedAt).toLocaleDateString('vi-VN')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewQuestions(topic.topicId)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Xem câu hỏi</span>
                </button>
                <button
                  onClick={() => onImportExcel(topic.topicId)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Nhập Excel</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
