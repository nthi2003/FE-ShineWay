import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Ingredient } from '../types/index.ts';

// Hàm chuyển đổi ký tự tiếng Việt có dấu thành không dấu
const removeVietnameseAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const exportToExcel = (ingredients: Ingredient[], fileName?: string) => {
  try {
    // Chuẩn bị dữ liệu cho Excel
    const excelData = ingredients.map((item, index) => ({
      'STT': index + 1,
      'Tên nguyên liệu': item.name,
      'Danh mục': item.category,
      'Số lượng': item.quantity,
      'Đơn vị': item.unit,
      'Ngày nhập': item.importDate,
      'Giá': item.price,
      'Nhà cung cấp': item.supplier || 'N/A',
      'Mô tả': item.description || 'N/A'
    }));

    // Tạo workbook và worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách nguyên liệu");

    // Xuất file
    const defaultFileName = `Danh_sach_nguyen_lieu_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName || defaultFileName);
    
    return { success: true, message: "Xuất file Excel thành công!" };
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    return { success: false, message: "Có lỗi xảy ra khi xuất file Excel!" };
  }
};

export const exportToPDF = (ingredients: Ingredient[], fileName?: string) => {
  try {
    // Tạo PDF mới
    const doc = new jsPDF();
    
    // Thêm tiêu đề với font hỗ trợ tiếng Việt
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DANH SACH NGUYEN LIEU', 14, 22);
    
    // Thêm ngày xuất
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 30);
    
    // Tạo bảng thủ công với font Times
    let yPosition = 50;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    
    // Header của bảng
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(0, 136, 255); // Màu xanh cho header
    doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, lineHeight + 1, 'F');
    
    doc.setTextColor(255, 255, 255); // Chữ trắng
    doc.text('STT', margin + 3, yPosition);
    doc.text('Ten nguyen lieu', margin + 12, yPosition);
    doc.text('Danh muc', margin + 50, yPosition);
    doc.text('So luong', margin + 75, yPosition);
    doc.text('Don vi', margin + 90, yPosition);
    doc.text('Ngay nhap', margin + 105, yPosition);
    doc.text('Gia', margin + 130, yPosition);
    
    yPosition += lineHeight + 1;
    
    // Dữ liệu bảng
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0); // Chữ đen
    
    ingredients.forEach((item, index) => {
      // Kiểm tra nếu cần trang mới
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
        
        // Vẽ lại header cho trang mới
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setFillColor(0, 136, 255);
        doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, lineHeight + 1, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.text('STT', margin + 3, yPosition);
        doc.text('Ten nguyen lieu', margin + 12, yPosition);
        doc.text('Danh muc', margin + 50, yPosition);
        doc.text('So luong', margin + 75, yPosition);
        doc.text('Don vi', margin + 90, yPosition);
        doc.text('Ngay nhap', margin + 105, yPosition);
        doc.text('Gia', margin + 130, yPosition);
        
        yPosition += lineHeight + 1;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
      }
      
      // Màu nền xen kẽ
      if (index % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, lineHeight, 'F');
      }
      
      doc.text((index + 1).toString(), margin + 3, yPosition);
      doc.text(removeVietnameseAccents(item.name), margin + 12, yPosition);
      doc.text(removeVietnameseAccents(item.category), margin + 50, yPosition);
      doc.text(item.quantity.toString(), margin + 75, yPosition);
      doc.text(removeVietnameseAccents(item.unit), margin + 90, yPosition);
      doc.text(item.importDate, margin + 105, yPosition);
      doc.text(item.price, margin + 130, yPosition);
      
      yPosition += lineHeight;
    });

    // Vẽ khung bảng
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, 47, pageWidth - 2 * margin, yPosition - 47);

    // Xuất file
    const defaultFileName = `Danh_sach_nguyen_lieu_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName || defaultFileName);
    
    return { success: true, message: "Xuất file PDF thành công!" };
  } catch (error) {
    console.error("Lỗi khi xuất PDF:", error);
    return { success: false, message: "Có lỗi xảy ra khi xuất file PDF!" };
  }
};
