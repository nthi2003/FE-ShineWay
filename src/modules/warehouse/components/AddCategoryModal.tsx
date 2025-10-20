import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { 
  PlusCircleOutlined, 
  EditOutlined, 
  TagOutlined, 
  FileTextOutlined, 
  CalendarOutlined, 
  CloseOutlined, 
  SaveOutlined 
} from "@ant-design/icons";
import type { Category } from "../types/index.ts";

const { TextArea } = Input;

interface AddCategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (category: Omit<Category, "id">) => void;
  editingCategory?: Category | null;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onCancel,
  onOk,
  editingCategory,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      let createdDate;
      if (editingCategory) {
        // Edit mode: sử dụng ngày từ form hoặc giữ nguyên ngày cũ
        if (values.createdDate) {
          // Convert YYYY-MM-DD to DD/MM/YYYY
          const date = new Date(values.createdDate + 'T00:00:00');
          createdDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        } else {
          createdDate = editingCategory.createdDate;
        }
      } else {
        // Add mode: sử dụng ngày từ form hoặc ngày hiện tại
        if (values.createdDate) {
          // Convert YYYY-MM-DD to DD/MM/YYYY
          const date = new Date(values.createdDate + 'T00:00:00');
          createdDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        } else {
          const today = new Date();
          createdDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        }
      }
      
      onOk({
        ...values,
        productCount: editingCategory?.productCount || 0,
        createdDate: createdDate,
        status: 'active',
      });
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Initialize form when editing
  React.useEffect(() => {
    if (editingCategory && visible) {
      // Convert DD/MM/YYYY to YYYY-MM-DD for date input
      let createdDateValue = '';
      if (editingCategory.createdDate) {
        const convertDateFormat = (dateStr: string) => {
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
            }
          }
          return dateStr;
        };
        createdDateValue = convertDateFormat(editingCategory.createdDate);
      }
      
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description,
        createdDate: createdDateValue,
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [editingCategory, visible, form]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          {editingCategory ? (
            <EditOutlined className="text-[#0088ff] text-2xl" />
          ) : (
            <PlusCircleOutlined className="text-[#0088ff] text-2xl" />
          )}
          <span className="text-[#0088ff] text-[28px] font-bold">
            {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
          </span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={null}
      className="custom-modal"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="px-4 mt-4"
      >
        <Form.Item
          name="name"
          label={<span className="font-bold text-gray-700">Tên danh mục *</span>}
          rules={[
            { required: true, message: "Vui lòng nhập tên danh mục" },
            { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự" },
            { max: 50, message: "Tên danh mục không được vượt quá 50 ký tự" }
          ]}
        >
          <Input 
            placeholder="Nhập tên danh mục" 
            className="rounded-lg border-gray-300 focus:border-[#0088ff] focus:shadow-sm"
            size="large"
            prefix={<TagOutlined className="text-gray-400" />}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="font-bold text-gray-700">Mô tả *</span>}
          rules={[
            { required: true, message: "Vui lòng nhập mô tả" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
            { max: 200, message: "Mô tả không được vượt quá 200 ký tự" }
          ]}
        >
          <TextArea 
            placeholder="Nhập mô tả danh mục"
            className="rounded-lg border-gray-300 focus:border-[#0088ff] focus:shadow-sm"
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="createdDate"
          label={<span className="font-bold text-gray-700">Ngày tạo</span>}
        >
          <Input 
            type="date"
            placeholder="Chọn ngày tạo" 
            className="rounded-lg border-gray-300 focus:border-[#0088ff] focus:shadow-sm"
            size="large"
            prefix={<CalendarOutlined className="text-gray-400" />}
            disabled={!editingCategory} // Chỉ cho phép chỉnh sửa khi đang edit
          />
        </Form.Item>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleCancel}
            className="border-gray-300 text-gray-600 rounded-lg px-8 py-3 hover:bg-gray-50"
            size="large"
            icon={<CloseOutlined />}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={loading}
            className="bg-[#0088ff] border-[#0088ff] rounded-lg px-8 py-3 shadow-md hover:shadow-lg"
            size="large"
            icon={<SaveOutlined />}
          >
            {editingCategory ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;

