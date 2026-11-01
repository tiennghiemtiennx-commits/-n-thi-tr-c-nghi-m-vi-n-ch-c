import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConfigured,
  RECOMMENDED_FIRESTORE_RULES,
  FirebaseClientConfig
} from '../../services/firebase';
import {
  Settings,
  Shield,
  Database,
  Download,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Info
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const existingConfig = getStoredFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  const [config, setConfig] = useState<FirebaseClientConfig>(existingConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyRules = () => {
    navigator.clipboard.writeText(RECOMMENDED_FIRESTORE_RULES);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OnVienChucBacNinh_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu gốc mẫu? Toàn bộ câu hỏi tùy chỉnh và lịch sử hiện tại sẽ được nạp lại mặc định.')) {
      storageService.resetToDefault();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1500);
    }
  };

  const isConnected = isFirebaseConfigured();

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Cấu hình nền tảng & Tích hợp</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Cài đặt hệ thống & Kết nối Firebase
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý khóa cấu hình Firebase Authentication & Cloud Firestore, bảo mật Security Rules và sao lưu dữ liệu.
        </p>
      </div>

      {/* Firebase Status Badge */}
      <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
        isConnected
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <Flame className={`w-6 h-6 shrink-0 ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div>
            <h4 className="text-sm font-bold">
              {isConnected ? 'Firebase đã được cấu hình' : 'Đang sử dụng bộ lưu trữ nội bộ chuẩn hóa'}
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              {isConnected
                ? `Đã liên kết với dự án Firebase Project: ${config.projectId}`
                : 'Hệ thống đang hoạt động đầy đủ với Persistent Storage Engine nội bộ. Bạn có thể dán thông số Firebase bên dưới bất cứ lúc nào.'}
            </p>
          </div>
        </div>

        <a
          href="https://console.firebase.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Firebase Console</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Firebase Config Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Thông số kết nối Firebase (Client SDK Config)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Lấy từ Firebase Console &gt; Project Settings &gt; General &gt; Your apps &gt; Web app.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu cấu hình Firebase thành công!</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">apiKey</label>
              <input
                type="text"
                value={config.apiKey}
                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">projectId</label>
              <input
                type="text"
                value={config.projectId}
                onChange={e => setConfig({ ...config, projectId: e.target.value })}
                placeholder="onvienchucbacninh-edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">authDomain</label>
              <input
                type="text"
                value={config.authDomain}
                onChange={e => setConfig({ ...config, authDomain: e.target.value })}
                placeholder="onvienchucbacninh-edu.firebaseapp.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">storageBucket</label>
              <input
                type="text"
                value={config.storageBucket}
                onChange={e => setConfig({ ...config, storageBucket: e.target.value })}
                placeholder="onvienchucbacninh-edu.appspot.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">appId</label>
              <input
                type="text"
                value={config.appId}
                onChange={e => setConfig({ ...config, appId: e.target.value })}
                placeholder="1:123456789:web:abcdef"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">messagingSenderId</label>
              <input
                type="text"
                value={config.messagingSenderId}
                onChange={e => setConfig({ ...config, messagingSenderId: e.target.value })}
                placeholder="1234567890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#123B70] hover:bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Lưu cấu hình Firebase
          </button>
        </form>
      </div>

      {/* Firestore Security Rules Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Firestore Security Rules (Khuyên dùng)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Quy tắc bảo mật phân quyền máy chủ theo đúng Mục 14 & 15 của Master Prompt.
            </p>
          </div>

          <button
            onClick={handleCopyRules}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedRules ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedRules ? 'Đã sao chép!' : 'Sao chép Rules'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
          {RECOMMENDED_FIRESTORE_RULES}
        </pre>
      </div>

      {/* Data Backup & Reset */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span>Sao lưu & Quản lý dữ liệu hệ thống</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Xuất bản sao lưu dữ liệu ngân hàng câu hỏi, tiến độ và lịch sử làm bài dưới dạng tệp JSON.
          </p>
        </div>

        {resetSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Đã khôi phục dữ liệu gốc thành công!</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp sao lưu dữ liệu (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục dữ liệu gốc mặc định</span>
          </button>
        </div>
      </div>
    </div>
  );
};
