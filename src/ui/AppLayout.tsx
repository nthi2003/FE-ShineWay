import { Layout, Avatar, Dropdown, Badge, Button, Space } from "antd"; // Xóa Input, DownOutlined, SearchOutlined
import {
  BellOutlined,
  QuestionCircleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar.tsx";
import Menu from "../components/Menu.tsx"; // Import Menu chính từ code trước (menu top-level như "Nhân sự", "Kho")
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice.ts";
import { persistor } from "../store/store.ts";

const { Header, Content, Sider } = Layout; // Thêm Sider

const userMenuItems = [
  { key: "profile", label: "Profile" },
  { key: "settings", label: "Settings" },
  { key: "logout", label: "Logout" },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation(); // Thêm để kiểm tra path

  const onUserClick = ({ key }: any) => {
    if (key === "logout") {
      dispatch(logout());
      persistor.purge();
    } else {
      console.log("Chọn:", key);
    }
  };

  const isHome = location.pathname === "/"; // Kiểm tra nếu ở home

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white h-[136px] shadow-sm flex items-center justify-between px-6 py-3 fixed w-full z-10">
        <Space size="middle" className="flex items-center">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-4xl font-bold text-[#0088FF] mr-4">
                ShineWay
              </h1>
            </Link>
          </div>
        </Space>

        <Space size="middle" className="flex items-center">
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: onUserClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Space className="cursor-pointer">
              <Avatar size="large" className="bg-blue-500">
                NVA
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="text-gray-700 font-medium">Nguyễn Văn A</span>
                <div className="bg-[#FEBC2F] w-[79px] h-[22px] rounded-2xl items-center flex justify-center text-xs text-white font-semibold">
                  Quản lí
                </div>
              </div>
            </Space>
          </Dropdown>
          <div className="border-r border-gray-300 h-[64px] ml-2"></div>
          <Button
            type="text"
            icon={<QuestionCircleOutlined className="text-lg" />}
            size="large"
            className="text-gray-700"
          />
          <Badge count={5} offset={[0, 10]} className="text-gray-700">
            <Button
              type="text"
              icon={<BellOutlined className="text-lg" />}
              size="large"
            />
          </Badge>
          <Button
            type="text"
            icon={<MenuOutlined className="text-xl" />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-700"
            disabled={isHome} // Disable toggle ở home nếu không có sidebar
          />
        </Space>
      </Header>
      <Layout className="pt-[136px]">
        {!isHome && ( // Chỉ render Sider khi KHÔNG ở home (fix duplicate)
          <Sider
            key="main-sider" // Thêm key unique để React re-render đúng
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={306}
            collapsedWidth={80}
            className="h-[calc(100vh-136px)] bg-white fixed left-0 z-0"
            theme="light"
          >
            <Sidebar />
          </Sider>
        )}
        <Content
          className={`overflow-hidden p-6 bg-white h-[calc(100vh-136px)] transition-all duration-300 ${
            isHome ? "ml-0" : collapsed ? "ml-[80px]" : "ml-[306px]"
          }`}
        >
          <div className="h-full">
            <Outlet /> {/* Outlet render HomePage hoặc sub-page */}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
