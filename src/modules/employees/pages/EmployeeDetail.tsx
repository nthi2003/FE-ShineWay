import React, { useState } from 'react';
import { Card, Button, Input, Typography, Switch, Timeline, Modal, Form, Select, DatePicker } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { fakeEmployees } from '../data/employee.ts';
import { useParams, useNavigate } from 'react-router-dom';
import { BACKGROUND_BLUE } from '../constants/index.ts';
import type { Employee } from '../types/employee.ts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const EmployeeDetail: React.FC = () => {
   const { employeeId } = useParams<{ employeeId: string }>();
   const navigate = useNavigate();

   const employee = fakeEmployees.find((e: Employee) => e.employeeId === employeeId);

   const [employeeData, setEmployeeData] = useState<Employee | undefined>(employee);
   const [isEditing, setIsEditing] = useState(false);
   const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
   const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

   const [form] = Form.useForm<Employee>();

   if (!employeeData) {
      return (
         <div className="p-6 bg-gray-50 min-h-screen">
            <Title level={3}>Không tìm thấy nhân viên!</Title>
            <Button type="primary" onClick={() => navigate(-1)}>
               Quay lại
            </Button>
         </div>
      );
   }

   const handleSave = () => {
      form
         .validateFields()
         .then((values) => {
            const createdAtValue =
               values.createdAt && dayjs.isDayjs(values.createdAt) ? values.createdAt.toDate() : employeeData.createdAt;

            const updatedEmployee = {
               ...employeeData,
               ...values,
               createdAt: createdAtValue,
            };

            setEmployeeData(updatedEmployee);
            setIsEditing(false);
            setIsSaveModalVisible(true);

            const index = fakeEmployees.findIndex((e: Employee) => e.employeeId === updatedEmployee.employeeId);
            if (index !== -1) fakeEmployees[index] = updatedEmployee;

            console.log('Đã lưu nhân viên:', updatedEmployee);
         })
         .catch((info) => {
            console.log('Xác thực thất bại:', info);
         });
   };

   const handleDelete = () => setIsDeleteModalVisible(true);

   const confirmDelete = () => {
      console.log('Đã xóa nhân viên:', employeeData.fullname);
      setIsDeleteModalVisible(false);
   };

   const cancelDelete = () => setIsDeleteModalVisible(false);

   const handleStatus = (checked: boolean) => {
      const newStatus = checked ? 'active' : 'inactive';
      setEmployeeData((prev) => (prev ? { ...prev, status: newStatus } : prev));
      console.log('Trạng thái đã cập nhật:', newStatus);
   };

   return (
      <div className="bg-gray-50 min-h-screen">
         {/* HEADER */}
         <div className="flex items-center gap-3 mb-6">
            <Button
               type="text"
               icon={<ArrowLeftOutlined />}
               className="!p-0 text-gray-600 hover:text-blue-500"
               onClick={() => navigate('/nhan-su/thong-tin-nhan-vien')}
            />
            <Title level={3} className="!m-0">
               {employeeData.fullname}
            </Title>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PHÍA BÊN TRÁI */}
            <Card className="shadow-md rounded-2xl" styles={{ body: { paddingLeft: 0 } }}>
               <div className="flex flex-row gap-4 items-start">
                  {/* Ảnh đại diện */}
                  <div className="flex flex-col items-center w-[260px]">
                     <div className="w-full flex items-center justify-center mb-3">
                        <Text className="text-lg font-semibold text-gray-700">Ảnh đại diện</Text>
                     </div>
                     <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg"
                        alt="avatar"
                        className="w-48 h-48 rounded-xl object-cover border"
                     />
                     <a href="#" className="text-blue-500 mt-2 text-sm">
                        Thay đổi ảnh đại diện
                     </a>

                     {!isEditing ? (
                        <Button
                           type="primary"
                           className="mt-4 w-48 rounded-xl font-bold"
                           onClick={() => {
                              setIsEditing(true);
                              form.setFieldsValue({
                                 ...employeeData,
                                 createdAt: dayjs(employeeData.createdAt),
                              });
                           }}
                        >
                           Cập nhật thông tin
                        </Button>
                     ) : (
                        <Button
                           type="primary"
                           className="mt-4 w-48 rounded-xl font-bold !bg-green-600 hover:!bg-green-700 !border-none"
                           onClick={handleSave}
                        >
                           Lưu
                        </Button>
                     )}

                     <Button type="primary" danger className="mt-2 w-48 rounded-xl font-bold" onClick={handleDelete}>
                        Xóa thông tin
                     </Button>
                  </div>

                  {/* Form thông tin */}
                  <div className="flex-1 pr-6">
                     <div className="w-full flex items-center mb-3">
                        <Text className="text-lg font-semibold text-gray-700">Thông tin cá nhân</Text>
                     </div>

                     <Form
                        layout="vertical"
                        className="[&_.ant-form-item]:mb-2 [&_.ant-form-item-label]:mb-0"
                        form={form}
                        initialValues={{
                           ...employeeData,
                           createdAt: dayjs(employeeData.createdAt),
                        }}
                        disabled={!isEditing}
                     >
                        <Form.Item
                           label="Họ và tên"
                           name="fullname"
                           rules={[{ required: true, message: 'Nhập họ tên' }]}
                        >
                           <Input placeholder="Nhập họ tên" />
                        </Form.Item>

                        <Form.Item
                           label="Chức vụ"
                           name="department"
                           rules={[{ required: true, message: 'Chọn chức vụ' }]}
                        >
                           <Select
                              options={[
                                 { value: 'chef', label: 'Bếp trưởng' },
                                 { value: 'waiter', label: 'Phục vụ' },
                                 { value: 'manager', label: 'Quản lý' },
                              ]}
                           />
                        </Form.Item>

                        <Form.Item
                           label="Số điện thoại"
                           name="phone"
                           rules={[
                              { required: true, message: 'Vui lòng nhập số điện thoại' },
                              {
                                 pattern: /^(?:\+84|0)(3|5|7|8|9)[0-9]{8}$/,
                                 message: 'Số điện thoại Việt Nam không hợp lệ',
                              },
                           ]}
                        >
                           <Input placeholder="VD: 0901234567 hoặc +84901234567" />
                        </Form.Item>

                        <Form.Item
                           label="Ngày sinh"
                           name="dateOfBirth"
                           rules={[
                              { required: true, message: 'Vui lòng nhập ngày sinh' },
                              {
                                 pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                                 message: 'Định dạng ngày sinh không hợp lệ (dd/mm/yyyy)',
                              },
                           ]}
                        >
                           <Input placeholder="dd/mm/yyyy" />
                        </Form.Item>

                        <Form.Item
                           label="Giới tính"
                           name="gender"
                           rules={[{ required: true, message: 'Chọn giới tính' }]}
                        >
                           <Select
                              options={[
                                 { value: 'Nam', label: 'Nam' },
                                 { value: 'Nữ', label: 'Nữ' },
                              ]}
                           />
                        </Form.Item>

                        <Form.Item
                           label="Email"
                           name="email"
                           rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                        >
                           <Input placeholder="Nhập email" />
                        </Form.Item>

                        <Form.Item label="Ngày bắt đầu" name="createdAt">
                           <DatePicker format="DD/MM/YYYY" className="w-full" />
                        </Form.Item>

                        <Form.Item label="Địa chỉ" name="address">
                           <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>

                        {/* Trạng thái hoạt động */}
                        <div>
                           <Text strong className="text-gray-600 text-xs">
                              Trạng thái
                           </Text>
                           <p
                              className={`mt-1 font-semibold ${
                                 employeeData.status === 'active'
                                    ? 'text-green-600'
                                    : employeeData.status === 'inactive'
                                    ? 'text-red-500'
                                    : 'text-yellow-500'
                              }`}
                           >
                              {employeeData.status === 'active'
                                 ? 'Đang trong ca làm'
                                 : employeeData.status === 'inactive'
                                 ? 'Đã nghỉ việc'
                                 : 'Đang nghỉ phép'}
                           </p>
                        </div>
                     </Form>
                  </div>
               </div>
            </Card>

            {/* PHÍA BÊN PHẢI */}
            <div className="flex flex-col gap-6">
               {/* Hoạt động gần đây */}
               <Card
                  title={
                     <span className="font-semibold text-gray-700 uppercase text-base tracking-wide">
                        Hoạt động gần đây
                     </span>
                  }
                  className="shadow-md rounded-2xl"
                  styles={{
                     header: {
                        background: BACKGROUND_BLUE,
                        borderRadius: '16px 16px 0 0',
                     },
                     body: { padding: '10px 0 2px 16px' },
                  }}
               >
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                     <Timeline
                        items={
                           employeeData.recentActivities?.map((act) => ({
                              children: `${act.date} ${act.time} - ${act.action}`,
                           })) || []
                        }
                     />
                  </div>
               </Card>

               {/* Ngày làm việc + Trạng thái tài khoản */}
               <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card
                     title={<span className="font-semibold text-gray-700">Ngày làm tháng này</span>}
                     className="shadow-md rounded-2xl text-center"
                     styles={{
                        header: {
                           background: BACKGROUND_BLUE,
                           borderRadius: '16px 16px 0 0',
                        },
                        body: { padding: '10px 0 10px' },
                     }}
                  >
                     <div className="flex flex-col items-center justify-center py-4 relative">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                           <CalendarOutlined className="text-[180px] text-gray-700" />
                           <span className="mt-10 absolute text-5xl font-bold text-black">
                              {employeeData.currentShift?.day ?? '-'}
                           </span>
                        </div>
                     </div>
                     <div className="mt-6 text-right px-3 pb-2">
                        <a href="#" className="text-blue-500 text-sm font-medium hover:underline">
                           Xem chi tiết
                        </a>
                     </div>
                  </Card>

                  <Card
                     title={<span className="font-semibold text-gray-700">Trạng thái tài khoản</span>}
                     className="shadow-md rounded-2xl text-center"
                     styles={{
                        header: {
                           background: BACKGROUND_BLUE,
                           borderRadius: '16px 16px 0 0',
                        },
                     }}
                  >
                     <div className="flex flex-col items-center justify-center py-4">
                        <Switch checked={employeeData.status === 'active'} onChange={handleStatus} className="mb-3" />
                        <p
                           className={`font-semibold ${
                              employeeData.status === 'active' ? 'text-green-600' : 'text-red-500'
                           }`}
                        >
                           {employeeData.status === 'active' ? 'Còn hoạt động' : 'Không hoạt động'}
                        </p>
                        <Text type="secondary" className="text-xs mt-1 block text-gray-500 max-w-[180px]">
                           Gạt sang trái để tắt trạng thái hoạt động của tài khoản
                        </Text>
                     </div>
                  </Card>
               </div>
            </div>
         </div>

         {/* Modal thông báo lưu thành công */}
         <Modal open={isSaveModalVisible} onCancel={() => setIsSaveModalVisible(false)} footer={null} centered>
            <div className="text-center py-4">
               <div className="flex justify-center mb-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
                     ✓
                  </div>
               </div>
               <Title level={4}>Lưu thông tin thành công!</Title>
               <Button type="primary" onClick={() => setIsSaveModalVisible(false)} className="mt-3 rounded-lg">
                  Đóng
               </Button>
            </div>
         </Modal>

         {/* Modal xác nhận xóa */}
         <Modal open={isDeleteModalVisible} onCancel={cancelDelete} footer={null} centered>
            <div className="text-center py-4">
               <div className="flex justify-center mb-3">
                  <div className="bg-red-100 text-red-600 rounded-full w-14 h-14 flex items-center justify-center text-3xl">
                     ✕
                  </div>
               </div>
               <Title level={4}>Bạn có muốn xóa tài khoản này không?</Title>
               <div className="flex justify-center gap-4 mt-4">
                  <Button onClick={cancelDelete}>Không</Button>
                  <Button type="primary" danger onClick={confirmDelete} className="rounded-lg">
                     Có
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default EmployeeDetail;
