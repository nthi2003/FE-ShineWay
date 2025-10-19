import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  DatePicker,
  Row,
  Col,
  Typography
} from "antd";
import type { Employee } from "../types/employee.ts";
import dayjs from "dayjs";

const { Option } = Select;

const { Title } = Typography;

interface AddEmployeeModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (employee: Employee) => void;
  editingEmployee?: Employee | null;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  visible,
  onCancel,
  onAdd,
  editingEmployee,
}) => {
  const [form] = Form.useForm();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    if (editingEmployee) {
      form.setFieldsValue({
        ...editingEmployee,
        createdAt: editingEmployee.createdAt ? dayjs(editingEmployee.createdAt) : null,
      });
    } else {
      form.resetFields();
    }
  }, [editingEmployee, form]);

  const onFinish = (values: any) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      fullname: values.fullname,
      password: values.password,
      department: values.department,
      email: values.email,
      createdAt: new Date(),
      employeeId: `EMP${(Math.floor(Math.random() * 1000) + 1)
        .toString()
        .padStart(3, "0")}`,
      salary: values.salary || 0,
      status: "active",
      recentActivities: [],
      dateOfBirth: "",
      gender: "Nam",
      address: "",
      phone: "",
    };
    console.log("Dữ liệu nhân viên:", newEmployee);
    onAdd(newEmployee);
    setIsSuccessModalVisible(true);
    form.resetFields();
    onCancel();
  };

  return (
    <>
    <Modal
      title={editingEmployee ? "Sửa nhân viên" : "Thêm nhân viên"}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form
        form={form}
        name="addEmployee"
        onFinish={onFinish}
        layout="vertical"
      >
        <Row gutter={24}>
          {/* Cột bên trái */}
          <Col xs={24} sm={12}>
            {/* Thông tin họ tên */}
            <Form.Item
              name="fullname"
              label="Họ Tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            {/* Thông tin email */}
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            {/* Thông tin mật khẩu */}
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Col>

          {/* Cột bên phải */}
          <Col xs={24} sm={12}>
            {/* Thông tin chức vụ */}
            <Form.Item
              name="department"
              label="Chức vụ"
              rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
            >
              <Select placeholder="Chọn chức vụ">
                <Option value="chef">Chef</Option>
                <Option value="waiter">Waiter</Option>
                <Option value="manager">Manager</Option>
              </Select>
            </Form.Item>
            {/* Thông tin ngày tạo */}
            <Form.Item
              name="createdAt"
              label="Ngày tạo"
              rules={[{ required: true, message: "Vui lòng chọn ngày tạo!" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày tạo"
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* Thông tin mã nhân viên */}
            <Form.Item
              name="employeeId"
              label="Mã nhân viên"
            >
              <Input 
                placeholder="Nhập 3 chữ số (001-999) hoặc để trống tự sinh"
                addonBefore="EMP"
                maxLength={3}
              />
            </Form.Item>
            {/* Thông tin lương */}
            <Form.Item
              name="salary"
              label="Lương ($)"
              rules={[
                { required: true, message: "Vui lòng nhập lương!" },
                { type: "number", min: 0, message: "Lương phải là số và lớn hơn 0!" },
              ]}
            >
              <InputNumber 
                placeholder="Nhập lương" 
                style={{ width: "100%" }} 
                min={0}
                
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>

     <Modal
        open={isSuccessModalVisible}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={null}
        centered
      >
        <div className="text-center py-4">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 text-green-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
              ✓
            </div>
          </div>
          <Title level={4}>Lưu nhân viên thành công!</Title>
          <div className="flex justify-center mt-4">
            <Button
              type="primary"
              onClick={() => setIsSuccessModalVisible(false)}
              className="rounded-lg"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddEmployeeModal;