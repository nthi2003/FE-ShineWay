import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, Space, message } from "antd";
import { ArrowLeftOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import type { Category, Ingredient } from "../types/index.ts";
import { fakeCategories } from "../data/categories.ts";
import { fakeIngredients } from "../data/ingredients.ts";
import { fakeProducts } from "../data/products.ts";
import AddCategoryModal from "../components/AddCategoryModal.tsx";
import Notification, { type NotificationProps } from "../../../components/Notification.tsx";

const { Search } = Input;

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  
  // Tải từ localStorage hoặc sử dụng fakeCategories
  const loadCategories = () => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Lỗi khi tải danh mục:', e);
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

  // Debug trạng thái modal
  React.useEffect(() => {
    console.log('Modal visible:', isModalVisible);
    console.log('Editing category:', editingCategory);
  }, [isModalVisible, editingCategory]);

  // Tải nguyên liệu và sản phẩm để tính số lượng sản phẩm
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
    
    // Kết hợp nguyên liệu và sản phẩm để đếm
    return [...ingredients, ...products];
  };

  const allIngredients = loadIngredients();

  // Hàm lấy số lượng sản phẩm cho một danh mục
  const getProductCount = (categoryName: string) => {
    const count = allIngredients.filter((ingredient: Ingredient) => ingredient.category === categoryName).length;
    console.log(`Số lượng sản phẩm cho "${categoryName}":`, count, 'từ', allIngredients.length, 'tổng số mục');
    console.log('Tất cả danh mục nguyên liệu:', allIngredients.map(i => i.category));
    return count;
  };


  // Lưu vào localStorage mỗi khi danh mục thay đổi
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
    console.log('Đã lưu vào localStorage:', categories.length, 'danh mục');
  }, [categories]);

  // Lọc danh mục dựa trên tìm kiếm
  const filteredCategories = useMemo(() => {
    return categories.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categories, searchText]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredCategories.slice(startIndex, startIndex + pageSize);

  // Tính tổng
  const totalProducts = categories.reduce((sum, cat) => sum + getProductCount(cat.name), 0);

  const handleAddCategory = (categoryData: Omit<Category, "id">) => {
    try {
      if (editingCategory) {
        // Chỉnh sửa danh mục hiện có
        setCategories((prev) =>
          prev.map((item) =>
            item.id === editingCategory.id
              ? { ...categoryData, id: editingCategory.id, createdDate: categoryData.createdDate || editingCategory.createdDate }
              : item
          )
        );
        setEditingCategory(null);
        setNotification({
          type: 'success',
          message: `Đã cập nhật danh mục "${categoryData.name}" thành công!`,
          visible: true,
          onClose: () => setNotification(prev => ({ ...prev, visible: false }))
        });
      } else {
        // Thêm danh mục mới
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
        };
        setCategories([...categories, newCategory]);
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
    console.log('Nhấp chỉnh sửa cho danh mục:', record);
    setEditingCategory(record);
    setIsModalVisible(true);
    console.log('Modal bây giờ sẽ hiển thị');
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
        
        return <span className="text-[#222222]">{formatDate(date)}</span>;
      },
      sorter: (a: Category, b: Category) => {
        // Chuyển đổi DD/MM/YYYY thành Date để so sánh
        const parseDate = (dateStr: string) => {
          if (!dateStr || dateStr === "N/A") return new Date(0); // Ngày không hợp lệ sẽ đặt ở đầu
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
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
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
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#222222] font-bold text-xs">Tổng danh mục</p>
            <div className="bg-gray-100 p-2 rounded">
              <img src="/package.svg" alt="Package" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[#222222] font-bold text-4xl">{categories.length}</p>
        </div>
        <div className="bg-white border border-[#e0dbdb] rounded-xl p-4 w-[234px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#222222] font-bold text-xs">Tổng sản phẩm</p>
            <div className="bg-gray-100 p-2 rounded">
            <img src="/3d_box_fill.svg" alt="Package" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[#222222] font-bold text-4xl">{totalProducts}</p>
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

