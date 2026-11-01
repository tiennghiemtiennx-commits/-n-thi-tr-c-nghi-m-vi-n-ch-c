import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import {
  LogIn,
  Key,
  Mail,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Sparkles,
  GraduationCap,
  HelpCircle,
  PhoneCall
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(
        res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại Email và Mật khẩu hoặc liên hệ Quản trị viên.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-[#0e2f5a] to-slate-900 flex flex-col justify-between text-slate-100">
      {/* Top Banner Notice */}
      <div className="bg-black/30 border-b border-white/10 px-4 py-2.5 text-center text-xs sm:text-sm text-blue-200">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mr-2 align-middle"></span>
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                OnVienChuc<span className="text-amber-400">BacNinh</span>
              </h1>
              <p className="text-base sm:text-lg text-blue-200 mt-2 font-medium">
                Ôn tập chuẩn hóa – Tự tin trúng tuyển
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Hệ thống quản lý ôn tập 10 chuyên đề văn bản quy phạm pháp luật chuẩn hóa (Luật Viên chức, Luật Giáo dục, Luật Nhà giáo, Nghị định 259/2026/NĐ-CP...) phục vụ kỳ thi tuyển dụng viên chức ngành giáo dục tỉnh Bắc Ninh.
            </p>

            <div className="space-y-3 pt-2 hidden sm:block">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Phân quyền độc lập: Thí sinh luyện thi – Admin quản lý ngân hàng câu hỏi & tài khoản.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <span>Bảo mật truy cập: Chỉ tài khoản được Admin cấp phép mới có quyền đăng nhập.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Tự động nhận diện vai trò và điều hướng vào đúng không gian làm việc.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Secure Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 text-slate-900 overflow-hidden">
              {/* Header Box */}
              <div className="bg-[#123B70] px-6 sm:px-8 py-7 text-white text-center">
                <div className="inline-flex p-3 rounded-2xl bg-white/10 text-white mb-2">
                  <Lock className="w-6 h-6 text-amber-300" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Đăng nhập hệ thống
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 mt-1.5 font-medium">
                  Vui lòng nhập Email và Mật khẩu được cấp phát để truy cập
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-start gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Đăng nhập thất bại</div>
                      <div className="mt-0.5 text-xs sm:text-sm text-rose-700">{errorMessage}</div>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-800 block mb-2">
                      Địa chỉ Email tài khoản
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Nhập email được cấp (vd: hoten@bacninh.edu.vn)..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm sm:text-base text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-800 block mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu của bạn..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm sm:text-base text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#123B70] hover:bg-[#1a4a8d] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-base py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>{isLoading ? 'Đang kiểm tra thông tin...' : 'Đăng nhập vào hệ thống'}</span>
                  </button>
                </form>

                {/* Security and Access Policy Note */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-2">
                    <div className="font-bold flex items-center gap-2 text-amber-800 text-sm">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Chính sách kiểm soát truy cập & Bảo mật</span>
                    </div>
                    <p className="leading-relaxed text-amber-800">
                      Hệ thống hoạt động theo cơ chế cấp phát nội bộ. Chỉ tài khoản và mật khẩu do Quản trị viên/Hội đồng tuyển dụng tạo lập mới có thể đăng nhập. Người không được cấp quyền sẽ bị từ chối truy cập.
                    </p>
                  </div>

                  {/* Help and Contact */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>Chưa có tài khoản hoặc quên mật khẩu?</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>0222 3822 555</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-3 text-center text-xs text-slate-400">
        © 2026 OnVienChucBacNinh - Hệ thống ôn thi tuyển dụng viên chức ngành Giáo dục & Đào tạo tỉnh Bắc Ninh. Hỗ trợ kỹ thuật: Ban Quản Trị Sở GD&ĐT.
      </footer>
    </div>
  );
};
