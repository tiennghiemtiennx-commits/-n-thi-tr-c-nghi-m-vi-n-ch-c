import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Logo } from '../common/Logo';
import { User } from '../../types';
import {
  LogIn,
  Key,
  Mail,
  AlertCircle,
  Shield,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  PhoneCall,
  GraduationCap
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allUsers = storageService.getUsers();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại Email và Mật khẩu.');
    }
  };

  const handleQuickLogin = async (user: User) => {
    const defaultPass = user.password || (user.role === 'admin' ? 'admin123' : 'password123');
    setEmail(user.email);
    setPassword(defaultPass);
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(user.email, defaultPass);
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Không thể đăng nhập bằng tài khoản này.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-[#0e2f5a] to-slate-900 flex flex-col justify-between text-slate-100">
      {/* Top Banner Notice */}
      <div className="bg-black/30 border-b border-white/10 px-4 py-2 text-center text-xs text-blue-200">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
        Hội đồng tuyển dụng viên chức ngành Giáo dục & Đào tạo tỉnh Bắc Ninh 2026
      </div>

      {/* Main Login Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand & Educational Context */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>Cổng Thi Tuyển & Ôn Luyện Trắc Nghiệm</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                OnVienChuc<span className="text-amber-400">BacNinh</span>
              </h1>
              <p className="text-sm sm:text-base text-blue-200 mt-2 font-medium">
                Ôn tập thông minh – Tự tin thi tuyển
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hệ thống quản lý ôn tập 10 chuyên đề văn bản quy phạm pháp luật chuẩn hóa (Luật Viên chức, Luật Giáo dục, Luật Nhà giáo, Nghị định 259/2026/NĐ-CP...) phục vụ kỳ thi tuyển dụng giáo viên và viên chức ngành giáo dục tỉnh Bắc Ninh.
            </p>

            <div className="space-y-2.5 pt-2 hidden sm:block">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Phân quyền độc lập: Thí sinh luyện thi – Admin quản lý ngân hàng câu hỏi</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <span>Tài khoản & mật khẩu do Admin cấp phát bảo mật tuyệt đối</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Tự động nhận diện vai trò và chuyển đúng giao diện phù hợp</span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card & Quick Accounts */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 text-slate-900 overflow-hidden">
              {/* Header Box */}
              <div className="bg-[#123B70] px-6 py-6 text-white text-center">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Đăng nhập hệ thống
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 mt-1">
                  Nhập Email và Mật khẩu được cấp phát để truy cập
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                      Địa chỉ Email đăng nhập
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Ví dụ: nguyenvanan@bacninh.edu.vn"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu của bạn..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#123B70] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold text-sm sm:text-base py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Đang xác thực thông tin...' : 'Đăng nhập'}</span>
                  </button>
                </form>

                {/* Quick 1-Click Role Accounts */}
                <div className="pt-5 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Chọn nhanh tài khoản mẫu để thử nghiệm:
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold">Tự động nhận diện vai trò</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {allUsers.slice(0, 4).map(u => {
                      const isAdm = u.role === 'admin';
                      return (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => handleQuickLogin(u)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                            isAdm
                              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400 hover:bg-amber-100/60'
                              : 'bg-slate-50 border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isAdm ? 'bg-amber-500 text-white' : 'bg-[#123B70] text-white'
                              }`}
                            >
                              {isAdm ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                            </div>
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#123B70] truncate">
                                {u.displayName}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {u.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isAdm
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isAdm ? 'Quản trị viên' : 'Thí sinh'}
                            </span>
                            <span className="text-xs text-blue-600 group-hover:translate-x-0.5 transition-transform font-bold">
                              →
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cơ chế bảo mật & Phân quyền:</span>
                  </div>
                  <p>
                    • Đăng nhập tài khoản <strong>Quản trị viên</strong>: Hệ thống mở trực tiếp menu Quản trị (ngân hàng câu hỏi, nhập Excel, cấp phát mật khẩu người dùng).
                  </p>
                  <p>
                    • Đăng nhập tài khoản <strong>Thí sinh</strong>: Hệ thống mở trực tiếp giao diện Ôn luyện, Sổ tay câu sai và Đánh giá thành thạo cá nhân.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-3 text-center text-xs text-slate-400">
        © 2026 OnVienChucBacNinh - Hệ thống ôn thi tuyển dụng viên chức ngành Giáo dục & Đào tạo tỉnh Bắc Ninh. Hotline: 0222 3822 555.
      </footer>
    </div>
  );
};
