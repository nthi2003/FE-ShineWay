import React, { useState, useRef } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, Space, Row, Col, Upload, message } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import type { Ingredient } from "../types/index.ts";
import { fakeCategories, fakeSuppliers } from "../data/ingredients.ts";
import type { UploadProps } from "antd";

const { Option } = Select;

interface AddIngredientModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (ingredient: Omit<Ingredient, "id">) => void;
  editingIngredient?: Ingredient | null;
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  visible,
  onCancel,
  onOk,
  editingIngredient,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Format price to include "đ" suffix
      const formattedValues = {
        ...values,
        price: values.price ? `${values.price}đ` : values.price
      };
      
      onOk(formattedValues);
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
    setSelectedCategory('');
    onCancel();
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    form.setFieldsValue({ category: categoryName });
  };

  // Initialize selectedCategory and importDate when editing
  React.useEffect(() => {
    if (editingIngredient) {
      if (editingIngredient.category) {
        setSelectedCategory(editingIngredient.category);
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
      
      // Convert price from "20.000đ" to "20000" for InputNumber
      if (editingIngredient.price) {
        const convertPrice = (priceStr: string) => {
          // Remove "đ" and any non-numeric characters except dots and commas
          const cleanPrice = priceStr.replace(/[^\d.,]/g, '');
          // Replace comma with dot for decimal parsing
          const normalizedPrice = cleanPrice.replace(',', '.');
          return parseFloat(normalizedPrice) || 0;
        };
        
        const numericPrice = convertPrice(editingIngredient.price);
        console.log('Converting price:', editingIngredient.price, '->', numericPrice);
        form.setFieldsValue({ price: numericPrice });
      }
    }
  }, [editingIngredient, form]);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setFieldsValue({ image: result });
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
              rules={[{ required: true, message: "Vui lòng nhập tên nguyên liệu" }]}
            >
              <Input 
                placeholder="Nhập tên nguyên liệu" 
                className="rounded-md border-gray-300"
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span className="font-bold text-black">Loại :</span>}
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Rau', color: 'green' },
                  { name: 'Hải sản', color: 'blue' },
                  { name: 'Thịt', color: 'red' },
                  { name: 'Lương thực', color: 'orange' }
                ].map((category) => {
                  const isSelected = selectedCategory === category.name;
                  const getColorClasses = (color: string, selected: boolean) => {
                    switch (color) {
                      case 'green':
                        return selected 
                          ? 'bg-[#22C55E] border-[#22C55E] text-white' 
                          : 'border-[#22C55E] text-[#22C55E] bg-white';
                      case 'blue':
                        return selected 
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-white' 
                          : 'border-[#3B82F6] text-[#3B82F6] bg-white';
                      case 'red':
                        return selected 
                          ? 'bg-[#EF4444] border-[#EF4444] text-white' 
                          : 'border-[#EF4444] text-[#EF4444] bg-white';
                      case 'orange':
                        return selected 
                          ? 'bg-[#F59E0B] border-[#F59E0B] text-white' 
                          : 'border-[#F59E0B] text-[#F59E0B] bg-white';
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
              />
            </Form.Item>

            <Form.Item
              name="employee"
              label={<span className="font-bold text-black">Kiểm kho :</span>}
            >
              <Input 
                placeholder="Nhập tên nhân viên" 
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
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá"
                className="w-full rounded-md border-gray-300"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
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

export default AddIngredientModal;
