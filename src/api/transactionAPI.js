import apiClient from "./apiClient";

export const expenseApi = {
  // 1. Lấy danh sách chi tiêu của người dùng
  getAll: async (userId) => {
    const response = await apiClient.get(`/expenses?userId=${userId}`);
    return response.data;
  },

  // 2. Thêm khoản chi mới
  create: async (data) => {
    const response = await apiClient.post("/expenses", data);
    return response.data;
  },

  // 3. Sửa khoản chi
  update: async (id, data) => {
    const response = await apiClient.put(`/expenses/${id}`, data);
    return response.data;
  },

  // 4. Xóa khoản chi
  delete: async (id) => {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },
};
