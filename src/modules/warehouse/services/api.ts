
// HƯỚNG DẪN TÍCH HỢP BACKEND
// BE chỉ cần thay phần trả về giả lập bằng các request thật (fetch/axios).
// Giữ nguyên chữ ký hàm để FE có thể chuyển từ localStorage sang API một cách liền mạch.

export interface ApiListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
}

// Kiểu thực thể cơ bản, có thể tái sử dụng cho Sản phẩm/Nguyên liệu/Danh mục
export interface BaseEntity {
  id: string;
}

// ============== NGUYÊN LIỆU (INGREDIENTS) ==============
export async function fetchIngredients(params: ApiListParams): Promise<ApiListResponse<any>> {
  // BE: GET /api/warehouse/ingredients?page=&pageSize=&search=
  // Ví dụ: return await http.get(ApiUrl, { params })
  return { items: [], total: 0 };
}

export async function createIngredient(payload: any): Promise<any> {
  // BE: POST /api/warehouse/ingredients
  // Ví dụ: return await http.post(ApiUrl, payload)
  return payload;
}

export async function updateIngredient(id: string, payload: any): Promise<any> {
  // BE: PUT /api/warehouse/ingredients/:id
  // Ví dụ: return await http.put(`${ApiUrl}/${id}`, payload)
  return { id, ...payload };
}

export async function deleteIngredient(id: string): Promise<void> {
  // BE: DELETE /api/warehouse/ingredients/:id
  // Ví dụ: await http.delete(`${ApiUrl}/${id}`)
}

// ============== SẢN PHẨM (PRODUCTS) ==============
export async function fetchProducts(params: ApiListParams): Promise<ApiListResponse<any>> {
  // BE: GET /api/warehouse/products?page=&pageSize=&search=
  return { items: [], total: 0 };
}

export async function createProduct(payload: any): Promise<any> {
  // BE: POST /api/warehouse/products
  return payload;
}

export async function updateProduct(id: string, payload: any): Promise<any> {
  // BE: PUT /api/warehouse/products/:id
  return { id, ...payload };
}

export async function deleteProduct(id: string): Promise<void> {
  // BE: DELETE /api/warehouse/products/:id
}

// ============== DANH MỤC (CATEGORIES) ==============
export async function fetchCategories(params: ApiListParams): Promise<ApiListResponse<any>> {
  // BE: GET /api/warehouse/categories?page=&pageSize=&search=
  return { items: [], total: 0 };
}

export async function createCategory(payload: any): Promise<any> {
  // BE: POST /api/warehouse/categories
  return payload;
}

export async function updateCategory(id: string, payload: any): Promise<any> {
  // BE: PUT /api/warehouse/categories/:id
  return { id, ...payload };
}

export async function deleteCategory(id: string): Promise<void> {
  // BE: DELETE /api/warehouse/categories/:id
}

// ============== LỊCH SỬ/GHI LOG (HISTORY/AUDIT) ==============
export interface HistoryEventDto {
  id?: string;
  createdAt?: string;
  type: string; // create|update|delete|import|export|...
  entityType: string; // product|category
  entityId: string;
  entityName: string;
  actor: string;
  delta?: { quantity?: number; price?: number };
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  note?: string;
}

export async function fetchHistory(params: ApiListParams & { type?: string; entityType?: string }): Promise<ApiListResponse<HistoryEventDto>> {
  // BE: GET /api/warehouse/history?page=&pageSize=&search=&type=&entityType=
  return { items: [], total: 0 };
}

export async function createHistory(event: HistoryEventDto): Promise<HistoryEventDto> {
  // BE: POST /api/warehouse/history
  return { ...event, id: "temp", createdAt: new Date().toISOString() };
}


