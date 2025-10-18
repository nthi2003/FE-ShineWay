import type { UserPermissions } from "../types/index.ts";

export const fakePermissions: UserPermissions = {
  menus: [
    {
      name: "Doanh thu",
      url: "/doanh-thu",
      subItems: [
        {
          name: "Báo cáo doanh thu",
          url: "/doanh-thu/bao-cao",
          permissions: { view: true, add: true, edit: true, delete: false },
        },
        {
          name: "Phân tích doanh thu",
          url: "/doanh-thu/phan-tich",
          permissions: { view: true, add: false, edit: true, delete: true },
        },
      ],
    },
    {
      name: "Thống kê đơn",
      url: "/thong-ke-don",
      subItems: [
        {
          name: "Danh sách đơn hàng",
          url: "/thong-ke-don/danh-sach",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Thống kê theo tháng",
          url: "/thong-ke-don/theo-thang",
          permissions: { view: true, add: true, edit: false, delete: true },
        },
      ],
    },
    {
      name: "Hạ tầng",
      url: "/ha-tang",
      subItems: [
        {
          name: "Quản lý thiết bị",
          url: "/ha-tang/quan-ly-thiet-bi",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Bảo trì hệ thống",
          url: "/ha-tang/bao-tri",
          permissions: { view: true, add: false, edit: true, delete: false },
        },
      ],
    },
    {
      name: "Lương",
      url: "/luong",
      subItems: [
        {
          name: "Tính lương nhân viên",
          url: "/luong/tinh-luong",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Lịch sử lương",
          url: "/luong/lich-su",
          permissions: { view: true, add: true, edit: true, delete: false },
        },
      ],
    },
    {
      name: "Kho",
      url: "/kho",
      subItems: [
        {
          name: "Danh sách nguyên liệu",
          url: "/kho/danh-sach-nguyen-lieu",
          permissions: { view: true, add: false, edit: true, delete: true },
        },
        {
          name: "Phân loại",
          url: "/kho/phan-loai",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Sản phẩm",
          url: "/kho/san-pham",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Lịch sử",
          url: "/kho/lich-su",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Thoát",
          url: "/kho/thoat",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
      ],
    },
    {
      name: "Cài đặt",
      url: "/cai-dat",
      subItems: [
        {
          name: "Cấu hình hệ thống",
          url: "/cai-dat/cau-hinh",
          permissions: { view: true, add: false, edit: true, delete: false },
        },
        {
          name: "Quyền hạn người dùng",
          url: "/cai-dat/quyen-han",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
      ],
    },
    {
      name: "Nhân sự",
      url: "/nhan-su",
      subItems: [
        {
          name: "Thông tin nhân viên",
          url: "/nhan-su/thong-tin-nhan-vien",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Chức vụ",
          url: "/nhan-su/chuc-vu",
          permissions: { view: true, add: true, edit: true, delete: false },
        },
      ],
    },
    {
      name: "Hóa đơn",
      url: "/hoa-don",
      subItems: [
        {
          name: "Tạo hóa đơn",
          url: "/hoa-don/tao-moi",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Lịch sử hóa đơn",
          url: "/hoa-don/lich-su",
          permissions: { view: true, add: false, edit: true, delete: true },
        },
      ],
    },
    {
      name: "Phân phối",
      url: "/phan-phoi",
      subItems: [
        {
          name: "Quản lý kênh phân phối",
          url: "/phan-phoi/kenh",
          permissions: { view: true, add: true, edit: true, delete: false },
        },
        {
          name: "Theo dõi vận chuyển",
          url: "/phan-phoi/van-chuyen",
          permissions: { view: true, add: true, edit: false, delete: true },
        },
      ],
    },
    {
      name: "Cảm ơn",
      url: "/cam-on",
      subItems: [
        {
          name: "Phản hồi khách hàng",
          url: "/cam-on/phan-hoi",
          permissions: { view: true, add: true, edit: true, delete: true },
        },
        {
          name: "Gửi lời cảm ơn",
          url: "/cam-on/gui-loi",
          permissions: { view: true, add: true, edit: true, delete: false },
        },
      ],
    },
  ],
};
