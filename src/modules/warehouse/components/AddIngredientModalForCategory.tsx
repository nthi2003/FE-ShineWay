import React, { useState, useRef } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, Space, Row, Col, Upload, message } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import type { Ingredient } from "../types/index.ts";
import { fakeSuppliers } from "../data/ingredients.ts";
import type { UploadProps } from "antd";

const { Option } = Select;

interface AddIngredientModalForCategoryProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (ingredient: Omit<Ingredient, "id">) => void;
  editingIngredient?: Ingredient | null;
  categoryName?: string; // Tên danh mục hiện tại
}

const AddIngredientModalForCategory: React.FC<AddIngredientModalForCategoryProps> = ({
  visible,
  onCancel,
  onOk,
  editingIngredient,
  categoryName,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Nếu đang ở trang chi tiết danh mục, tự động set category
      if (categoryName && !editingIngredient) {
        values.category = categoryName;
      }
      
      onOk(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImagePreview(null);
    setSelectedStatus('');
    onCancel();
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    form.setFieldsValue({ status: status });
  };

  // Initialize selectedStatus and importDate when editing
  React.useEffect(() => {
    if (editingIngredient) {
      if (editingIngredient.status) {
        setSelectedStatus(editingIngredient.status);
      }
      
      // Convert DD/MM/YYYY to YYYY-MM-DD for date input
      if (editingIngredient.importDate) {
        const convertDateFormat = (dateStr: string) => {
          // Check if date is in DD/MM/YYYY format
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
            }
          }
          return dateStr; // Return as is if already in correct format
        };
        
        const convertedDate = convertDateFormat(editingIngredient.importDate);
        console.log('Converting date:', editingIngredient.importDate, '->', convertedDate);
        form.setFieldsValue({ importDate: convertedDate });
      }
    } else if (categoryName) {
      // Nếu đang thêm mới và có categoryName, tự động set category
      form.setFieldsValue({ category: categoryName });
    }
  }, [editingIngredient, categoryName, form]);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!visible) {
      form.resetFields();
      setImagePreview(null);
      setSelectedStatus('');
    }
  }, [visible, form]);

  const handleFileChange = (file: File) => {
    // Kiểm tra kích thước file (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setFieldsValue({ image: result });
      };
      reader.onerror = () => {
        message.error('Lỗi khi đọc file!');
      };
      reader.readAsDataURL(file);
    } else {
      message.error('Vui lòng chọn file ảnh hợp lệ!');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      handleFileChange(file);
      return false; // Prevent auto upload
    },
  };

  return (
    <Modal
      title={
        <div className="text-[#0088ff] text-[32px] font-bold">
          {editingIngredient ? "Sửa nguyên liệu" : "Thêm nguyên liệu mới"}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        {...(editingIngredient && { initialValues: editingIngredient })}
        requiredMark={false}
        className="px-4"
      >
        <Row gutter={24}>
          {/* Cột trái */}
          <Col span={12}>
            <Form.Item
              name="name"
              label={<span className="font-bold text-black">Tên :</span>}
              rules={[
                { required: true, message: "Vui lòng nhập tên nguyên liệu" },
                { min: 2, message: "Tên nguyên liệu phải có ít nhất 2 ký tự" },
                { max: 100, message: "Tên nguyên liệu không được vượt quá 100 ký tự" }
              ]}
            >
              <Input 
                placeholder="Nhập tên nguyên liệu" 
                className="rounded-md border-gray-300"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className="font-bold text-black">Trạng thái :</span>}
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'active', label: 'Còn hàng', selectedClass: 'bg-[#14933e] border-[#14933e] text-white', unselectedClass: 'border-[#14933e] text-[#14933e] bg-white' },
                  { value: 'low_stock', label: 'Sắp hết', selectedClass: 'bg-[#febc2f] border-[#febc2f] text-white', unselectedClass: 'border-[#febc2f] text-[#febc2f] bg-white' },
                  { value: 'expired', label: 'Đã hết', selectedClass: 'bg-[#ff383c] border-[#ff383c] text-white', unselectedClass: 'border-[#ff383c] text-[#ff383c] bg-white' }
                ].map((status) => {
                  const isSelected = selectedStatus === status.value;
                  return (
                    <Button
                      key={status.value}
                      type="default"
                      className={`rounded border px-4 py-2 ${
                        isSelected ? status.selectedClass : status.unselectedClass
                      }`}
                      onClick={() => handleStatusSelect(status.value)}
                    >
                      {status.label}
                    </Button>
                  );
                })}
              </div>
            </Form.Item>


            <Form.Item
              name="supplier"
              label={<span className="font-bold text-black">Người nhập :</span>}
            >
              <Input 
                placeholder="Nhập tên người nhập" 
                className="rounded-md border-gray-300"
              />
            </Form.Item>


            <Form.Item
              name="image"
              label={<span className="font-bold text-black">Hình ảnh :</span>}
            >
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleClick}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full max-h-32 mx-auto rounded"
                      />
                      <div className="text-sm text-gray-500">Click để thay đổi ảnh</div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <InboxOutlined className="text-4xl mb-2 block mx-auto" />
                      <div>Kéo thả hình ảnh vào đây hoặc click để chọn</div>
                    </div>
                  )}
                </div>
              </div>
            </Form.Item>
          </Col>

          {/* Cột phải */}
          <Col span={12}>
            <Form.Item
              name="price"
              label={<span className="font-bold text-black">Đơn giá :</span>}
              rules={[
                { required: true, message: "Vui lòng nhập giá" },
                { type: 'number', min: 0, message: "Giá phải lớn hơn hoặc bằng 0" }
              ]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá"
                className="w-full rounded-md border-gray-300"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = value?.replace(/\$\s?|(,*)/g, '') || '0';
                  const numValue = parseFloat(parsed) || 0;
                  return numValue as any;
                }}
                addonAfter="đ"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label={<span className="font-bold text-black">Số lượng :</span>}
              rules={[
                { required: true, message: "Vui lòng nhập số lượng" },
                { type: 'number', min: 0, message: "Số lượng phải lớn hơn hoặc bằng 0" }
              ]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập số lượng"
                className="w-full rounded-md border-gray-300"
              />
            </Form.Item>

            <Form.Item
              name="unit"
              label={<span className="font-bold text-black">Đơn vị tính :</span>}
              rules={[{ required: true, message: "Vui lòng chọn đơn vị" }]}
            >
              <Select 
                placeholder="Chọn đơn vị" 
                className="rounded-md"
                suffixIcon={<span className="text-gray-400">▼</span>}
              >
                <Option value="kg">kg</Option>
                <Option value="lít">lít</Option>
                <Option value="hộp">hộp</Option>
                <Option value="gói">gói</Option>
                <Option value="bịch">bịch</Option>
                <Option value="thùng">thùng</Option>
                <Option value="túi">túi</Option>
                <Option value="bó">bó</Option>
                <Option value="cái">cái</Option>
                <Option value="viên">viên</Option>
                <Option value="ống">ống</Option>
                <Option value="chai">chai</Option>
                <Option value="lọ">lọ</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="importDate"
              label={<span className="font-bold text-black">Ngày nhập :</span>}
              rules={[{ required: true, message: "Vui lòng chọn ngày nhập" }]}
            >
              <Input 
                type="date"
                placeholder="Chọn ngày nhập" 
                className="rounded-md border-gray-300"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={handleCancel}
            className="border-[#5296e5] text-[#5296e5] rounded-md px-6"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={loading}
            className="bg-[#5296e5] border-[#5296e5] rounded-md px-6"
          >
            {editingIngredient ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddIngredientModalForCategory;
