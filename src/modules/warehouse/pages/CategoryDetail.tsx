import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, Space, message, Modal, Image } from "antd";
import { ArrowLeftOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import type { Ingredient } from "../types/index.ts";
import AddIngredientModalForCategory from "../components/AddIngredientModalForCategory.tsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.tsx";
import Notification, { type NotificationProps } from "../../../components/Notification.tsx";

const { Search } = Input;

const CategoryDetail: React.FC = () => {
  const { categoryId, categoryName } = useParams<{ categoryId: string; categoryName: string }>();
  
  // Load ingredients from localStorage
  const loadIngredients = () => {
    const saved = localStorage.getItem('ingredients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const [allIngredients, setAllIngredients] = useState<Ingredient[]>(loadIngredients());
  
  // Reload when localStorage changes
  useEffect(() => {
    setAllIngredients(loadIngredients());
  }, []);
  
  // Filter by category
  const categoryIngredients = useMemo(() => {
    const currentCategory = decodeURIComponent(categoryName || '');
    console.log('Filter - Current category:', currentCategory);
    console.log('Filter - All ingredients:', allIngredients.map(i => ({ name: i.name, category: i.category })));
    
    const filtered = allIngredients.filter(item => 
      item.category === currentCategory
    );
    
    console.log('Filter - Filtered ingredients:', filtered.map(i => ({ name: i.name, category: i.category })));
    return filtered;
  }, [allIngredients, categoryName]);

  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationProps>({
    type: 'success',
    message: '',
    visible: false,
    onClose: () => setNotification(prev => ({ ...prev, visible: false }))
  });

  // Filter ingredients based on search
  const filteredIngredients = useMemo(() => {
    return categoryIngredients.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categoryIngredients, searchText]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredIngredients.slice(startIndex, startIndex + pageSize);

  // Calculate statistics
  const totalProducts = categoryIngredients.length;
  const inStockProducts = categoryIngredients.filter(i => i.status === 'active').length;
  const lowStockProducts = categoryIngredients.filter(i => i.status === 'low_stock').length;
  const outOfStockProducts = categoryIngredients.filter(i => i.status === 'expired').length;
  
  console.log('Stats - Category:', decodeURIComponent(categoryName || ''));
  console.log('Stats - Total products:', totalProducts);
  console.log('Stats - In stock:', inStockProducts);
  console.log('Stats - Low stock:', lowStockProducts);
  console.log('Stats - Out of stock:', outOfStockProducts);
  console.log('Stats - Should show out of stock card:', outOfStockProducts > 0);

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const handleAddIngredient = (ingredientData: Omit<Ingredient, "id">) => {
    try {
      if (editingIngredient) {
        // Edit existing ingredient
        const formatDate = (dateString: string) => {
          if (!dateString || dateString === '') {
            return editingIngredient.importDate;
          }
          
          const date = new Date(dateString + 'T00:00:00');
          if (isNaN(date.getTime())) {
            return editingIngredient.importDate;
          }
          
          const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          return formatted;
        };

        const formattedDate = formatDate(ingredientData.importDate || '');
        
        console.log('Edit - Original ingredient:', editingIngredient);
        console.log('Edit - New data:', ingredientData);
        console.log('Edit - Formatted date:', formattedDate);
        
        // Update in localStorage
        const savedIngredients = loadIngredients();
        const updatedIngredients = savedIngredients.map((item: Ingredient) =>
          item.id === editingIngredient.id
            ? { 
                ...ingredientData, 
                id: editingIngredient.id,
                category: editingIngredient.category, // Giữ nguyên category cũ
                importDate: formattedDate
              }
            : item
        );
        
        console.log('Edit - Updated ingredients:', updatedIngredients);
        localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
        setAllIngredients(updatedIngredients);
        
        setEditingIngredient(null);
        setNotification({
          type: 'success',
          message: `Đã cập nhật nguyên liệu "${ingredientData.name}" thành công!`,
          visible: true,
          onClose: () => setNotification(prev => ({ ...prev, visible: false }))
        });
      } else {
        // Add new ingredient
        const formatDate = (dateString: string) => {
          if (!dateString || dateString === '') {
            const today = new Date();
            return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          }
          
          const date = new Date(dateString + 'T00:00:00');
          if (isNaN(date.getTime())) {
            const today = new Date();
            return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          }
          
          const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          return formatted;
        };
        
        const formattedDate = formatDate(ingredientData.importDate || '');
        
        const newIngredient: Ingredient = {
          ...ingredientData,
          id: Date.now().toString(),
          importDate: formattedDate,
        };
        
        // Update in localStorage
        const savedIngredients = loadIngredients();
        const updatedIngredients = [...savedIngredients, newIngredient];
        localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
        setAllIngredients(updatedIngredients);
        
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
        message: 'Đã xảy ra lỗi khi thêm nguyên liệu!',
        visible: true,
        onClose: () => setNotification(prev => ({ ...prev, visible: false }))
      });
    }
  };

  const handleEdit = (record: Ingredient) => {
    setEditingIngredient(record);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (record: Ingredient) => {
    setIngredientToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!ingredientToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      // Update in localStorage
      const savedIngredients = loadIngredients();
      const updatedIngredients = savedIngredients.filter(
        (item: Ingredient) => item.id !== ingredientToDelete.id
      );
      localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
      setAllIngredients(updatedIngredients);
      
      setDeleteModalVisible(false);
      setIngredientToDelete(null);
      
      setNotification({
        type: 'success',
        message: `Đã xóa nguyên liệu "${ingredientToDelete.name}" thành công!`,
        visible: true,
        onClose: () => setNotification(prev => ({ ...prev, visible: false }))
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Đã xảy ra lỗi khi xóa nguyên liệu!',
        visible: true,
        onClose: () => setNotification(prev => ({ ...prev, visible: false }))
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 border border-[#14933e] text-[#14933e] rounded text-xs font-bold">
            Còn hàng
          </span>
        );
      case 'low_stock':
        return (
          <span className="px-3 py-1 border border-[#febc2f] text-[#febc2f] rounded text-xs font-bold">
            Sắp hết
          </span>
        );
      case 'expired':
        return (
          <span className="px-3 py-1 border border-[#ff383c] text-[#ff383c] rounded text-xs font-bold">
            Đã hết
          </span>
        );
      default:
        return 'N/A';
    }
  };

  const columns: any[] = [
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 150,
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
          className="bg-[#0088ff] rounded-xl"
          onClick={() => handleViewImage(record.image)}
          icon={<EyeOutlined />}
        >
          xem
        </Button>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
      render: (quantity: number) => <span className="text-[#222222]">{quantity}</span>,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      align: "center",
      width: 80,
      render: (unit: string) => <span className="text-[#222222]">{unit}</span>,
    },
    {
      title: "Ngày nhập",
      dataIndex: "importDate",
      key: "importDate",
      align: "center",
      width: 120,
      render: (date: string) => <span className="text-[#222222]">{date}</span>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 100,
      render: (price: string) => <span className="text-[#14933e] font-bold text-xs">{price}</span>,
    },
    {
      title: "Người nhập",
      dataIndex: "supplier",
      key: "supplier",
      align: "center",
      width: 130,
      render: (supplier: string) => <span className="text-[#222222]">{supplier || "N/A"}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: Ingredient) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            className="bg-[#5296e5] border-[#5296e5] text-white font-bold text-xs"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            className="bg-[#ff5f57] border-[#ff5f57] text-white font-bold text-xs hover:bg-[#ff5f57] hover:border-[#ff5f57]"
            onClick={() => handleDeleteClick(record)}
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
        <Link to="/kho/phan-loai" className="flex items-center gap-2 text-[#0088ff] font-bold hover:text-[#0066cc]">
          <ArrowLeftOutlined />
        </Link>
        <h1 className="text-2xl font-bold text-[#222222]">
          {decodeURIComponent(categoryName || '')}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-4 mb-4 flex-shrink-0">
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px] h-[120px] flex flex-col justify-between">
           <div className="flex items-center justify-between mb-2">
             <p className="text-[#222222] font-bold text-xs">Tổng sản phẩm</p>
             <div className="bg-gray-100 p-2 rounded">
               <img 
                 src="/3d_box_fill.svg?v=2" 
                 alt="3D Box" 
                 className="w-4 h-4"
                 onError={(e) => {
                   console.log('Failed to load 3d_box_fill.svg');
                   e.currentTarget.src = '/package.svg';
                 }}
               />
             </div>
           </div>
          <p className="text-[#222222] font-bold text-4xl">{totalProducts}</p>
        </div>
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px] h-[120px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#222222] font-bold text-xs">Còn hàng</p>
            <div className="bg-[#27c840] w-3 h-3 rounded-full"></div>
          </div>
          <p className="text-[#222222] font-bold text-4xl">{inStockProducts}</p>
        </div>
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px] h-[120px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#222222] font-bold text-xs">Sắp hết hàng</p>
            <div className="bg-[#febc2f] w-3 h-3 rounded-full"></div>
          </div>
          <p className="text-[#222222] font-bold text-4xl">{lowStockProducts}</p>
        </div>
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px] h-[120px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#222222] font-bold text-xs">Hết hàng</p>
            <div className="bg-[#ff383c] w-3 h-3 rounded-full"></div>
          </div>
          <p className="text-[#222222] font-bold text-4xl">{outOfStockProducts}</p>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="relative w-[282px]">
          <Search
            placeholder="Tìm kiếm danh mục ..."
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border-[#e0dbdb]"
            size="large"
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-[#0088ff] border-[#0088ff] shadow-lg px-6"
          onClick={() => {
            setEditingIngredient(null);
            setIsModalVisible(true);
          }}
        >
          Thêm nguyên liệu
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[rgba(0,0,0,0.16)] rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table
            key={categoryIngredients.length}
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            scroll={{ x: 1200, y: 'calc(100vh - 550px)' }}
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
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLw3LEVKYRYGQaJvxVYGFiXCHcD6jaEzFDYH4G+1aQMjHXlGFjSbmS+Aw8rSwPFVwqbNnK3dJGDYQcA=="
          />
        </div>
      </Modal>

      {/* Add/Edit Ingredient Modal */}
      <AddIngredientModalForCategory
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingIngredient(null);
        }}
        onOk={handleAddIngredient}
        editingIngredient={editingIngredient}
        categoryName={decodeURIComponent(categoryName || '')}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setIngredientToDelete(null);
        }}
        onConfirm={handleDelete}
        ingredientName={ingredientToDelete?.name || ''}
        loading={deleteLoading}
      />

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={notification.onClose}
      />
    </div>
  );
};

export default CategoryDetail;

