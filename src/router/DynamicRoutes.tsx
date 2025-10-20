import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store.ts";
import Login from "../pages/Login.tsx";
import EmployeeInfoPage from "../modules/employees/pages/EmployeeList.tsx";
import PositionPage from "../modules/roles/pages/RoleList.tsx";
import AppLayout from "../ui/AppLayout.tsx";
import Menu from "../components/Menu.tsx";
import Dashboard from "../pages/Dashboard.tsx";
import EmployeeDetail from "../modules/employees/pages/EmployeeDetail.tsx";
import IngredientList from "../modules/warehouse/pages/IngredientList.tsx";
import CategoryList from "../modules/warehouse/pages/CategoryList.tsx";
import CategoryDetail from "../modules/warehouse/pages/CategoryDetail.tsx";
import ProductList from "../modules/warehouse/pages/ProductList.tsx";
import WarehouseHistory from "../modules/warehouse/pages/History.tsx";
import ExitHandler from "../components/ExitHandler.tsx";

// import CategoryPage from '../pages/CategoryPage';
// import ProductPage from '../pages/ProductPage';

const HomePage: React.FC = () => (
  <div>
    <Dashboard />
  </div>
);

const pageMap: { [key: string]: React.FC } = {
   '/nhan-su/thong-tin-nhan-vien': EmployeeInfoPage,
   '/nhan-su/chuc-vu': PositionPage,
   '/kho/danh-sach-nguyen-lieu': IngredientList,
   '/kho/phan-loai': CategoryList,
   '/kho/san-pham': ProductList,
   '/kho/lich-su': WarehouseHistory,
};

const DynamicRoutes: React.FC = () => {
   const permissions = useSelector((state: RootState) => state.auth.permissions);
   console.log('DynamicRoutes - Permissions:', permissions); // Debug để kiểm tra

   if (!permissions) {
      return (
         <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
         </Routes>
      );
   }

   // Tìm sub-item cho "Thông tin nhân viên" để kiểm tra permissions.view cho detail
   const employeeSubItem = permissions.menus
      .flatMap((menu) => menu.subItems)
      .find((sub) => sub.url === '/nhan-su/thong-tin-nhan-vien');

   return (
      <Routes>
         <Route path="/login" element={<Navigate to="/" replace />} />
         <Route element={<AppLayout />}>
            {/* AppLayout wrap tất cả routes sau login */}
            <Route path="/" element={<HomePage />} /> {/* Home chỉ Header + Menu, không sidebar */}
            {permissions.menus.map((menu) => (
               <Route key={menu.url} path={menu.url} element={<Navigate to={menu.subItems[0]?.url || '/'} replace />} />
            ))}
            {permissions.menus.flatMap((menu) =>
               menu.subItems.map((sub) => {
                  const PageComponent = pageMap[sub.url];
                  if (!PageComponent) {
                     console.warn(`No component for sub URL: ${sub.url}`); // Debug missing
                     return null;
                  }
                  return <Route key={sub.url} path={sub.url} element={<PageComponent />} />;
               }),
            )}
            {/* Route động chi tiết nhân viên: Chỉ render nếu có permissions.view */}
            {employeeSubItem?.permissions.view && (
               <Route path={`${employeeSubItem.url}/:employeeId`} element={<EmployeeDetail />} />
            )}
            {/* Route chi tiết danh mục */}
            <Route path="/kho/phan-loai/:categoryId/:categoryName" element={<CategoryDetail />} />
            {/* Route thoát về trang chủ */}
            <Route path="/kho/thoat" element={<ExitHandler />} />
            <Route path="*" element={<div>404 Not Found</div>} />
         </Route>
      </Routes>
   );
};

export default DynamicRoutes;