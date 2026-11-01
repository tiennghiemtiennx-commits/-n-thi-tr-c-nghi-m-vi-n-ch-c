import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Shuffle,
  AlertCircle,
  TrendingUp,
  History,
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  Users,
  Settings,
  Shield,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  BarChart3,
  Key
} from 'lucide-react';

export type UserTab =
  | 'dashboard'
  | 'topics'
  | 'random_exam'
  | 'wrong_questions'
  | 'progress'
  | 'history'
  | 'profile';

export type AdminTab =
  | 'admin_dashboard'
  | 'admin_topics'
  | 'admin_questions'
  | 'admin_import'
  | 'admin_users'
  | 'admin_stats'
  | 'admin_history'
  | 'admin_settings';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  onOpenExamSetup?: () => void;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenExamSetup,
  onOpenLoginModal
}) => {
  const { currentUser, isAdmin, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userNavItems: { id: UserTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'topics', label: '10 Chủ đề', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'random_exam', label: 'Luyện đề ngẫu nhiên', icon: <Shuffle className="w-4 h-4" /> },
    { id: 'wrong_questions', label: 'Sổ tay câu sai', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'progress', label: 'Tiến độ & Thành thạo', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'history', label: 'Lịch sử bài thi', icon: <History className="w-4 h-4" /> }
  ];

  const adminNavItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'admin_dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'admin_topics', label: '10 Chủ đề', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'admin_questions', label: 'Ngân hàng câu hỏi', icon: <Database className="w-4 h-4" /> },
    { id: 'admin_import', label: 'Nhập Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'admin_users', label: 'Người dùng & Mật khẩu', icon: <Users className="w-4 h-4" /> },
    { id: 'admin_stats', label: 'Thống kê', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'admin_history', label: 'Lịch sử nhập', icon: <History className="w-4 h-4" /> },
    { id: 'admin_settings', label: 'Cài đặt & Firebase', icon: <Settings className="w-4 h-4" /> }
  ];

  const activeNavList = isAdmin ? adminNavItems : userNavItems;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Banner with Provincial System Notice & Quick Role Switcher */}
      <div className="bg-[#123B70] text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="truncate">
            Hệ thống ôn thi tuyển dụng viên chức ngành Giáo dục & Đào tạo tỉnh Bắc Ninh
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-white/10 rounded-full px-2 py-0.5 text-[11px] gap-1.5 border border-white/20">
            <span className="text-blue-200">Chế độ xem:</span>
            <button
              onClick={() => {
                switchRole('user');
                onSelectTab('dashboard');
              }}
              className={`px-2 py-0.5 rounded-full font-semibold transition-all ${
                !isAdmin ? 'bg-white text-[#123B70] shadow-xs' : 'text-white hover:text-blue-200'
              }`}
            >
              Học viên
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                onSelectTab('admin_dashboard');
              }}
              className={`px-2 py-0.5 rounded-full font-semibold transition-all flex items-center gap-1 ${
                isAdmin ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-white hover:text-amber-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              Quản trị (Admin)
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onSelectTab(isAdmin ? 'admin_dashboard' : 'dashboard')}
            className="cursor-pointer"
          >
            <Logo size="md" showSlogan={false} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {activeNavList.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB] font-semibold'
                      : 'text-slate-600 hover:text-[#123B70] hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {!isAdmin && onOpenExamSetup && (
              <button
                onClick={onOpenExamSetup}
                className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Thi thử ngay</span>
              </button>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/80"
              >
                <div className="w-8 h-8 rounded-full bg-[#123B70] text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-100">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    {isAdmin ? (
                      <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Quản trị viên
                      </span>
                    ) : (
                      <span className="text-blue-600 font-medium">Thí sinh</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSelectTab('profile');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </button>

                  {onOpenLoginModal && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#2563EB] hover:bg-blue-50 flex items-center gap-2 font-semibold"
                    >
                      <Key className="w-4 h-4 text-blue-600" />
                      <span>Đăng nhập Email & Mật khẩu</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      onSelectTab('dashboard');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
          <div className="py-2 border-b border-slate-100 mb-2">
            <div className="text-xs font-bold text-slate-800">{currentUser.displayName}</div>
            <div className="text-[11px] text-slate-500">{currentUser.email}</div>
          </div>
          {activeNavList.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === item.id
                  ? 'bg-blue-50 text-[#2563EB] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                switchRole(isAdmin ? 'user' : 'admin');
                onSelectTab(isAdmin ? 'dashboard' : 'admin_dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-bold text-center border border-slate-300 rounded-lg"
            >
              Chuyển sang {isAdmin ? 'Thí sinh' : 'Admin'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
