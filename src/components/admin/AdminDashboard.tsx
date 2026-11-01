import React from 'react';
import { storageService } from '../../services/storageService';
import {
  Database,
  BookOpen,
  Users,
  History,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { AdminTab } from '../common/Header';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
  onSelectTopicForImport?: (topicId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onSelectTopicForImport
}) => {
  const stats = storageService.getAdminStats();
  const topics = storageService.getTopics();
  const importHistory = storageService.getImportHistory();

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Hero Banner */}
      <div className="bg-[#123B70] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hệ thống Quản trị Nội dung & Ngân hàng Đề</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Bảng điều khiển Quản trị viên
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            Quản lý ngân hàng câu hỏi 10 chủ đề pháp luật thi viên chức giáo dục tỉnh Bắc Ninh. Nhập dữ liệu tự động bằng Excel, giám sát lịch sử làm bài và tình trạng người dùng.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('admin_import')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập câu hỏi Excel</span>
          </button>
          <button
            onClick={() => onNavigateTab('admin_questions')}
            className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-4 h-4 text-blue-200" />
            <span>Xem ngân hàng câu hỏi</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tổng số chủ đề</span>
            <span className="p-2 bg-blue-50 text-[#123B70] rounded-xl">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalTopics}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">10 chủ đề cố định theo danh mục</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ngân hàng câu hỏi</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalQuestions}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {stats.difficultyCounts['Dễ']} Dễ • {stats.difficultyCounts['Trung bình']} TB • {stats.difficultyCounts['Khó']} Khó
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tài khoản người dùng</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalUsers}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Thí sinh & Quản trị viên</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tổng lượt làm bài</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalAttempts}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lượt thi thử & luyện tập</span>
        </div>
      </div>

      {/* Grid: Topics question distribution + Recent import logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Topic question counts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Phân bố câu hỏi theo 10 chủ đề</h3>
              <p className="text-xs text-slate-500">Số lượng câu hỏi chuẩn đang hoạt động trong hệ thống</p>
            </div>
            <button
              onClick={() => onNavigateTab('admin_topics')}
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {topics.map(topic => {
              const maxCount = Math.max(1, ...topics.map(t => t.questionCount));
              const percent = Math.round((topic.questionCount / maxCount) * 100);

              return (
                <div key={topic.topicId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-sm">
                      <strong className="text-blue-600 font-mono mr-1">{topic.code}:</strong> {topic.name}
                    </span>
                    <span className="font-bold text-slate-700 shrink-0">
                      {topic.questionCount} câu
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#123B70] h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 col: Recent Excel Imports */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Lịch sử nhập Excel gần đây</h3>
              <button
                onClick={() => onNavigateTab('admin_history')}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Các đợt tải file ngân hàng câu hỏi mới nhất</p>

            <div className="space-y-3 mt-4">
              {importHistory.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  Chưa có lịch sử nhập file Excel. Hãy tải file lên qua mục Nhập Excel.
                </div>
              ) : (
                importHistory.slice(0, 4).map(rec => (
                  <div
                    key={rec.importId}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[150px]">{rec.fileName}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        +{rec.successfulRows} câu
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Chủ đề: <strong className="text-slate-700">{rec.topicName}</strong>
                    </p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(rec.importedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('admin_import')}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Tải lên câu hỏi mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
