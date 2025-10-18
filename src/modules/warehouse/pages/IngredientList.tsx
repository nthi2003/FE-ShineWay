import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, Space, message, Modal, Image } from "antd";
import { ArrowLeftOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
// import type { ColumnsType } from "antd";
import type { Ingredient } from "../types/index.ts";
import { fakeIngredients } from "../data/ingredients.ts";
import AddIngredientModal from "../components/AddIngredientModal.tsx";
import ExportDropdown from "../components/ExportDropdown.tsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.tsx";
import Notification, { type NotificationProps } from "../../../components/Notification.tsx";
import { exportToExcel, exportToPDF } from '../utils/exportUtils.ts';

const { Search } = Input;

const IngredientList: React.FC = () => {
  // Load từ localStorage hoặc dùng fakeIngredients
  const loadIngredients = () => {
    const saved = localStorage.getItem('ingredients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading ingredients:', e);
        return fakeIngredients;
      }
    }
    return fakeIngredients;
  };

  const [ingredients, setIngredients] = useState<Ingredient[]>(loadIngredients());
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationProps>({
    type: 'success',
    message: '',
    visible: false,
    onClose: () => setNotification(prev => ({ ...prev, visible: false }))
  });

  // Lưu vào localStorage mỗi khi ingredients thay đổi
  useEffect(() => {
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
    console.log('Saved to localStorage:', ingredients.length, 'ingredients');
  }, [ingredients]);

  // Filter ingredients based on search
  const filteredIngredients = useMemo(() => {
    console.log('Total ingredients:', ingredients.length);
    console.log('Ingredients:', ingredients.map(i => i.name));
    return ingredients.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [ingredients, searchText]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredIngredients.slice(startIndex, startIndex + pageSize);

  const handleAddIngredient = (ingredientData: Omit<Ingredient, "id">) => {
    try {
      if (editingIngredient) {
        // Edit existing ingredient - cho phép cập nhật ngày nhập
        const formatDate = (dateString: string) => {
          console.log('Edit - Input dateString:', dateString);
          
          if (!dateString || dateString === '') {
            // Giữ nguyên ngày cũ nếu không nhập ngày mới
            console.log('Edit - Keeping old date:', editingIngredient.importDate);
            return editingIngredient.importDate;
          }
          
          // Xử lý format YYYY-MM-DD từ input date
          const date = new Date(dateString + 'T00:00:00');
          console.log('Edit - Parsed date:', date);
          
          if (isNaN(date.getTime())) {
            console.log('Edit - Invalid date, keeping old date');
            return editingIngredient.importDate;
          }
          
          const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          console.log('Edit - Formatted result:', formatted);
          return formatted;
        };

        const formattedDate = formatDate(ingredientData.importDate || '');
        
        setIngredients((prev) =>
          prev.map((item) =>
            item.id === editingIngredient.id
              ? { 
                  ...ingredientData, 
                  id: editingIngredient.id,
                  importDate: formattedDate // Sử dụng ngày đã format
                }
              : item
          )
        );
        setEditingIngredient(null);
        setNotification({
          type: 'success',
          message: `Đã cập nhật nguyên liệu "${ingredientData.name}" thành công!`,
          visible: true,
          onClose: () => setNotification(prev => ({ ...prev, visible: false }))
        });
      } else {
        // Add new ingredient - tự động tạo ngày nhập nếu không có
        const formatDate = (dateString: string) => {
          console.log('Input dateString:', dateString);
          
          if (!dateString || dateString === '') {
            const today = new Date();
            const formatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            console.log('Using today date:', formatted);
            return formatted;
          }
          
          // Xử lý format YYYY-MM-DD từ input date
          const date = new Date(dateString + 'T00:00:00'); // Thêm timezone để tránh lỗi
          console.log('Parsed date:', date);
          
          if (isNaN(date.getTime())) {
            console.log('Invalid date, using today');
            const today = new Date();
            return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          }
          
          const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          console.log('Formatted result:', formatted);
          return formatted;
        };
        
        const formattedDate = formatDate(ingredientData.importDate || '');
        console.log('Final formatted date:', formattedDate);
        
        const newIngredient: Ingredient = {
          ...ingredientData,
          id: Date.now().toString(),
          importDate: formattedDate, // Format ngày nhập
        };
        console.log('New ingredient before adding:', newIngredient);
        setIngredients(prev => {
          const updated = [...prev, newIngredient];
          console.log('Updated ingredients list:', updated);
          return updated;
        });
        setNotification({
          type: 'success',
          message: `Đã thêm nguyên liệu "${ingredientData.name}" thành công!`,
          visible: true,
          onClose: () => setNotification(prev => ({ ...prev, visible: false }))
        });
      }
      setIsModalVisible(false);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Có lỗi xảy ra khi thêm/cập nhật nguyên liệu!',
        visible: true,
        onClose: () => setNotification(prev => ({ ...prev, visible: false }))
      });
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const ingredient = ingredients.find(item => item.id === id);
    if (ingredient) {
      setIngredientToDelete(ingredient);
      setDeleteModalVisible(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!ingredientToDelete) return;
    
    setDeleteLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIngredients((prev) => prev.filter((item) => item.id !== ingredientToDelete.id));
      message.success(`Đã xóa nguyên liệu "${ingredientToDelete.name}" thành công!`);
      setDeleteModalVisible(false);
      setIngredientToDelete(null);
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa nguyên liệu!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setIngredientToDelete(null);
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const handleCancel = () => {
    setEditingIngredient(null);
    setIsModalVisible(false);
  };

  const showModal = () => {
    setEditingIngredient(null);
    setIsModalVisible(true);
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục dữ liệu gốc? Tất cả thay đổi sẽ bị mất!')) {
      localStorage.removeItem('ingredients');
      setIngredients(fakeIngredients);
      message.success('Đã khôi phục dữ liệu gốc!');
    }
  };

  const handleExportExcel = () => {
    const result = exportToExcel(filteredIngredients);
    if (result.success) {
      message.success(result.message);
    } else {
      message.error(result.message);
    }
  };

  const handleExportPDF = () => {
    const result = exportToPDF(filteredIngredients);
    if (result.success) {
      message.success(result.message);
    } else {
      message.error(result.message);
    }
  };

  const columns: any[] = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 60,
      fixed: "left",
      render: (_: any, __: any, index: number) => startIndex + index + 1,
    },
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: 150,
      fixed: "left",
      render: (text: string) => <span className="font-bold text-[#222222]">{text}</span>,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      align: "center",
      width: 100,
      render: (image: string, record: Ingredient) => (
        <Button 
          type="primary" 
          className="bg-[#0088FF] rounded-xl"
          onClick={() => handleViewImage(record.image)}
          icon={<EyeOutlined />}
        >
          xem
        </Button>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      align: "center",
      width: 120,
      render: (category: string) => (
        <span className="px-3 py-1 border border-[#14933E] text-[#14933E] rounded text-xs font-bold">
          {category}
        </span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      align: "center",
      width: 80,
    },
    {
      title: "Ngày nhập",
      dataIndex: "importDate",
      key: "importDate",
      align: "center",
      width: 120,
      render: (importDate: string) => importDate || "N/A",
    },
    {
      title: "Người nhập",
      dataIndex: "supplier",
      key: "supplier",
      align: "center",
      width: 120,
      render: (supplier: string) => supplier || "N/A",
    },
    {
      title: "Kiểm kho",
      dataIndex: "employee",
      key: "checker",
      align: "center",
      width: 120,
      render: (employee: string) => employee || "N/A",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 120,
      render: (price: string) => (
        <span className="text-[#14933E] font-bold text-xs">{price}đ</span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 150,
      fixed: "right",
      render: (_: any, record: Ingredient) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            className="bg-[#5296E5] border-[#5296E5] text-white font-bold text-xs"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="default"
            size="small"
            className="bg-[#FF5F57] border-[#FF5F57] text-white font-bold text-xs hover:bg-[#FF5F57] hover:border-[#FF5F57]"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <Link to="/kho" className="flex items-center gap-2 text-[#0088FF] font-bold hover:text-[#0066CC]">
          <ArrowLeftOutlined />
          <span>Quay lại</span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-[#222222] mb-3 flex-shrink-0">
        Danh sách nguyên liệu
      </h1>

      {/* Search and Export Section */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative max-w-[282px]">
            <Search
              placeholder="Bạn cần gì ?"
              allowClear
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border-[#E0DBDB]"
              size="large"
            />
          </div>
          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
        </div>
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          className="bg-[#0088FF] border-[#0088FF] shadow-lg"
          style={{
            borderRadius: 10
          }}
          onClick={showModal}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[rgba(0,0,0,0.16)] rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table
            key={ingredients.length} // Force re-render when ingredients change
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            scroll={{ x: 1200, y: 'calc(100vh - 450px)' }}
            pagination={{
              current: currentPage,
              total: filteredIngredients.length,
              pageSize: pageSize,
              showSizeChanger: false,
              onChange: (page) => {
                setCurrentPage(page);
              },
              position: ["bottomRight"],
              className: "px-4",
            }}
            components={{
              header: {
                cell: (props: any) => (
                  <th
                    {...props}
                    className="!bg-[rgba(242,242,242,0.53)] !text-[#222222] !font-bold !text-[15px] !border-b !border-[rgba(0,0,0,0.06)]"
                  >
                    {props.children}
                  </th>
                ),
              },
            }}
          />
        </div>
      </div>


      {/* Modal */}
      <AddIngredientModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleAddIngredient}
        editingIngredient={editingIngredient}
      />

      {/* Image Modal */}
      <Modal
        title="Xem hình ảnh"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <div className="text-center">
          <Image
            src={selectedImage}
            alt="Hình ảnh nguyên liệu"
            className="max-w-full max-h-96 mx-auto rounded-lg"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdL83LEVKYRYGQaJvxVYGFiXCHcD6jaEzFDYH4G+1aQMjHXlGFjSbmS+Aw8rSwPFVwqbNnK3dJGDYQcA=="
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        ingredientName={ingredientToDelete?.name || ""}
        loading={deleteLoading}
      />

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={notification.onClose}
        duration={4000}
      />
    </div>
  );
};

export default IngredientList;

