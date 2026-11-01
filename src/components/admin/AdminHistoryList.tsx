import React from 'react';
import { storageService } from '../../services/storageService';
import { History, FileSpreadsheet, CheckCircle2, User, Calendar } from 'lucide-react';

export const AdminHistoryList: React.FC = () => {
  const history = storageService.getImportHistory();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Nhật ký kiểm toán dữ liệu</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Lịch sử nhập dữ liệu bằng file Excel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận toàn bộ thông tin về các đợt nạp câu hỏi, số dòng thành công, phương thức nạp và người thực hiện.
          </p>
        </div>
      </div>

      {/* History Table */}
      {history.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          Chưa có nhật ký nhập file nào trong hệ thống.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Tệp tải lên</th>
                  <th className="py-3.5 px-4">Chủ đề pháp luật</th>
                  <th className="py-3.5 px-4 text-center">Số câu nạp</th>
                  <th className="py-3.5 px-4 text-center">Phương thức</th>
                  <th className="py-3.5 px-4">Người thực hiện</th>
                  <th className="py-3.5 px-4 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map(rec => (
                  <tr key={rec.importId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-xs">{rec.fileName}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {rec.topicName}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                        +{rec.successfulRows} câu
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        rec.importMode === 'replace'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {rec.importMode === 'replace' ? 'Thay thế toàn bộ' : 'Thêm mới'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {rec.adminName}
                    </td>

                    <td className="py-4 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(rec.importedAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
