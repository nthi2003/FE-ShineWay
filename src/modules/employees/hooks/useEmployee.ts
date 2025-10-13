import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '../types/employee.ts';

export const useEmployeeActions = (
  setEditingEmployee: (employee: Employee | null) => void,
  setIsModalVisible: (visible: boolean) => void
) => {
  const navigate = useNavigate();

  const handleEdit = useCallback((record: Employee) => {
    console.log("Sửa:", record);
    setEditingEmployee(record);
    setIsModalVisible(true);
  }, [setEditingEmployee, setIsModalVisible]);

  const handleDelete = useCallback((record: Employee) => {
    console.log('Xóa:', record);
    // Thêm logic xóa tại đây (ví dụ: hiển thị xác nhận, gọi API)
  }, []);

  const handleView = useCallback((record: Employee) => {
    console.log('Xem:', record);
    navigate(`/nhan-su/thong-tin-nhan-vien/${record.employeeId}`);
  }, [navigate]);

  const handleSave = useCallback((record: Employee) => {
    console.log('Save:', record);
  }, []);

  return { handleEdit, handleDelete, handleView, handleSave };
};
