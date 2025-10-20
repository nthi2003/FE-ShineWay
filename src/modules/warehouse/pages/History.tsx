import React, { useMemo, useState } from "react";
import { Card, DatePicker, Input, Segmented, Select, Space, Table, Tag, Timeline, Button, Drawer, Descriptions } from "antd";
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, SyncOutlined, DollarCircleOutlined, PictureOutlined } from "@ant-design/icons";
import { getHistoryEvents, type HistoryEvent as HEvent } from "../utils/history.ts";

type EventType =
  | "create"
  | "update"
  | "delete"
  | "import"
  | "export"
  | "adjust"
  | "price_change"
  | "image_change";

interface HistoryEvent {
  id: string;
  createdAt: string; // ISO string
  type: EventType;
  entityType: "product" | "category";
  entityId: string;
  entityName: string;
  actor: string;
  delta?: { quantity?: number; price?: number };
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  note?: string;
}

const ICON_BY_TYPE: Record<EventType, React.ReactNode> = {
  create: <PlusCircleOutlined style={{ color: "#22C55E" }} />,
  update: <EditOutlined style={{ color: "#3B82F6" }} />,
  delete: <DeleteOutlined style={{ color: "#EF4444" }} />,
  import: <DownloadOutlined style={{ color: "#16A34A" }} />,
  export: <UploadOutlined style={{ color: "#F59E0B" }} />,
  adjust: <SyncOutlined style={{ color: "#F59E0B" }} />,
  price_change: <DollarCircleOutlined style={{ color: "#0EA5E9" }} />,
  image_change: <PictureOutlined style={{ color: "#8B5CF6" }} />,
};

// demo data
const MOCK_EVENTS: HistoryEvent[] = [
  {
    id: "e1",
    createdAt: new Date().toISOString(),
    type: "import",
    entityType: "product",
    entityId: "p1",
    entityName: "Thịt bò Úc",
    actor: "Kho A",
    delta: { quantity: 50 },
    note: "Nhập lô mới",
  },
  {
    id: "e2",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: "price_change",
    entityType: "product",
    entityId: "p1",
    entityName: "Thịt bò Úc",
    actor: "Quản lý B",
    delta: { price: 5000 },
    before: { price: "180000đ" },
    after: { price: "185000đ" },
  },
  {
    id: "e3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: "export",
    entityType: "product",
    entityId: "p2",
    entityName: "Rau xà lách",
    actor: "Bếp 1",
    delta: { quantity: -10 },
  },
];

const { RangePicker } = DatePicker;
const { Option } = Select;

const WarehouseHistory: React.FC = () => {
  const [mode, setMode] = useState<"timeline" | "table">("timeline");
  const [keyword, setKeyword] = useState("");
  const [types, setTypes] = useState<EventType[] | undefined>(undefined);
  const [entityType, setEntityType] = useState<"product" | "category" | undefined>(undefined);
  const [drawer, setDrawer] = useState<HistoryEvent | null>(null);

  const dataSource: HistoryEvent[] = (() => {
    const stored = getHistoryEvents() as unknown as HistoryEvent[];
    return stored && stored.length ? stored : MOCK_EVENTS;
  })();

  const filtered = useMemo(() => {
    return dataSource.filter((e) => {
      const okKeyword = keyword
        ? e.entityName.toLowerCase().includes(keyword.toLowerCase()) || e.actor.toLowerCase().includes(keyword.toLowerCase())
        : true;
      const okType = types && types.length ? types.includes(e.type) : true;
      const okEntity = entityType ? e.entityType === entityType : true;
      return okKeyword && okType && okEntity;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [keyword, types, entityType, dataSource]);

  const columns = [
    { title: "Thời gian", dataIndex: "createdAt", key: "time", render: (v: string) => new Date(v).toLocaleString(), width: 170 },
    { title: "Loại", dataIndex: "type", key: "type", width: 130, render: (t: EventType) => <Tag>{t}</Tag> },
    { title: "Đối tượng", dataIndex: "entityName", key: "entityName" },
    { title: "Người thực hiện", dataIndex: "actor", key: "actor", width: 140 },
    {
      title: "Thay đổi",
      key: "delta",
      width: 160,
      render: (_: any, r: HistoryEvent) => {
        const parts: string[] = [];
        if (r.delta?.quantity !== undefined) parts.push(`SL: ${r.delta.quantity > 0 ? "+" : ""}${r.delta.quantity}`);
        if (r.delta?.price !== undefined) parts.push(`Giá: ${r.delta.price > 0 ? "+" : ""}${r.delta.price}`);
        return parts.join("; ") || "-";
      },
    },
    {
      title: "",
      key: "action",
      width: 90,
      render: (_: any, r: HistoryEvent) => (
        <Button type="link" onClick={() => setDrawer(r)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-[#222222] mb-4">Lịch sử kho</h1>

      <Card className="mb-3">
        <Space wrap>
          <Input.Search placeholder="Tìm theo sản phẩm / người thực hiện" allowClear onSearch={setKeyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: 320 }} />
          <RangePicker />
          <Select
            mode="multiple"
            allowClear
            placeholder="Loại sự kiện"
            style={{ minWidth: 220 }}
            value={types as any}
            onChange={(v) => setTypes(v as EventType[])}
          >
            {Object.keys(ICON_BY_TYPE).map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
          <Select allowClear placeholder="Đối tượng" style={{ width: 160 }} value={entityType as any} onChange={(v) => setEntityType(v)}>
            <Option value="product">Sản phẩm</Option>
            <Option value="category">Danh mục</Option>
          </Select>
          <Segmented options={[{ label: "Timeline", value: "timeline" }, { label: "Bảng", value: "table" }]} value={mode} onChange={(v) => setMode(v as any)} />
        </Space>
      </Card>

      {mode === "timeline" ? (
        <Card className="flex-1 overflow-auto">
          <Timeline mode="left">
            {filtered.map((e) => (
              <Timeline.Item key={e.id} dot={ICON_BY_TYPE[e.type]} label={new Date(e.createdAt).toLocaleString()}>
                <div className="font-medium">{e.entityName}</div>
                <div className="text-sm text-gray-600">{e.actor} • {e.type}</div>
                {e.delta && (
                  <div className="text-sm">
                    {e.delta.quantity !== undefined && <Tag color={e.delta.quantity >= 0 ? "green" : "volcano"}>SL {e.delta.quantity >= 0 ? "+" : ""}{e.delta.quantity}</Tag>}
                    {e.delta.price !== undefined && <Tag color="blue">Giá {e.delta.price >= 0 ? "+" : ""}{e.delta.price}</Tag>}
                  </div>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      ) : (
        <Card className="flex-1 overflow-auto">
          <Table rowKey="id" columns={columns as any} dataSource={filtered} pagination={{ pageSize: 15 }} />
        </Card>
      )}

      <Drawer title="Chi tiết sự kiện" open={!!drawer} width={520} onClose={() => setDrawer(null)}>
        {drawer && (
          <Descriptions bordered size="small" column={1} labelStyle={{ width: 140 }}>
            <Descriptions.Item label="Thời gian">{new Date(drawer.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Loại">{drawer.type}</Descriptions.Item>
            <Descriptions.Item label="Đối tượng">{drawer.entityName}</Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">{drawer.actor}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{drawer.note || "-"}</Descriptions.Item>
            <Descriptions.Item label="Trước">{drawer.before ? JSON.stringify(drawer.before, null, 2) : "-"}</Descriptions.Item>
            <Descriptions.Item label="Sau">{drawer.after ? JSON.stringify(drawer.after, null, 2) : "-"}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default WarehouseHistory;


