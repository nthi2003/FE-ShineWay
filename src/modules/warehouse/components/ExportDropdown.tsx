import React, { useState } from "react";
import { Button, Dropdown, Menu } from "antd";
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

interface ExportDropdownProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportExcel,
  onExportPDF,
}) => {
  const [visible, setVisible] = useState(false);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "excel") {
      onExportExcel();
    } else if (key === "pdf") {
      onExportPDF();
    }
    setVisible(false);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "excel",
      label: "File excel",
      icon: <FileExcelOutlined />,
    },
    {
      key: "pdf", 
      label: "File PDF",
      icon: <FilePdfOutlined />,
    },
  ];

  const menu = (
    <Menu
      items={menuItems}
      onClick={handleMenuClick}
      style={{
        borderRadius: 8,
        border: "1px solid #E0DBDB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    />
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
    >
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        className="bg-[#14933E] border-[#14933E] rounded-xl h-[46px] font-bold hover:bg-[#12832A]"
      >
        Xuất
      </Button>
    </Dropdown>
  );
};

export default ExportDropdown;
