import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Button, Row, Col, InputNumber, Select, message } from "antd";
import { PlusCircleOutlined, EditOutlined, CloudUploadOutlined, TagOutlined, UserOutlined, TeamOutlined, CloseOutlined, SaveOutlined } from "@ant-design/icons";
import type { Ingredient } from "../types/index.ts";
const { Option } = Select;

interface AddProductModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (productData: Omit<Ingredient, "id">) => void;
  editingProduct?: Ingredient | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  onCancel,
  onOk,
  editingProduct,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    form.setFieldsValue({ category: categoryName });
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const formattedValues = {
        ...values,
        price: values.price ? `${values.price}đ` : values.price
      };

      onOk(formattedValues);
      form.resetFields();
      setImagePreview(null);
      setSelectedCategory("");
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedCategory("");
    setImagePreview(null);
    onCancel();
  };

  // Set form values when editing
  React.useEffect(() => {
    if (editingProduct && visible) {
      if (editingProduct.category) {
        setSelectedCategory(editingProduct.category);
      }

      // Convert DD/MM/YYYY to YYYY-MM-DD for date input
      if (editingProduct.importDate) {
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

        const convertedDate = convertDateFormat(editingProduct.importDate);
        console.log('Converting date:', editingProduct.importDate, '->', convertedDate);
        form.setFieldsValue({ importDate: convertedDate });
      }

      // Convert price from "20.000đ" to "20000" for InputNumber
      if (editingProduct.price) {
        const convertPrice = (priceStr: string) => {
          const cleanPrice = priceStr.replace(/[^\d.,]/g, '');
          const normalizedPrice = cleanPrice.replace(',', '.');
          return parseFloat(normalizedPrice) || 0;
        };
        const numericPrice = convertPrice(editingProduct.price);
        form.setFieldsValue({ price: numericPrice });
      }

      form.setFieldsValue({
        name: editingProduct.name,
        image: editingProduct.image,
        category: editingProduct.category,
        quantity: editingProduct.quantity,
        unit: editingProduct.unit,
        supplier: editingProduct.supplier,
      });
      if (editingProduct.image) {
        setImagePreview(editingProduct.image as any);
      }
    } else if (!visible) {
      form.resetFields();
      setSelectedCategory("");
      setImagePreview(null);
    }
  }, [editingProduct, visible, form]);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setFieldsValue({ image: result });
      };
      reader.onerror = () => message.error('Lỗi khi đọc file!');
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error('Kích thước file không được vượt quá 5MB!');
        return;
      }
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

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          {editingProduct ? (
            <EditOutlined className="text-[#0088ff] text-2xl" />
          ) : (
            <PlusCircleOutlined className="text-[#0088ff] text-2xl" />
          )}
          <span className="text-[#0088ff] text-[28px] font-bold">
            {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </span>
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
        {...(editingProduct && { initialValues: editingProduct })}
        requiredMark={false}
        className="px-4"
      >
        <Row gutter={24}>
          {/* Cột trái */}
          <Col span={12}>
            <Form.Item
              name="name"
              label={<span className="font-bold text-black">Tên :</span>}
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
            >
              <Input 
                placeholder="Nhập tên sản phẩm" 
                className="rounded-md border-gray-300"
                prefix={<TagOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span className="font-bold text-black">Loại :</span>}
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Nước ngọt', color: 'blue' },
                  { name: 'Bia', color: 'orange' },
                  { name: 'Nước ép', color: 'green' }
                ].map((category) => {
                  const isSelected = selectedCategory === category.name;
                  const getColorClasses = (color: string, selected: boolean) => {
                    switch (color) {
                      case 'blue':
                        return selected 
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-white' 
                          : 'border-[#3B82F6] text-[#3B82F6] bg-white';
                      case 'orange':
                        return selected 
                          ? 'bg-[#F59E0B] border-[#F59E0B] text-white' 
                          : 'border-[#F59E0B] text-[#F59E0B] bg-white';
                      case 'green':
                        return selected 
                          ? 'bg-[#22C55E] border-[#22C55E] text-white' 
                          : 'border-[#22C55E] text-[#22C55E] bg-white';
                      default:
                        return selected 
                          ? 'bg-[#14933E] border-[#14933E] text-white' 
                          : 'border-[#14933E] text-[#14933E] bg-white';
                    }
                  };
                  
                  return (
                    <Button
                      key={category.name}
                      type="default"
                      className={`rounded border px-4 py-2 ${getColorClasses(category.color, isSelected)}`}
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      {category.name}
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
                prefix={<UserOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              name="employee"
              label={<span className="font-bold text-black">Kiểm kho :</span>}
            >
              <Input 
                placeholder="Nhập tên nhân viên" 
                className="rounded-md border-gray-300"
                prefix={<TeamOutlined className="text-gray-400" />}
              />
            </Form.Item>

            {/* Hình ảnh moved to match AddIngredientModal layout */}
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
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-[#0088ff] hover:bg-blue-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleClick}
                >
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full max-h-32 mx-auto rounded-lg shadow-sm"
                      />
                      <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <EditOutlined />
                        Click để thay đổi ảnh
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <CloudUploadOutlined className="text-5xl mb-3 block mx-auto" />
                      <div className="text-base font-medium">Kéo thả hình ảnh vào đây</div>
                      <div className="text-sm">hoặc <span className="text-[#0088ff] font-medium">click để chọn</span></div>
                    </div>
                  )}
                </div>
              </div>
            </Form.Item>
          </Col>

          {/* Cột phải */}
          <Col span={12}>
            {/* Right column starts with Price to match layout */}
            <Form.Item
              name="price"
              label={<span className="font-bold text-black">Đơn giá :</span>}
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá"
                className="w-full rounded-md border-gray-300"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = value?.replace(/\$\s?|(,*)/g, '') || '0';
                  const num = parseFloat(parsed) || 0;
                  return num as any;
                }}
                addonAfter="đ"
                style={{ width: '100%' }}
                controls={false}
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label={<span className="font-bold text-black">Số lượng :</span>}
              rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập số lượng"
                className="w-full rounded-md border-gray-300"
                style={{ width: '100%' }}
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
                <Option value="chai">chai</Option>
                <Option value="lọ">lọ</Option>
              </Select>
            </Form.Item>

            {/* Import date moved to right column as last item */}
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

            {/* Removed description, expiry date, and status as per request */}
          </Col>
        </Row>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={handleCancel}
            className="border-gray-300 text-gray-600 rounded-md px-6"
            icon={<CloseOutlined />}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={loading}
            className="bg-[#5296e5] border-[#5296e5] rounded-md px-6 shadow-md"
            icon={<SaveOutlined />}
          >
            {editingProduct ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
