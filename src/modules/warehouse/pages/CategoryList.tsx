import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, Space, message } from "antd";
import { ArrowLeftOutlined, PlusOutlined, SearchOutlined, CalendarOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import type { Category, Ingredient } from "../types/index.ts";
import { fakeCategories } from "../data/categories.ts";
import { fakeIngredients } from "../data/ingredients.ts";
import { fakeProducts } from "../data/products.ts";
import AddCategoryModal from "../components/AddCategoryModal.tsx";
import Notification, { type NotificationProps } from "../../../components/Notification.tsx";
import { addHistoryEvent } from "../utils/history.ts";

const { Search } = Input;

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  
  // Load từ localStorage hoặc dùng fakeCategories
  const loadCategories = () => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading categories:', e);
        return fakeCategories;
      }
    }
    return fakeCategories;
  };

  const [categories, setCategories] = useState<Category[]>(loadCategories());
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [notification, setNotification] = useState<NotificationProps>({
    type: 'success',
    message: '',
    visible: false,
    onClose: () => setNotification(prev => ({ ...prev, visible: false }))
  });

  // Debug modal state
  React.useEffect(() => {
    console.log('Modal visible:', isModalVisible);
    console.log('Editing category:', editingCategory);
  }, [isModalVisible, editingCategory]);

  // Load ingredients and products to calculate product count
  const loadIngredients = () => {
    const savedIngredients = localStorage.getItem('ingredients');
    const savedProducts = localStorage.getItem('products');
    
    let ingredients = [];
    let products = [];
    
    if (savedIngredients) {
      try {
        ingredients = JSON.parse(savedIngredients);
      } catch (e) {
        ingredients = fakeIngredients;
      }
    } else {
      ingredients = fakeIngredients;
    }
    
    if (savedProducts) {
      try {
        products = JSON.parse(savedProducts);
      } catch (e) {
        products = fakeProducts;
      }
    } else {
      products = fakeProducts;
    }
    
    // Combine ingredients and products for counting
    return [...ingredients, ...products];
  };

  const allIngredients = loadIngredients();

  // Function to get product count for a category
  const getProductCount = (categoryName: string) => {
    const count = allIngredients.filter((ingredient: Ingredient) => ingredient.category === categoryName).length;
    console.log(`Product count for "${categoryName}":`, count, 'from', allIngredients.length, 'total items');
    console.log('All ingredients categories:', allIngredients.map(i => i.category));
    return count;
  };


  // Lưu vào localStorage mỗi khi categories thay đổi
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
    console.log('Saved to localStorage:', categories.length, 'categories');
  }, [categories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return categories.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categories, searchText]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredCategories.slice(startIndex, startIndex + pageSize);

  // Calculate totals
  const totalProducts = categories.reduce((sum, cat) => sum + getProductCount(cat.name), 0);
  
  // Trang quản lý phân loại không cần hiển thị trạng thái tồn kho

  const handleAddCategory = (categoryData: Omit<Category, "id">) => {
    try {
      if (editingCategory) {
        // Edit existing category
        setCategories((prev) =>
          prev.map((item) =>
            item.id === editingCategory.id
              ? { ...categoryData, id: editingCategory.id, createdDate: categoryData.createdDate || editingCategory.createdDate }
              : item
          )
        );
        setEditingCategory(null);
        addHistoryEvent({
          type: "update",
          entityType: "category",
          entityId: editingCategory.id,
          entityName: categoryData.name,
          actor: "Người dùng",
          before: editingCategory as any,
          after: { ...categoryData, id: editingCategory.id } as any,
        });
        setNotification({
          type: 'success',
          message: `Đã cập nhật danh mục "${categoryData.name}" thành công!`,
          visible: true,
          onClose: () => setNotification(prev => ({ ...prev, visible: false }))
        });
      } else {
        // Add new category
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
        };
        setCategories([...categories, newCategory]);
        addHistoryEvent({
          type: "create",
          entityType: "category",
          entityId: newCategory.id,
          entityName: newCategory.name,
          actor: "Người dùng",
          after: newCategory as any,
        });
        setNotification({
          type: 'success',
          message: `Đã thêm danh mục "${categoryData.name}" thành công!`,
          visible: true,
          onClose: () => setNotification(prev => ({ ...prev, visible: false }))
        });
      }
      setIsModalVisible(false);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Có lỗi xảy ra khi thêm/cập nhật danh mục!',
        visible: true,
        onClose: () => setNotification(prev => ({ ...prev, visible: false }))
      });
    }
  };

  const handleDelete = (id: string) => {
    const category = categories.find(item => item.id === id);
    if (category && window.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      setCategories((prev) => prev.filter((item) => item.id !== id));
      addHistoryEvent({
        type: "delete",
        entityType: "category",
        entityId: category.id,
        entityName: category.name,
        actor: "Người dùng",
        before: category as any,
      });
      setNotification({
        type: 'success',
        message: `Đã xóa danh mục "${category.name}" thành công!`,
        visible: true,
        onClose: () => setNotification(prev => ({ ...prev, visible: false }))
      });
    }
  };

  const handleView = (record: Category) => {
    navigate(`/kho/phan-loai/${record.id}/${encodeURIComponent(record.name)}`);
  };

  const handleEdit = (record: Category) => {
    console.log('Edit clicked for category:', record);
    setEditingCategory(record);
    setIsModalVisible(true);
    console.log('Modal should be visible now');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setIsModalVisible(false);
  };

  const showModal = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const columns: any[] = [
    {
      title: "Danh mục",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 150,
      render: (text: string) => <span className="font-bold text-[#222222]">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      align: "center",
      width: 250,
      render: (text: string) => <span className="text-[#222222]">{text}</span>,
    },
    {
      title: "Số sản phẩm",
      dataIndex: "name",
      key: "productCount",
      align: "center",
      width: 120,
      render: (categoryName: string) => {
        const count = getProductCount(categoryName);
        return <span className="text-[#222222] font-bold">{count}</span>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      align: "center",
      width: 120,
      render: (date: string) => {
        // Format date to DD/MM/YYYY with zero-padding
        const formatDate = (dateStr: string) => {
          if (!dateStr || dateStr === "N/A") return dateStr;
          
          // If already in DD/MM/YYYY format, ensure zero-padding
          if (dateStr.includes('/') && dateStr.split('/').length === 3) {
            const parts = dateStr.split('/');
            const [day, month, year] = parts;
            const paddedDay = day?.padStart(2, '0') || day;
            const paddedMonth = month?.padStart(2, '0') || month;
            return `${paddedDay}/${paddedMonth}/${year}`;
          }
          
          // If in YYYY-MM-DD format, convert to DD/MM/YYYY with zero-padding
          if (dateStr.includes('-') && dateStr.split('-').length === 3) {
            const parts = dateStr.split('-');
            const [year, month, day] = parts;
            const paddedDay = day?.padStart(2, '0') || day;
            const paddedMonth = month?.padStart(2, '0') || month;
            return `${paddedDay}/${paddedMonth}/${year}`;
          }
          
          return dateStr;
        };
        
        const value = formatDate(date);
        return (
          <span className="inline-flex items-center gap-1 justify-center text-[#222222]">
            <CalendarOutlined />
            {value}
          </span>
        );
      },
      sorter: (a: Category, b: Category) => {
        // Convert DD/MM/YYYY to Date for comparison
        const parseDate = (dateStr: string) => {
          if (!dateStr || dateStr === "N/A") return new Date(0); // Invalid dates go to beginning
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(parseInt(year || '0'), parseInt(month || '1') - 1, parseInt(day || '1'));
          }
          return new Date(0);
        };
        
        const dateA = parseDate(a.createdDate || '');
        const dateB = parseDate(b.createdDate || '');
        return dateA.getTime() - dateB.getTime();
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 200,
      render: (_: any, record: Category) => (
        <Space size="small">
          <Button
            size="small"
            className="bg-[#14933e] border-[#14933e] text-white font-bold text-xs hover:bg-[#14933e] hover:border-[#14933e]"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="primary"
            size="small"
            className="bg-[#5296e5] border-[#5296e5] text-white font-bold text-xs"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            className="bg-[#ff5f57] border-[#ff5f57] text-white font-bold text-xs hover:bg-[#ff5f57] hover:border-[#ff5f57]"
            icon={<DeleteOutlined />}
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
        <Link to="/kho" className="flex items-center gap-2 text-[#0088ff] font-bold hover:text-[#0066cc]">
          <ArrowLeftOutlined />
          <span>Quay lại</span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-[#222222] mb-4 flex-shrink-0">
        Quản lí phân loại
      </h1>

      {/* Stats Cards */}
      <div className="flex gap-4 mb-4 flex-shrink-0">
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px] h-[120px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#222222] font-bold text-xs">Tổng danh mục</p>
            <div className="bg-gray-100 p-2 rounded">
              <img src="/package.svg" alt="Package" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[#222222] font-bold text-4xl">{categories.length}</p>
        </div>
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px] h-[120px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#222222] font-bold text-xs">Tổng sản phẩm</p>
            <div className="bg-gray-100 p-2 rounded">
            <img src="/3d_box_fill.svg" alt="Package" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[#222222] font-bold text-4xl">{totalProducts}</p>
        </div>
        {/* Ẩn các card tồn kho ở trang danh sách phân loại theo yêu cầu */}
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
          onClick={showModal}
        >
          Thêm danh mục
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[rgba(0,0,0,0.16)] rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table
            key={categories.length}
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            scroll={{ x: 1000, y: 'calc(100vh - 500px)' }}
            pagination={{
              current: currentPage,
              total: filteredCategories.length,
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
      <AddCategoryModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleAddCategory}
        editingCategory={editingCategory}
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

export default CategoryList;

