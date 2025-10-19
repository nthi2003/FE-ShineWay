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
  // Tải từ localStorage hoặc sử dụng fakeIngredients
  const loadIngredients = () => {
    const saved = localStorage.getItem('ingredients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Lỗi khi tải nguyên liệu:', e);
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

  // Lưu vào localStorage mỗi khi nguyên liệu thay đổi
  useEffect(() => {
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
    console.log('Đã lưu vào localStorage:', ingredients.length, 'nguyên liệu');
  }, [ingredients]);

  // Lọc nguyên liệu dựa trên tìm kiếm
  const filteredIngredients = useMemo(() => {
    console.log('Tổng nguyên liệu:', ingredients.length);
    console.log('Nguyên liệu:', ingredients.map(i => i.name));
    return ingredients.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [ingredients, searchText]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredIngredients.slice(startIndex, startIndex + pageSize);

  const handleAddIngredient = (ingredientData: Omit<Ingredient, "id">) => {
    try {
      if (editingIngredient) {
        // Chỉnh sửa nguyên liệu hiện có - cho phép cập nhật ngày nhập
        const formatDate = (dateString: string) => {
          console.log('Chỉnh sửa - Chuỗi ngày đầu vào:', dateString);
          
          if (!dateString || dateString === '') {
            // Giữ nguyên ngày cũ nếu không nhập ngày mới
            console.log('Chỉnh sửa - Giữ nguyên ngày cũ:', editingIngredient.importDate);
            return editingIngredient.importDate;
          }
          
          // Xử lý format YYYY-MM-DD từ input date
          const date = new Date(dateString + 'T00:00:00');
          console.log('Chỉnh sửa - Ngày đã phân tích:', date);
          
          if (isNaN(date.getTime())) {
            console.log('Chỉnh sửa - Ngày không hợp lệ, giữ nguyên ngày cũ');
            return editingIngredient.importDate;
          }
          
          const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          console.log('Chỉnh sửa - Kết quả đã định dạng:', formatted);
          return formatted;
        };

        const formattedDate = formatDate(ingredientData.importDate || '');
        
        setIngredients((prev) =>
          prev.map((item) =>
            item.id === editingIngredient.id
              ? { 
                  ...ingredientData, 
                  id: editingIngredient.id,
                  importDate: formattedDate // Sử dụng ngày đã định dạng
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
        // Thêm nguyên liệu mới - tự động tạo ngày nhập nếu không có
        const formatDate = (dateString: string) => {
          console.log('Chuỗi ngày đầu vào:', dateString);
          
          if (!dateString || dateString === '') {
            const today = new Date();
            const formatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            console.log('Sử dụng ngày hôm nay:', formatted);
            return formatted;
          }
          
          // Xử lý format YYYY-MM-DD từ input date
          const date = new Date(dateString + 'T00:00:00'); // Thêm timezone để tránh lỗi
          console.log('Ngày đã phân tích:', date);
          
          if (isNaN(date.getTime())) {
            console.log('Ngày không hợp lệ, sử dụng ngày hôm nay');
            const today = new Date();
            return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          }
          
          const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          console.log('Kết quả đã định dạng:', formatted);
          return formatted;
        };
        
        const formattedDate = formatDate(ingredientData.importDate || '');
        console.log('Ngày cuối cùng đã định dạng:', formattedDate);
        
        const newIngredient: Ingredient = {
          ...ingredientData,
          id: Date.now().toString(),
          importDate: formattedDate, // Định dạng ngày nhập
        };
        console.log('Nguyên liệu mới trước khi thêm:', newIngredient);
        setIngredients(prev => {
          const updated = [...prev, newIngredient];
          console.log('Danh sách nguyên liệu đã cập nhật:', updated);
          console.log('Nguyên liệu mới đã thêm:', newIngredient);
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
      // Mô phỏng cuộc gọi API
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
      render: (category: string) => {
        // Define colors for different categories
        const getCategoryColor = (cat: string) => {
          switch (cat.toLowerCase()) {
            case 'rau':
            case 'vegetable':
              return {
                border: 'border-[#22C55E]',
                text: 'text-[#22C55E]',
                bg: 'bg-green-50'
              };
            case 'hải sản':
            case 'seafood':
              return {
                border: 'border-[#3B82F6]',
                text: 'text-[#3B82F6]',
                bg: 'bg-blue-50'
              };
            case 'thịt':
            case 'meat':
              return {
                border: 'border-[#EF4444]',
                text: 'text-[#EF4444]',
                bg: 'bg-red-50'
              };
            case 'lương thực':
            case 'provisions':
              return {
                border: 'border-[#F59E0B]',
                text: 'text-[#F59E0B]',
                bg: 'bg-orange-50'
              };
            default:
              return {
                border: 'border-[#14933E]',
                text: 'text-[#14933E]',
                bg: 'bg-green-50'
              };
          }
        };

        const colors = getCategoryColor(category);
        
        return (
          <span className={`px-3 py-1 border ${colors.border} ${colors.text} ${colors.bg} rounded text-xs font-bold`}>
            {category}
          </span>
        );
      },
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
      render: (importDate: string) => {
        // Định dạng ngày thành DD/MM/YYYY với zero-padding
        const formatDate = (dateStr: string) => {
          if (!dateStr || dateStr === "N/A") return dateStr;
          
          // Nếu đã ở định dạng DD/MM/YYYY, đảm bảo zero-padding
          if (dateStr.includes('/') && dateStr.split('/').length === 3) {
            const parts = dateStr.split('/');
            const [day, month, year] = parts;
            const paddedDay = day?.padStart(2, '0') || day;
            const paddedMonth = month?.padStart(2, '0') || month;
            return `${paddedDay}/${paddedMonth}/${year}`;
          }
          
          // Nếu ở định dạng YYYY-MM-DD, chuyển đổi thành DD/MM/YYYY với zero-padding
          if (dateStr.includes('-') && dateStr.split('-').length === 3) {
            const parts = dateStr.split('-');
            const [year, month, day] = parts;
            const paddedDay = day?.padStart(2, '0') || day;
            const paddedMonth = month?.padStart(2, '0') || month;
            return `${paddedDay}/${paddedMonth}/${year}`;
          }
          
          return dateStr;
        };
        
        return formatDate(importDate) || "N/A";
      },
      sorter: (a: Ingredient, b: Ingredient) => {
        // Chuyển đổi DD/MM/YYYY thành Date để so sánh
        const parseDate = (dateStr: string | undefined) => {
          if (!dateStr || dateStr === "N/A") return new Date(0); // Ngày không hợp lệ sẽ đặt ở đầu
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(parseInt(year || '0'), parseInt(month || '0') - 1, parseInt(day || '0'));
          }
          return new Date(0);
        };
        
        const dateA = parseDate(a.importDate);
        const dateB = parseDate(b.importDate);
        return dateA.getTime() - dateB.getTime();
      },
      sortDirections: ['ascend', 'descend'],
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
        <span className="text-[#14933E] font-bold text-xs">{price}</span>
      ),
      sorter: (a: Ingredient, b: Ingredient) => {
        // Trích xuất giá trị số từ chuỗi giá (loại bỏ "đ" và phân tích)
        const parsePrice = (priceStr: string) => {
          if (!priceStr) return 0;
          // Loại bỏ "đ" và các ký tự không phải số ngoại trừ dấu chấm và phẩy
          const cleanPrice = priceStr.replace(/[^\d.,]/g, '');
          // Thay thế phẩy bằng chấm để phân tích số thập phân
          const normalizedPrice = cleanPrice.replace(',', '.');
          return parseFloat(normalizedPrice) || 0;
        };
        
        const priceA = parsePrice(a.price || '');
        const priceB = parsePrice(b.price || '');
        return priceA - priceB;
      },
      sortDirections: ['ascend', 'descend'],
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

