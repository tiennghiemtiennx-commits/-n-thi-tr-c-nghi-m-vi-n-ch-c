import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Question, Topic, Difficulty, AnswerKey } from '../../types';
import {
  Database,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminQuestionBankProps {
  initialTopicId?: string;
  onNavigateToImport: (topicId: string) => void;
}

export const AdminQuestionBank: React.FC<AdminQuestionBankProps> = ({
  initialTopicId,
  onNavigateToImport
}) => {
  const topics = storageService.getTopics();
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    topicId: initialTopicId || topics[0]?.topicId || 'topic-01',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A' as AnswerKey,
    difficulty: 'Trung bình' as Difficulty,
    explanation: '',
    legalReference: ''
  });

  const questions = storageService.getQuestions({
    topicId: selectedTopicId,
    difficulty: selectedDifficulty,
    search: searchTerm
  });

  const totalPages = Math.ceil(questions.length / pageSize) || 1;
  const paginatedQuestions = questions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetForm = () => {
    setFormData({
      topicId: selectedTopicId !== 'all' ? selectedTopicId : topics[0]?.topicId || 'topic-01',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      difficulty: 'Trung bình',
      explanation: '',
      legalReference: ''
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      topicId: q.topicId,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      explanation: q.explanation || '',
      legalReference: q.legalReference || ''
    });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) return;

    if (editingQuestion) {
      storageService.updateQuestion(editingQuestion.questionId, {
        ...formData
      });
      setEditingQuestion(null);
    } else {
      storageService.addQuestion({
        ...formData,
        status: 'active'
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingQuestion) return;
    storageService.deleteQuestion(deletingQuestion.questionId);
    setDeletingQuestion(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Ngân hàng câu hỏi trắc nghiệm</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Quản trị ngân hàng câu hỏi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng số: <strong className="text-slate-900">{questions.length}</strong> câu hỏi phù hợp với bộ lọc hiện tại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateToImport(selectedTopicId !== 'all' ? selectedTopicId : 'topic-01')}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
          >
            Nhập nhanh từ Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Topic filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Chủ đề:</label>
          <select
            value={selectedTopicId}
            onChange={e => {
              setSelectedTopicId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả 10 chủ đề</option>
            {topics.map(t => (
              <option key={t.topicId} value={t.topicId}>
                {t.code} - {t.name} ({t.questionCount} câu)
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Mức độ khó:</label>
          <select
            value={selectedDifficulty}
            onChange={e => {
              setSelectedDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Tìm kiếm nội dung:</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nội dung, đáp án, căn cứ..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      {paginatedQuestions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          Không có câu hỏi nào khớp với tiêu chí tìm kiếm.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedQuestions.map((q, idx) => {
            const topic = topics.find(t => t.topicId === q.topicId);
            const globalIndex = (currentPage - 1) * pageSize + idx + 1;

            return (
              <div
                key={q.questionId}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all space-y-3"
              >
                {/* Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{globalIndex}</span>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {topic ? topic.code : q.topicId}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{topic?.name}</span>
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {q.questionText}
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as AnswerKey[]).map(key => {
                    const text = q[`option${key}`];
                    const isCorrect = q.correctAnswer === key;

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-300'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded font-bold text-[11px] flex items-center justify-center shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
                        }`}>
                          {key}
                        </span>
                        <span className="flex-1 pt-0.5">{text}</span>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-700 font-bold shrink-0 self-center">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation and Citation */}
                {(q.explanation || q.legalReference) && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    {q.explanation && (
                      <p>
                        <strong className="text-slate-800">Giải thích:</strong> {q.explanation}
                      </p>
                    )}
                    {q.legalReference && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Căn cứ: <strong className="text-slate-700">{q.legalReference}</strong></span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {(showAddModal || editingQuestion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#123B70] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới vào ngân hàng'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingQuestion(null);
                }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Topic & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chủ đề pháp luật (*)</label>
                  <select
                    value={formData.topicId}
                    onChange={e => setFormData({ ...formData, topicId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    {topics.map(t => (
                      <option key={t.topicId} value={t.topicId}>
                        {t.code} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức độ khó (*)</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung câu hỏi (*)</label>
                <textarea
                  rows={3}
                  value={formData.questionText}
                  onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                  required
                  placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">4 Phương án trả lời (*)</label>
                {(['A', 'B', 'C', 'D'] as AnswerKey[]).map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0 border">
                      {key}
                    </span>
                    <input
                      type="text"
                      value={formData[`option${key}`]}
                      onChange={e => setFormData({ ...formData, [`option${key}`]: e.target.value })}
                      required
                      placeholder={`Nội dung đáp án ${key}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Đáp án đúng (*)</label>
                <div className="flex gap-4">
                  {(['A', 'B', 'C', 'D'] as AnswerKey[]).map(key => (
                    <label key={key} className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                      <input
                        type="radio"
                        name="correctAnswerKey"
                        value={key}
                        checked={formData.correctAnswer === key}
                        onChange={() => setFormData({ ...formData, correctAnswer: key })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Đáp án {key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Explanation & Legal Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giải thích (Tùy chọn)</label>
                  <textarea
                    rows={2}
                    value={formData.explanation}
                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Giải thích lý do đáp án đúng..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Căn cứ pháp lý (Tùy chọn)</label>
                  <textarea
                    rows={2}
                    value={formData.legalReference}
                    onChange={e => setFormData({ ...formData, legalReference: e.target.value })}
                    placeholder="Ví dụ: Điều 14, Nghị định số 259/2026/NĐ-CP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {editingQuestion ? 'Lưu chỉnh sửa' : 'Thêm câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Xóa câu hỏi khỏi ngân hàng?</h3>
              <p className="text-xs text-slate-500">
                Lưu ý: Theo yêu cầu hệ thống, lịch sử làm bài trước đây của thí sinh vẫn được giữ nguyên snapshot và không bị thay đổi.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200 line-clamp-3">
              "{deletingQuestion.questionText}"
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuestion(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
