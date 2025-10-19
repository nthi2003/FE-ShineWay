import React from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  ingredientName?: string | undefined;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  ingredientName = "",
  loading = false,
}) => {
  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={375}
      className="delete-confirmation-modal"
      styles={{
        body: { padding: 0 },
        content: { borderRadius: '12px' }
      }}
    >
      <div className="relative bg-white rounded-[12px] p-6">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-[12px] opacity-30"></div>
        
        {/* Main content */}
        <div className="relative z-10">
          {/* Warning icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationCircleOutlined className="text-red-500 text-2xl" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-[#ff383c] text-2xl font-bold mb-4 whitespace-nowrap">
            Xác nhận xóa vật phẩm ?
          </h3>

          {/* Ingredient name */}
          <div className="text-center mb-2">
            <span className="text-[#222222] text-sm font-bold">Xác nhận xóa vật phẩm :</span>
            <span className="text-[#5296e5] text-sm font-bold ml-2">{ingredientName}</span>
          </div>

          {/* Warning message */}
          <p className="text-center text-[#7c7c7c] text-xs mb-6">
            Hành động này không thể hoàn tác
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            {/* Cancel button */}
            <Button
              type="default"
              size="large"
              className="flex-1 h-12 border border-[#c9c9c9] rounded-[6px] text-black font-bold text-base hover:border-[#c9c9c9] hover:text-black"
              onClick={onCancel}
            >
              Hủy
            </Button>

            {/* Confirm button */}
            <Button
              type="primary"
              size="large"
              className="flex-1 h-12 bg-[#ff383c] border-[#ff383c] rounded-[6px] text-white font-bold text-base hover:bg-[#ff383c] hover:border-[#ff383c]"
              onClick={onConfirm}
              loading={loading}
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
