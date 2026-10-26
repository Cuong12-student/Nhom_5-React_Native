import axios from "axios";

// Dán đường link MockAPI của bạn (trên web mockapi.io) vào đây
const BASE_URL = "https://6ad3602e59dd78397bbba57d.mockapi.io/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
