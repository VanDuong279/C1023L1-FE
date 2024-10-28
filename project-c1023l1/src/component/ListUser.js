import React, { useEffect, useState } from "react";
import { deleteUser, getUsers, searchUsers } from "../service/UserService";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import '../css/listuser.css';

export default function UserList({ resetList, setResetList }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Các biến state cho tìm kiếm
    const [userName, setUserName] = useState("");
    const [fullName, setFullName] = useState("");
    const [numberPhone, setNumberPhone] = useState("");
    const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm kiếm

    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Im5ndXllbmRpbmhoYXVhY2U4Iiwic3ViIjoibmd1eWVuZGluaGhhdWFjZTgiLCJleHAiOjIwOTAwOTI0MDd9.4YrsRllD5jUSUhNhmpA6QjeP777BIjMwkCQwmmojKfg';

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = isSearching
                ? await searchUsers(userName, fullName, numberPhone, token, page)
                : await getUsers(token, page);
            setUsers(data.content);
            setTotalPages(data.totalPages);

            if (resetList) {
                // Reset trạng thái tìm kiếm và biến đầu vào khi resetList là true
                setUserName("");
                setFullName("");
                setNumberPhone("");
                setIsSearching(false);
                setPage(0); // Đặt lại trang về đầu tiên
                setResetList(false); // Reset lại trạng thái sau khi tải xong
            }
        } catch (error) {
            setError("Có lỗi xảy ra khi lấy danh sách người dùng.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [page, resetList]); // Thêm resetList vào dependency

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId, token);

            // Nếu số lượng người dùng còn lại sau khi xóa là 0 và không phải ở trang đầu tiên
            if (users.length === 1 && page > 0) {
                setPage(prevPage => prevPage - 1); // Chuyển về trang trước nếu trang hiện tại không còn dữ liệu
            } else {
                fetchData(); // Gọi lại fetchData để cập nhật danh sách người dùng sau khi xóa
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    // Hàm tìm kiếm
    const handleSearch = () => {
        setIsSearching(true); // Đặt chế độ tìm kiếm
        setPage(0); // Đặt lại trang về trang đầu tiên khi tìm kiếm mới
        // Gọi lại fetchData với các tham số tìm kiếm
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await searchUsers(userName, fullName, numberPhone, token, 0); // Sử dụng page 0 cho tìm kiếm
                setUsers(data.content);
                setTotalPages(data.totalPages);
            } catch (error) {
                setError("Có lỗi xảy ra khi tìm kiếm người dùng.");
            }
            setLoading(false);
        };
        fetchData();
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage((prevPage) => prevPage - 1);
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Danh Sách Người Dùng</h2>

            {/* Bao bọc phần tìm kiếm và bảng trong div với class container */}
            <div className="container">
                {/* Form tìm kiếm */}
                <div>
                    <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={numberPhone}
                        onChange={(e) => setNumberPhone(e.target.value)}
                    />
                    <button onClick={handleSearch}>Tìm kiếm</button>
                </div>

                {users.length > 0 ? (
                    <>
                        <table className="table table-hover">
                            <thead  className="table-light">
                            <tr>
                                <th>STT</th>
                                <th>Tên tài khoản</th>
                                <th>Họ và tên</th>
                                <th>Địa chỉ</th>
                                <th>Số điện thoại</th>
                                <th>Giới tính</th>
                                <th>Ngày sinh</th>
                                <th>Lương</th>
                                <th>Vị trí</th>
                                <th>Tác Vụ</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user, index) => (
                                <tr key={user.userId}>
                                    <td>{index + 1 + page * 10}</td>
                                    <td>{user.username}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.address}</td>
                                    <td>{user.numberphone}</td>
                                    <td>{user.gender ? "Nam" : "Nữ"}</td>
                                    <td>{new Date(user.birthday).toLocaleDateString()}</td>
                                    <td>{user.salary}</td>
                                    <td>{user.role.roleName}</td>
                                    <td>
                                        <Link to={`/users/update/${user.userId}`}>Cập nhật</Link> {/* Thêm liên kết Cập nhật */}
                                        <button onClick={() => handleDelete(user.userId)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>Không có người dùng nào.</p>
                )}
            </div>

            {/* Phân trang */}
            <div>
                <button onClick={handlePrevPage} disabled={page === 0}>
                    Trang trước
                </button>
                <span> Trang {page + 1} / {totalPages} </span>
                <button onClick={handleNextPage} disabled={page === totalPages - 1}>
                    Trang sau
                </button>
            </div>
        </div>
    );
}
