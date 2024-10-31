import axios from "axios";
import { toast } from "react-toastify";

// URL của API backend
const API_URL = "http://localhost:8080/api";

// Hàm gọi API để lấy danh sách người dùng theo phân trang
export const getUsers = async (token, page = 0, size = 10) => {
    try {
        const response = await axios.get(`${API_URL}/users/pagination?page=${page}&size=${size}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Trả về đối tượng phân trang
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};
// Hàm kiểm tra xem tên đăng nhập có tồn tại không
export const checkUsernameExists = async (username, token) => {
    try {
        const response = await axios.get(`${API_URL}/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const usernames = response.data.map(user => user.username); // Lấy danh sách tên đăng nhập

        return usernames.includes(username); // Kiểm tra xem tên đăng nhập có trong danh sách không
    } catch (error) {
        console.error("Error checking username existence:", error);
        // Trả về false để không có lỗi nếu có lỗi xảy ra
        return false;
    }
};

// Hàm gọi API để thêm mới nhân viên
export const saveEmployeeToAPI = async (values, token) => { // Đổi tên hàm này
    try {
        const response = await axios.post(`${API_URL}/users`, values, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 201) {
            toast.success("Thêm mới nhân viên thành công!");
            return response.data;
        }
    } catch (error) {
        console.error("Error adding employee:", error);
        toast.error("Lỗi khi thêm mới nhân viên: " + error.response?.data?.message || error.message);
        throw error;
    }
};
// Hàm gọi API để tìm kiếm người dùng
export const searchUsers = async (userName, fullName, numberPhone, token, page = 0, size = 10) => {
    try {
        const response = await axios.get(`${API_URL}/users/search`, {
            params: {
                userName,
                fullName,
                numberPhone,
                page,
                size,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Trả về đối tượng phân trang
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
};


export const updateUser = async (userId, userData, token) => {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};
// Hàm gọi API để lấy thông tin người dùng theo ID
export const getUserById = async (userId, token) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Trả về thông tin người dùng
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
    }
};
// Hàm gọi API để xóa người dùng theo ID
export const deleteUser = async (userId, token) => {
    try {
        const response = await axios.delete(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status === 204) {
            toast.success("Xóa người dùng thành công!");
        }
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Lỗi khi xóa người dùng: " + error.response?.data?.message || error.message);
        throw error;
    }
};

