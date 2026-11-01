import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Logo } from '../common/Logo';
import { X, LogIn, Key, Mail, AlertCircle, Shield, UserCheck, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const users = storageService.getUsers();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.error || 'Đăng nhập không thành công.');
    }
  };

  const handleQuickSelect = (u: any) => {
    setEmail(u.email);
    setPassword(u.password || (u.role === 'admin' ? 'admin123' : 'password123'));
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#123B70] px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-2">
            <Logo variant="light" size="md" />
          </div>
          <h3 className="text-lg font-black text-white">Đăng nhập hệ thống</h3>
          <p className="text-xs text-blue-200 mt-1">
            Sử dụng Email và Mật khẩu do Admin cấp phát
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nhap-email@bacninh.edu.vn"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#123B70] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
            </button>
          </form>

          {/* Quick select test accounts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tài khoản mẫu nhanh:
            </span>
            <div className="space-y-1.5">
              {users.slice(0, 4).map(u => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => handleQuickSelect(u)}
                  className="w-full p-2 rounded-xl text-left hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="truncate">
                    <strong className="text-slate-800">{u.displayName}</strong>{' '}
                    <span className="text-slate-500">({u.role === 'admin' ? 'Admin' : 'Thí sinh'})</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-600 font-bold shrink-0">
                    Chọn nhanh
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
