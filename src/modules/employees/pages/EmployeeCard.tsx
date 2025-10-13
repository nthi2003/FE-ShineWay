import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store.ts";
import { fakeEmployees } from "../data/employee.ts";
import { Table, Button, Pagination, Input, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table/InternalTable.js";
import type { Employee } from "../types/employee.ts";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useEmployeeActions } from "../hooks/useEmployee.ts";
import AddEmployeeModal from "../components/AddEmployeeModal.tsx";

const { Search } = Input;
const { Option } = Select;

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

  const [employees, setEmployees] = useState<Employee[]>(fakeEmployees);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { handleEdit, handleDelete, handleView } = useEmployeeActions(
    setEditingEmployee,
    setIsModalVisible
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchName = emp.fullname.toLowerCase().includes(searchText.toLowerCase());
      const matchDept =
        filterDepartment === "all" ? true : emp.department === filterDepartment;
      return matchName && matchDept;
    });
  }, [employees, searchText, filterDepartment]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredEmployees.slice(startIndex, startIndex + pageSize);

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
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setEditingEmployee(null);
    setIsModalVisible(false);
  };

  const showModal = () => {
    setEditingEmployee(null);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<Employee> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_: string, __: Employee, index: number) => index + 1,
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
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Space>
          {currentPerm?.permissions.add && (
            <Button type="primary" onClick={showModal}>
              Thêm mới
            </Button>
          )}

          <Select
            value={filterDepartment}
            style={{ width: 180 }}
            onChange={(value) => {
              setFilterDepartment(value);
              setCurrentPage(1);
            }}
          >
            <Option value="all">Tất cả chức vụ</Option>
            <Option value="chef">Chef</Option>
            <Option value="waiter">Waiter</Option>
            <Option value="manager">Manager</Option>
          </Select>
        </Space>

        <Search
          placeholder="Tìm kiếm theo tên nhân viên"
          allowClear
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: 300 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={paginatedData}
        rowKey="id"
        pagination={false}
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

      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          total={filteredEmployees.length}
          pageSize={pageSize}
          showSizeChanger
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </div>

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
