import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, InputNumber } from "antd";
import type { Ingredient } from "../types/index.ts";

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
    } catch (error) {
      console.error("Xác thực thất bại:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedCategory("");
    onCancel();
  };

  // Đặt giá trị form khi chỉnh sửa
  React.useEffect(() => {
    if (editingProduct && visible) {
      if (editingProduct.category) {
        setSelectedCategory(editingProduct.category);
      }

      // Chuyển đổi DD/MM/YYYY thành YYYY-MM-DD cho input ngày
      if (editingProduct.importDate) {
        const convertDateFormat = (dateStr: string) => {
          // Kiểm tra xem ngày có ở định dạng DD/MM/YYYY không
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
            }
          }
          return dateStr; // Trả về như cũ nếu đã ở định dạng đúng
        };

        const convertedDate = convertDateFormat(editingProduct.importDate);
        console.log('Chuyển đổi ngày:', editingProduct.importDate, '->', convertedDate);
        form.setFieldsValue({ importDate: convertedDate });
      }

      // Chuyển đổi giá từ "20.000đ" thành "20000" cho InputNumber
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
        description: editingProduct.description,
        supplier: editingProduct.supplier,
        expiryDate: editingProduct.expiryDate,
        status: editingProduct.status,
        employee: editingProduct.employee,
      });
    } else if (!visible) {
      form.resetFields();
      setSelectedCategory("");
    }
  }, [editingProduct, visible, form]);

  return (
    <Modal
      title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
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
          {/* Cột bên trái */}
          <Col span={12}>
            <Form.Item
              name="name"
              label={<span className="font-bold text-black">Tên :</span>}
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
            >
              <Input 
                placeholder="Nhập tên sản phẩm" 
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
              rules={[{ required: true, message: "Vui lòng nhập người nhập" }]}
            >
              <Input 
                placeholder="Nhập tên người nhập" 
                className="rounded-md border-gray-300"
              />
            </Form.Item>

            <Form.Item
              name="employee"
              label={<span className="font-bold text-black">Kiểm kho :</span>}
              rules={[{ required: true, message: "Vui lòng nhập người kiểm kho" }]}
            >
              <Input 
                placeholder="Nhập tên người kiểm kho" 
                className="rounded-md border-gray-300"
              />
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

          {/* Cột bên phải */}
          <Col span={12}>
            <Form.Item
              name="image"
              label={<span className="font-bold text-black">Hình ảnh :</span>}
              rules={[{ required: true, message: "Vui lòng nhập hình ảnh" }]}
            >
              <Input 
                placeholder="Nhập emoji hoặc URL hình ảnh" 
                className="rounded-md border-gray-300"
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
              label={<span className="font-bold text-black">Đơn vị :</span>}
              rules={[{ required: true, message: "Vui lòng chọn đơn vị" }]}
            >
              <Input 
                placeholder="Nhập đơn vị (chai, kg, lít...)" 
                className="rounded-md border-gray-300"
              />
            </Form.Item>

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
              name="expiryDate"
              label={<span className="font-bold text-black">Hạn sử dụng :</span>}
            >
              <Input
                type="date"
                placeholder="Chọn hạn sử dụng"
                className="rounded-md border-gray-300"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={<span className="font-bold text-black">Mô tả :</span>}
        >
          <Input.TextArea 
            placeholder="Nhập mô tả sản phẩm" 
            className="rounded-md border-gray-300"
            rows={3}
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
              const isSelected = form.getFieldValue('status') === status.value;
              return (
                <Button
                  key={status.value}
                  type="default"
                  className={`rounded border px-4 py-2 ${
                    isSelected ? status.selectedClass : status.unselectedClass
                  }`}
                  onClick={() => {
                    form.setFieldsValue({ status: status.value });
                  }}
                >
                  {status.label}
                </Button>
              );
            })}
          </div>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel} className="px-6">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={loading}
            className="bg-[#14933E] border-[#14933E] text-white px-6"
          >
            {editingProduct ? "Cập nhật" : "Thêm"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
