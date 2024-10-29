import axios from "axios";
import { toast } from "react-toastify";

// URL của API backend
const API_URL = "http://localhost:8080/api";

// Hàm gọi API để lấy danh sách người dùng theo phân trang
export const getUsers = async (token, page = 0, size = 5) => {
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
export const searchUsers = async (userName, fullName, numberPhone, token, page = 0, size = 5) => {
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


/**
 * 
 * @param {*} users đây là thông tin người dùng 
 * @returns trả về các trạng thái để chuyển qua xác thực mã code gmail => chưa lưu vào database
 *           trả về các trạng thái nhất định  400  vd: số điện thoại đã tồn tịa
 */
const CreateAccount = async (users) => {
    try {
        users = {...users, 
                    address: "chưa có địa chỉ",
                    roleId: 1,
                    salary : 0,
                    isActive: true
                }
        delete users.confirmPassword // xóa phần xác nhận mật khẩu
        const respone = await axios.post(`http://localhost:8080/api/user/register`,users);
        return respone.data;
    } catch (errors) {
        if (errors.response && errors.response.status === 400) {
            console.log("lỗi rồi đó");
            return errors.response.data;
        }else {
            console.log("Lỗi không xác định", errors);
            throw errors ;
        }
    }
}

/**
 * 
 * @param {*} email gửi email đi để validate coi có tồn tại trong database hay không 
 * @returns trả về trạng thái 200 nếu thành công => true
 *          đã có email trong database thì => false
 */
const SendCodeEmail = async (email) => { // kiểm tra mail có tồn tại ở trong thực tế hay không
    try {
        const response = await axios.post(`http://localhost:8080/api/email/send-code-email?email=${email}`);
        return true;
    } catch (error) {
       // In ra lỗi nếu có
       return false
    }
}

/**
 * 
 * @param {*} oldPassword mật khẩu cũ
 * @param {*} newPassword mật khẩu mới
 * @returns trả về trạng thái  200 nếu thành công
 *          nếu xảy ra lỗi thì trả về các lỗi 400 401 tương ứng rồi hiển thị lên cho người dùng xem
 */
const changePassword = async (oldPassword,newPassword) => {
    const token = localStorage.getItem('token')
    
    try {  
        const response = await axios.post(`http://localhost:8080/api/verify/change-password`,
            {oldPassword,newPassword},
        {headers:
            {
                'Authorization': `Bearer ${token}`, // Đặt token vào header
                'Content-Type': 'application/json'
            }
        }
        );
        return response.data;
    } catch (error) {
        
        return error.response;
    }
}


/**
 * 
 * @param {*} code đây là mã người dùng nhập vào để kiểm tra lúc đăng nhập và xác nhận tài khoản đó đã tồn tại hay ko
 * @param {*} email đây là email người dùng
 * @returns trả về true nếu thành công và sẽ chuyển trang nếu xác thực code thành công
 *          trả về false nếu như sai mã code
 */
const GetCode = async (code, email) => {
    try {
        const response = await axios.post(`http://localhost:8080/api/email/check-code?code=${code}&email=${email}`);
        
        if (response.status === 200) {
            return true; 
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            return false; 
        }
        console.log(error.response.data); 
    }
    return false; 
}
/**
 * 
 * @param {*} username đây là username
 * @param {*} password đây là pasword
 * @returns trả về token và token này sẽ tự động thêm trong Component => Login
 *          xảy ra các lỗi 404 500 và 400 thì lấy lên kiểm tra
 */

const Login =async (username,password) => {
    try {
        const respone = await axios.post(`http://localhost:8080/api/login`,{
            username:username,
            password: password
        }
    );
        return respone.data;
    } catch (error){
        if (error.response) {
            switch (error.response.status) {
                case 404:
                case 500:
                case 400:
                    return error.response.status; 
                default:
                    return "hello"; 
            }
        }
    }
}

const SaveUser = async (users) => {
    try {
        users = {...users, 
            address: "chưa có địa chỉ",
            roleId: 1,
            salary : 0,
            isActive: true
        }
        delete users.confirmPassword
        console.log(users);
        
        const respone = await axios.post(`http://localhost:8080/api/saveUser`,users)
        return respone.data;
    }catch (errors) {
        console.log(errors);
    }
}

/**
 * đây là lấy thông tin của user
 * lấy token và đem xuống rồi lấy thôn tin user ra
 * @returns {<status>} nếu quá trình xảy ra lỗi 
 *                          - 404 và error.response.data = errorOldPassword (true) thì nó sẽ là lỗi mật khẩu cũ không đúng
 *                          - 404 thì đây chính là lỗi  mật khẩu cũ và mật khẩu mới trùng nhau
 *                          - trả về data là 200 nếu thành công
 */
const GetUser =async () => {
    const token = localStorage.getItem('token');
    
    try {
        const data = await axios.get(`http://localhost:8080/api/getUser`, {
            headers: {
                Authorization: `Bearer ${token}`, // Thêm token vào header
            },
        }); 
        console.log(data.data);
        
        return data;
    } catch (error) {
        if (error.response.status === 404 || error.response.status === 500 || error.response.status === 401) {
            localStorage.removeItem('token'); // Xóa token
            toast.error("bạn đã bị lỗi rồi, bạn nên đăng nhập lại")
            window.location.href = '/login'; // trở về với login
        } 
    }
}


/**
 * @returns {<void>} 
 *   - Cái này dùng để thêm token vào trong header cho nó tự động lấy ra kiểm tra 
 *      nếu không có token tự động nó sẽ quay trở lại trang login (cái này là còn phần sau)
 * 
 * @example
 * const response = await verifyCode(userInputCode, userEmail);
 * // Kiểm tra mã trạng thái trả về để xử lý thông báo cho người dùng.
 */
const fetchData = async () => {
    const token = localStorage.getItem('jwt');
    try {
        const response = await axios.get('http://localhost:8080/api/protected-resource', {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });
        console.log("Dữ liệu:", response.data);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
    }
};



export {SendCodeEmail,CreateAccount,GetCode,Login,GetUser,SaveUser,fetchData,changePassword};

