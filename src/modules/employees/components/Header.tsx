import React, { useState } from 'react';
import AddEmployeeModal from './EmployeeModal.tsx';
import type { Employee } from '../types/employee.ts';
import { fakeEmployees } from '../data/employee.ts';
import { Button } from 'antd';

export default function Header() {
   const [employees, setEmployees] = useState<Employee[]>(fakeEmployees);
   const [isModalVisible, setIsModalVisible] = useState(false);
   const handleAddEmployee = (newEmployee: Employee) => {
      setEmployees([...employees, newEmployee]);
   };

   const showModal = () => {
      setIsModalVisible(true);
   };

   const handleCancel = () => {
      setIsModalVisible(false);
   };
   return (
      <div>
         <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
            Thêm nhân viên
         </Button>
         <AddEmployeeModal visible={isModalVisible} onCancel={handleCancel} onAdd={handleAddEmployee} />
      </div>
   );
}
