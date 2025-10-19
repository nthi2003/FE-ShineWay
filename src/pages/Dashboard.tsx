import React from "react";
import Menu from "../components/Menu.tsx";
import { DualAxes } from "@ant-design/plots"; // Sử dụng DualAxes cho biểu đồ cột + đường
import { fakePermissions } from "../data/fakePermissions.ts";

export default function Dashboard() {
  // Dữ liệu cho biểu đồ
  const chartData = fakePermissions.menus.map((menu) => ({
    name: menu.name,
    subItemsCount: menu.subItems.length, // Số lượng subItems
    viewPermissions: menu.subItems.filter((sub) => sub.permissions.view).length, // Số quyền view: true
  }));

  // Cấu hình biểu đồ
  const config = {
    data: [chartData, chartData], // Dữ liệu cho cột và đường
    xField: "name",
    yField: ["subItemsCount", "viewPermissions"], // Cột: subItemsCount, Đường: viewPermissions
    geometryOptions: [
      {
        geometry: "column", // Cột
        color: "#40C4FF", // Màu xanh sáng
      },
      {
        geometry: "line", // Đường
        color: "#FFCA28", // Màu vàng
        lineStyle: {
          lineWidth: 3, // Độ dày đường
        },
      },
    ],
    label: {
      position: "middle", // Nhãn trên cột
      style: {
        fill: "#000000",
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoRotate: true, // Xoay nhãn nếu dài
        style: {
          fill: "#333", // Màu nhãn trục X
        },
      },
    },
    yAxis: {
      subItemsCount: {
        title: { text: "Số SubItems" },
      },
      viewPermissions: {
        title: { text: "Số View Permissions" },
      },
    },
    meta: {
      name: { alias: "Menu" },
      subItemsCount: { alias: "Số SubItems" },
      viewPermissions: { alias: "Số View Permissions" },
    },
    style: {
      backgroundColor: "#FFFFFF", // Nền trắng
      borderRadius: "8px", // Bo góc
      padding: "16px", // Padding bên trong
    },
    height: 300, // Chiều cao phù hợp
  };

  return (
    <div className="flex flex-col w-[1286px] h-[580px] gap-6 justify-between mx-auto">
      <div className="mx-auto py-8">
        <div className="flex font-bold text-4xl mb-4">
          <h1 className="text-primary-500">ShineWay</h1> -
          <h1>Hệ thống hỗ trợ vận hành nhà hàng</h1>
        </div>
      </div>
      <div className="flex-1 bg-[#5296E5] rounded-xl">
        <div className="flex gap-6 p-[59px] h-full">
          <div className="w-[372px]">
            <h2 className="text-white text-lg font-medium mb-4">
              Thống kê Menu
            </h2>
            <div className="bg-white rounded-md p-4 shadow-md">
              {" "}
              {/* Thêm lớp nền trắng và shadow */}
              <DualAxes {...config} />
            </div>
          </div>
          <div className="border-r border-gray-300 h-full ml-2"></div>
          <div className="flex flex-col gap-6 text-white text-lg font-medium flex-1">
            <div>Tất cả ứng dụng</div>
            <div className="flex-1">
              <Menu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
