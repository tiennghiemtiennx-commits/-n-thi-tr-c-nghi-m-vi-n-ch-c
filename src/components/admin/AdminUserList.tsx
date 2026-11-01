import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';
import {
  Users,
  Shield,
  UserPlus,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  LogIn,
  Search,
  X,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';

export const AdminUserList: React.FC = () => {
  const { currentUser, loginAsUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const attempts = storageService.getAttempts();
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'user' as Role,
    phone: ''
  });

  const refreshUsers = () => {
    setUsers(storageService.getUsers());
  };

  const handleOpenAdd = () => {
    setErrorMessage('');
    setFormData({
      displayName: '',
      email: '',
      password: 'GV' + Math.floor(100000 + Math.random() * 900000), // Friendly default generated password like GV283912
      role: 'user',
      phone: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setErrorMessage('');
    setEditingUser(user);
    setFormData({
      displayName: user.displayName,
      email: user.email,
      password: user.password || '',
      role: user.role,
      phone: user.phone || ''
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.displayName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
      return;
    }

    try {
      if (editingUser) {
        storageService.updateUser(editingUser.uid, {
          displayName: formData.displayName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password.trim(),
          role: formData.role,
          phone: formData.phone.trim()
        });
        setSuccessMessage(`Đã cập nhật thông tin cho người dùng "${formData.displayName}"`);
        setEditingUser(null);
      } else {
        storageService.createUserByAdmin({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone
        });
        setSuccessMessage(`Đã tạo tài khoản thành công cho "${formData.displayName}". Mật khẩu: ${formData.password}`);
        setShowAddModal(false);
      }
      refreshUsers();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu người dùng');
    }
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    try {
      storageService.deleteUser(deletingUser.uid);
      setDeletingUser(null);
      refreshUsers();
      setSuccessMessage('Đã xóa tài khoản thành công.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    storageService.updateUser(user.uid, { status: newStatus });
    refreshUsers();
  };

  const handleCopyCredentials = (user: User) => {
    const text = `Tài khoản Ôn Thi Viên Chức Bắc Ninh:\n- Email: ${user.email}\n- Mật khẩu: ${user.password || 'password123'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.uid);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLoginAs = (user: User) => {
    loginAsUser(user);
    setSuccessMessage(`Đã chuyển đổi sang tài khoản: ${user.displayName} (${user.role === 'admin' ? 'Quản trị viên' : 'Thí sinh'})`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredUsers = users.filter(u => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.phone && u.phone.includes(s))
    );
  });

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Quản trị tài khoản & Cấp phát mật khẩu</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Quản lý người dùng & Phân quyền
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Admin chủ động tạo tài khoản, đặt email và mật khẩu cho thí sinh. Thí sinh sử dụng thông tin này để đăng nhập và ôn luyện độc lập.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Tổng số tài khoản: <strong className="text-slate-900 font-bold">{users.length}</strong> (Thí sinh: {users.filter(u => u.role === 'user').length}, Quản trị: {users.filter(u => u.role === 'admin').length})
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] sm:text-xs uppercase">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Họ tên & Email</th>
                <th className="py-3.5 px-4">Mật khẩu cấp</th>
                <th className="py-3.5 px-4 text-center">Vai trò</th>
                <th className="py-3.5 px-4 text-center">Lượt thi</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const userAttemptsCount = attempts.filter(a => a.userId === user.uid).length;
                const isPasswordShown = showPasswords[user.uid];
                const isCurrent = currentUser?.uid === user.uid;

                return (
                  <tr key={user.uid} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Contact */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#123B70] text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                            <span>{user.displayName}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                Bạn đang đăng nhập
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Password Preview & Copy */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <Key className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                          {isPasswordShown ? (user.password || 'password123') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, [user.uid]: !prev[user.uid] }))}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          title={isPasswordShown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(user)}
                          className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer ml-1"
                          title="Sao chép Email & Mật khẩu gửi cho thí sinh"
                        >
                          {copiedId === user.uid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3 text-amber-600" />}
                        {user.role === 'admin' ? 'Quản trị viên' : 'Thí sinh'}
                      </span>
                    </td>

                    {/* Attempt count */}
                    <td className="py-4 px-4 text-center font-bold text-slate-800">
                      {userAttemptsCount} bài
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Nhấn để đổi trạng thái khóa/mở khóa"
                      >
                        {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleLoginAs(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Đăng nhập thử bằng tài khoản này"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Sửa thông tin / Đổi mật khẩu"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.email !== 'admin@onvienchucbacninh.vn' && (
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-[#123B70] px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>{editingUser ? 'Chỉnh sửa tài khoản & Mật khẩu' : 'Thêm người dùng mới (Cấp mật khẩu)'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Họ và tên thí sinh / Quản trị (*)
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Ví dụ: Trần Thị Mai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Địa chỉ Email đăng nhập (*)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ví dụ: tranmai@bacninh.edu.vn"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email dùng làm tên đăng nhập của thí sinh.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">
                    Mật khẩu do Admin tạo (*)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, password: 'GV' + Math.floor(100000 + Math.random() * 900000) })}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nhập mật khẩu cấp cho người dùng..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Admin cấp mật khẩu này cho người dùng để họ đăng nhập vào hệ thống.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Vai trò người dùng (*)
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                  >
                    <option value="user">Thí sinh (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Xóa tài khoản người dùng?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa tài khoản <strong>{deletingUser.displayName}</strong> ({deletingUser.email})?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
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
