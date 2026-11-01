import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import {
  parseAndValidateExcelData,
  createExcelTemplateWorkbook
} from '../../utils/excelValidator';
import { Topic, ParsedExcelRow, AnswerKey, Difficulty } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileCheck,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Database
} from 'lucide-react';

interface AdminExcelImportProps {
  initialTopicId?: string;
  onImportComplete: (topicId: string) => void;
}

export const AdminExcelImport: React.FC<AdminExcelImportProps> = ({
  initialTopicId,
  onImportComplete
}) => {
  const { currentUser } = useAuth();
  const topics = storageService.getTopics();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || topics[0]?.topicId || 'topic-01');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [totalValid, setTotalValid] = useState<number>(0);
  const [totalInvalid, setTotalInvalid] = useState<number>(0);
  const [totalDuplicates, setTotalDuplicates] = useState<number>(0);

  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [showReplaceConfirmModal, setShowReplaceConfirmModal] = useState<boolean>(false);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'errors' | 'valid' | 'duplicates'>('all');

  const selectedTopic = topics.find(t => t.topicId === selectedTopicId);
  const existingQuestionsInTopic = storageService.getQuestions({ topicId: selectedTopicId });

  // 1. Download official Excel template (.xlsx)
  const handleDownloadTemplate = () => {
    const wb = createExcelTemplateWorkbook();
    XLSX.writeFile(wb, 'OnVienChucBacNinh_MauNhapCauHoi.xlsx');
  };

  // 2. Read and parse uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportSuccess(false);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'binary' });

        // Prefer first sheet or sheet named 'Mau_Cau_Hoi'
        const sheetName = wb.SheetNames.includes('Mau_Cau_Hoi') ? 'Mau_Cau_Hoi' : wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        const result = parseAndValidateExcelData(rawData, {
          existingQuestionsInTopic
        });

        setParsedRows(result.rows);
        setTotalValid(result.totalValid);
        setTotalInvalid(result.totalInvalid);
        setTotalDuplicates(result.totalDuplicates);
      } catch (err) {
        console.error('Lỗi khi đọc file Excel:', err);
        alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng tệp .xlsx hoặc tải mẫu chuẩn.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 3. Confirm and execute import
  const handleExecuteImport = () => {
    if (!selectedFile || totalValid === 0) return;

    if (importMode === 'replace' && !showReplaceConfirmModal) {
      setShowReplaceConfirmModal(true);
      return;
    }

    const validQuestionsToImport = parsedRows
      .filter(r => r.isValid)
      .map(r => ({
        questionText: r.questionText,
        optionA: r.optionA,
        optionB: r.optionB,
        optionC: r.optionC,
        optionD: r.optionD,
        correctAnswer: r.correctAnswer,
        difficulty: r.difficulty,
        explanation: r.explanation,
        legalReference: r.legalReference,
        status: 'active' as const
      }));

    storageService.batchImportQuestions(
      selectedTopicId,
      validQuestionsToImport,
      importMode,
      selectedFile.name,
      currentUser.uid,
      currentUser.displayName
    );

    setShowReplaceConfirmModal(false);
    setImportSuccess(true);
  };

  const filteredPreviewRows = parsedRows.filter(r => {
    if (previewFilter === 'errors') return !r.isValid;
    if (previewFilter === 'valid') return r.isValid;
    if (previewFilter === 'duplicates') return r.isDuplicate;
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quy trình nạp dữ liệu chuẩn hóa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Nhập ngân hàng câu hỏi bằng file Excel (.xlsx)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Hệ thống hỗ trợ kiểm tra lỗi định dạng, đối soát câu hỏi trùng lặp và cho phép xem trước toàn bộ dữ liệu trước khi quyết định nạp vào Firestore.
          </p>
        </div>

        {/* Template download CTA */}
        <button
          onClick={handleDownloadTemplate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Tải file mẫu Excel chuẩn</span>
        </button>
      </div>

      {importSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Nhập câu hỏi thành công!</h4>
              <p className="text-xs text-emerald-800">
                Đã nạp thành công <strong>{totalValid}</strong> câu hỏi vào chủ đề{' '}
                <strong>{selectedTopic?.name}</strong> theo chế độ{' '}
                {importMode === 'replace' ? 'Thay thế toàn bộ' : 'Thêm mới'}.
              </p>
            </div>
          </div>

          <button
            onClick={() => onImportComplete(selectedTopicId)}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shrink-0 cursor-pointer"
          >
            Xem ngân hàng câu hỏi
          </button>
        </div>
      )}

      {/* Step 1 & 2 Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Chọn chủ đề */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Bước 1: Chọn chủ đề cần nạp câu hỏi (*)</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Admin bắt buộc chọn 1 trong 10 chủ đề cố định trước khi tải file
            </p>
            <select
              value={selectedTopicId}
              onChange={e => {
                setSelectedTopicId(e.target.value);
                setParsedRows([]);
                setSelectedFile(null);
                setImportSuccess(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              {topics.map(t => (
                <option key={t.topicId} value={t.topicId}>
                  {t.code} - {t.name} (Hiện có: {t.questionCount} câu)
                </option>
              ))}
            </select>

            {selectedTopic && (
              <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                Văn bản pháp luật: <strong className="text-slate-800">{selectedTopic.legalDocument}</strong> ({selectedTopic.documentNumber})
              </div>
            )}
          </div>

          {/* Step 2: Tải lên file Excel */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Bước 2: Chọn tệp Excel (.xlsx) (*)</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Định dạng bảng có các cột STT, Câu hỏi, Đáp án A-D, Đáp án đúng, Mức độ
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1.5"
            >
              <Upload className="w-6 h-6 text-slate-400" />
              <div className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Nhấn để chọn file Excel (.xlsx)'}
              </div>
              <span className="text-[10px] text-slate-400">Hỗ trợ Excel định dạng .xlsx</span>
            </div>
          </div>
        </div>

        {/* Mode selector: Append vs Replace */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Phương thức nhập dữ liệu:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              importMode === 'append'
                ? 'border-[#2563EB] bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white'
            }`}>
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <strong className="text-slate-900 block font-bold">1. Thêm câu hỏi vào ngân hàng hiện có (Mặc định)</strong>
                <span className="text-slate-500 text-[11px] leading-relaxed">
                  Giữ lại các câu hỏi đang có của chủ đề và bổ sung thêm các câu hỏi hợp lệ mới từ file.
                </span>
              </div>
            </label>

            <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              importMode === 'replace'
                ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                : 'border-slate-200 bg-white'
            }`}>
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="mt-0.5 text-amber-600 focus:ring-amber-500"
              />
              <div className="text-xs">
                <strong className="text-amber-950 block font-bold">2. Thay thế toàn bộ câu hỏi của chủ đề này</strong>
                <span className="text-slate-500 text-[11px] leading-relaxed">
                  Làm mới toàn bộ câu hỏi của chủ đề. Lịch sử bài làm trước đây vẫn được giữ nguyên an toàn.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Step 3: Preview and Validation Results Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Bảng xem trước & Kết quả đối soát</h3>
              <p className="text-xs text-slate-500">
                Tìm thấy {parsedRows.length} dòng dữ liệu trong tệp tải lên
              </p>
            </div>

            {/* Validation Tally Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Hợp lệ: {totalValid}
              </span>

              {totalInvalid > 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 font-bold border border-rose-200 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Lỗi: {totalInvalid}
                </span>
              )}

              {totalDuplicates > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Trùng lặp: {totalDuplicates}
                </span>
              )}
            </div>
          </div>

          {/* Filter preview rows */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Xem:</span>
            <button
              onClick={() => setPreviewFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                previewFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Tất cả ({parsedRows.length})
            </button>
            <button
              onClick={() => setPreviewFilter('valid')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                previewFilter === 'valid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Chỉ hợp lệ ({totalValid})
            </button>
            {totalInvalid > 0 && (
              <button
                onClick={() => setPreviewFilter('errors')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  previewFilter === 'errors' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Chỉ dòng lỗi ({totalInvalid})
              </button>
            )}
            {totalDuplicates > 0 && (
              <button
                onClick={() => setPreviewFilter('duplicates')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  previewFilter === 'duplicates' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Trùng lặp ({totalDuplicates})
              </button>
            )}
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 text-center">Dòng</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Nội dung câu hỏi</th>
                  <th className="py-2.5 px-3">Phương án (A / B / C / D)</th>
                  <th className="py-2.5 px-3 text-center">Đ/Án</th>
                  <th className="py-2.5 px-3 text-center">Mức độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPreviewRows.map(row => (
                  <tr
                    key={row.rowNumber}
                    className={`hover:bg-slate-50 transition-colors ${
                      !row.isValid ? 'bg-rose-50/40' : row.isDuplicate ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                      {row.rowNumber}
                    </td>

                    <td className="py-3 px-3 shrink-0">
                      {row.isValid ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                            Hợp lệ
                          </span>
                          {row.isDuplicate && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full block mt-0.5" title={row.duplicateOf}>
                              Cảnh báo trùng
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
                            Không hợp lệ
                          </span>
                          <ul className="text-[10px] text-rose-600 list-disc list-inside">
                            {row.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 max-w-xs font-semibold text-slate-900">
                      {row.questionText || <em className="text-rose-500">Trống</em>}
                      {row.duplicateOf && (
                        <div className="text-[10px] text-amber-700 mt-1 italic">
                          {row.duplicateOf}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px] text-slate-600 max-w-sm space-y-0.5">
                      <div><strong>A:</strong> {row.optionA || <span className="text-rose-500 font-bold">Trống</span>}</div>
                      <div><strong>B:</strong> {row.optionB || <span className="text-rose-500 font-bold">Trống</span>}</div>
                      <div><strong>C:</strong> {row.optionC || <span className="text-rose-500 font-bold">Trống</span>}</div>
                      <div><strong>D:</strong> {row.optionD || <span className="text-rose-500 font-bold">Trống</span>}</div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-900">
                        {row.correctAnswer}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {row.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirm Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Chỉ các dòng hợp lệ (<strong>{totalValid}</strong> câu) sẽ được ghi nhận vào ngân hàng.
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={totalValid === 0}
              className="w-full sm:w-auto bg-[#123B70] hover:bg-[#2563EB] disabled:opacity-40 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận nhập {totalValid} câu hỏi vào hệ thống</span>
            </button>
          </div>
        </div>
      )}

      {/* Replace Confirmation Modal */}
      {showReplaceConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Xác nhận thay thế toàn bộ?</h3>
              <p className="text-xs text-slate-500">
                Toàn bộ <strong>{existingQuestionsInTopic.length}</strong> câu hỏi hiện có của chủ đề{' '}
                <strong>{selectedTopic?.name}</strong> sẽ được thay thế bằng{' '}
                <strong>{totalValid}</strong> câu hỏi mới từ file.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
              ✓ Lịch sử làm bài thi, tiến độ học tập và câu sai trước đó của người dùng vẫn được bảo toàn an toàn.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReplaceConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận thay thế
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
