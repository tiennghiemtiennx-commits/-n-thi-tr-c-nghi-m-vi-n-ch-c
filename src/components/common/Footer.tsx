import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, BookCheck, Award, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo variant="light" size="md" showSlogan={true} />
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Hệ thống ôn luyện thông minh phục vụ kỳ thi tuyển dụng viên chức ngành Giáo dục và Đào tạo tỉnh Bắc Ninh. Quản lý ngân hàng câu hỏi 10 chủ đề pháp luật chuẩn hóa, tự động phân tích lỗ hổng kiến thức và đánh giá mức độ thành thạo thực tế.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo mật dữ liệu cá nhân</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookCheck className="w-4 h-4 text-blue-400" />
                <span>10 Chủ đề văn bản pháp luật chuẩn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Đánh giá thành thạo đa chiều</span>
              </div>
            </div>
          </div>

          {/* 10 Topics reference link overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Văn bản căn cứ cốt lõi
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Luật Viên chức số 129/2025/QH15</li>
              <li>Luật Giáo dục số 43/2019 & 123/2025</li>
              <li>Luật Nhà giáo số 73/2025/QH15</li>
              <li>Nghị định 233, 234, 259/2026/NĐ-CP</li>
              <li>Thông tư 15/2026, 01/2023, 03/2026</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Thành phố Bắc Ninh, Tỉnh Bắc Ninh</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>hotro@onvienchucbacninh.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>0222 3822 555 (Giờ hành chính)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 OnVienChucBacNinh. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <span>Phiên bản v2.6 Pro</span>
            <span>Hệ thống phân quyền Firebase Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
