import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store.ts";
import { fakeEmployees } from "../data/employee.ts";
import { Table, Button } from "antd";
import type { ColumnsType } from "antd/es/table/InternalTable.js";
import type { Employee } from "../types/employee.ts";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useEmployeeActions } from "../hooks/useEmployee.ts";
import AddEmployeeModal from "../components/AddEmployeeModal.tsx";

// Định nghĩa kiểu cho subItems trong permissions
interface SubItem {
  url: string;
  permissions: {
    view?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}

interface MenuItem {
  subItems: SubItem[];
}

const EmployeeCard: React.FC = () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentPerm = permissions?.menus
    .flatMap((m: MenuItem) => m.subItems)
    .find((sub: SubItem) => sub.url === "/nhan-su/thong-tin-nhan-vien");
  console.log("EmployeeCard - Current Permissions:", currentPerm); // Debug để kiểm tra

  const [employees, setEmployees] = useState<Employee[]>(fakeEmployees);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { handleEdit, handleDelete, handleView } = useEmployeeActions(setEditingEmployee,setIsModalVisible);

  const handleAddEmployee = (employee: Employee) => {
    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === editingEmployee.id ? { ...employee, id: editingEmployee.id } : item
        )
      );
      setEditingEmployee(null);
    } else {
      setEmployees([...employees, employee]);
    }
  };

  const showModal = () => {
    setEditingEmployee(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setEditingEmployee(null);
    setIsModalVisible(false);
  };

  const columns: ColumnsType<Employee> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (text: string, record: Employee, index: number) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Chức vụ",
      dataIndex: "department",
      key: "department",
      render: (text: string) => {
        const map: Record<string, string> = {
          chef: "Chef",
          waiter: "Waiter",
          manager: "Manager",
        };
        return map[text] || text;
      },
    },
    {
      title: "Mã chức vụ",
      dataIndex: "employeeId",
      key: "employeeId",
    },
    {
      title: "Lương",
      dataIndex: "salary",
      key: "salary",
      render: (text: number) => `$${text}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_: string, record: Employee) => (
        <div className="flex items-center gap-3">
          {currentPerm?.permissions.view && (
            <button
              onClick={() => handleView(record)}
              className="hover:text-green-700 transition-colors"
            >
              <Eye size={18} />
            </button>
          )}
          {currentPerm?.permissions.edit && (
            <button
              onClick={() => handleEdit(record)}
              className="hover:text-blue-700 transition-colors"
            >
              <Pencil size={18} />
            </button>
          )}
          {currentPerm?.permissions.delete && (
            <button
              onClick={() => handleDelete(record)}
              className="hover:text-red-700 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
          {!currentPerm && <span>Không có quyền</span>}
        </div>
      ),
    },
  ];

  return (
    <div>
      {currentPerm?.permissions.add && (
        <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
          Thêm mới
        </Button>
      )}
      <Table
        columns={columns}
        dataSource={employees} // Sử dụng state employees thay vì fakeEmployees
        rowKey="id"
        components={{
          header: {
            cell: (props: any) => (
              <th {...props} className="!bg-[#0088FF] !text-white">
                {props.children}
              </th>
            ),
          },
        }}
      />
      <AddEmployeeModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onAdd={handleAddEmployee}
        editingEmployee={editingEmployee}
      />
    </div>
  );
};

export default EmployeeCard;
