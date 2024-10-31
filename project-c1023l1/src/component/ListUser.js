import React, {useEffect, useState} from "react";
import {deleteUser, getUsers, searchUsers} from "../service/UserService";
import {Link} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import '@fortawesome/fontawesome-free/css/all.min.css';
import style from '../css/UserList.module.css';
import { Modal, Button } from 'react-bootstrap'; // Import Modal and Button from react-bootstrap


export default function UserList({resetList, setResetList}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false); // State điều khiển hiển thị modal
    const [selectedUser, setSelectedUser] = useState(null); // State cho người dùng đã chọn
    // Thêm trạng thái cho modal xác nhận xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Các biến state cho tìm kiếm
    const [userName, setUserName] = useState("");
    const [fullName, setFullName] = useState("");
    const [numberPhone, setNumberPhone] = useState("");
    const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm kiếm

    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFiYzEyMyIsInN1YiI6ImFiYzEyMyIsImV4cCI6MjA5MDM4ODk2NX0.Na6Tav_y8QJ1cgt4ctM15DonOUISPKXscP_R52z4bVw';
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


    const handleDelete = async () => {
        try {
            await deleteUser(userToDelete.userId, token);
            setShowDeleteModal(false); // Đóng modal sau khi xóa
            fetchData(); // Cập nhật danh sách người dùng sau khi xóa
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };
    // Mở modal xác nhận xóa
    const confirmDelete = (user) => {
        setUserToDelete(user); // Gán người dùng cần xóa vào state
        setShowDeleteModal(true); // Hiển thị modal xác nhận xóa
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false); // Đóng modal xác nhận
        setUserToDelete(null); // Đặt lại người dùng cần xóa
    };
    // Hàm sắp xếp theo tên tài khoản
    const sortedUsers = [...users].sort((a, b) => a.username.localeCompare(b.username));
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
    const handleShowModal = (user) => {
        setSelectedUser(user); // Gán người dùng đã chọn vào state
        setShowModal(true); // Hiển thị modal
    };
    const handleCloseModal = () => {
        setShowModal(false); // Ẩn modal
        setSelectedUser(null); // Đặt lại người dùng đã chọn
    };
    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={style['page-background']}>
            <div className="container">

                <h3 className={style['text-left']}>Danh Sách Người Dùng</h3>
                <div className={style['content-wrapper']}>

                    {/* Bao bọc phần tìm kiếm và bảng trong div với class container */}
                    {/* Form tìm kiếm */}
                    <div className={style['form-container']}>
                        <div className={style['form-inline']}>
                            <label className={style['form-label']}>Tên tài khoản</label>
                            <input
                                className="form-control form-control-sm"                                type="text"
                                placeholder="Tên đăng nhập"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <label className={style['form-label']}>Họ và tên</label>
                            <input
                                className="form-control form-control-sm"                                type="text"
                                placeholder="Họ và tên"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            <label className={style['form-label']}>Số điện thoại</label>
                            <input
                                className="form-control form-control-sm"                                type="text"
                                placeholder="Số điện thoại"
                                value={numberPhone}
                                onChange={(e) => setNumberPhone(e.target.value)}
                            />
                            <button className={style['btn-search']} onClick={handleSearch}>
                                <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
                            </button>

                        </div>
                    </div>

                    {users.length > 0 ? (
                        <>
                            <div className="container-table">
                                <div className={style['add-button-container']}>
                                    <Link to="/users/add" className={style['btn-add']}>
                                        <i className="fa-solid fa-user-plus"></i> Thêm mới nhân viên
                                    </Link>

                                </div>

                                <div className={style['table-container']}>
                                    <table className="table table-hover">
                                        <thead className="table-light">
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
                                        {sortedUsers.map((user, index) => (
                                            <tr key={user.userId}>
                                                <td>{index + 1 + page * 10}</td>
                                                <td>{user.username}</td>
                                                <td>{user.fullName}</td>
                                                <td>{user.address}</td>
                                                <td>{user.numberphone}</td>
                                                <td>{user.gender ? "Nam" : "Nữ"}</td>
                                                <td>{new Date(user.birthday).toLocaleDateString()}</td>
                                                <td>{user.salary}</td>
                                                <td>{user.role.roleName==="ROLE_USER"?"Nhân viên":"Quản lý"}</td>
                                                <td>
                                                    <div className={style['action-buttons']}>
                                                        <button onClick={() => handleShowModal(user)} className="btn btn-sm btn-link">
                                                            <i className="fa-solid fa-eye" style={{ color: "#213250" }}></i>
                                                        </button>
                                                        <Link to={`/users/update/${user.userId}`} className="btn btn-sm btn-link">
                                                            <i className="fa-solid fa-pen-to-square" style={{ color: "#2286d0" }}></i>
                                                        </Link>
                                                        <button onClick={() => confirmDelete(user)} className="btn btn-sm btn-link delete">
                                                            <i className="fa-solid fa-trash" style={{ color: "#c01b39" }}></i>
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </>
                    ) : (
                        <p>Không có người dùng nào.</p>
                    )}
                    {/* Modal Chi Tiết */}
                    <Modal show={showModal} onHide={handleCloseModal} className={style['modal']}>
                        <Modal.Header closeButton className={style['modal-header']}>
                            <Modal.Title className={style['modal-title']}>Chi Tiết Người Dùng</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={style['modal-body']}>
                            {selectedUser ? (
                                <div>
                                    {/*{console.log("Image URL:", selectedUser.imgUrl)}*/}

                                    {selectedUser.imgUrl && selectedUser.imgUrl.trim() !== "" && selectedUser.imgUrl !== "https://firebasestorage.googleapis.com" ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                            <img
                                                src={selectedUser.imgUrl}
                                                alt="User Avatar"
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    borderRadius: '50%',
                                                    border: '2px solid #94beec'
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', marginTop: '10px', color: '#aaa' }}>
                                            {/*<p>Không có ảnh người dùng</p>*/}
                                        </div>
                                    )}

                                    <p><strong>Tên tài khoản:</strong> {selectedUser.username}</p>
                                    <p><strong>Họ và tên:</strong> {selectedUser.fullName}</p>
                                    <p><strong>Địa chỉ:</strong> {selectedUser.address}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedUser.numberphone}</p>
                                    <p><strong>Giới tính:</strong> {selectedUser.gender ? "Nam" : "Nữ"}</p>
                                    <p><strong>Ngày sinh:</strong> {new Date(selectedUser.birthday).toLocaleDateString()}</p>
                                    <p><strong>Lương:</strong> {selectedUser.salary}</p>
                                    <p><strong>Vị trí:</strong> {selectedUser.role.roleName === "ROLE_USER" ? "Nhân viên" : "Quản lý"}</p>
                                </div>
                            ) : null}
                        </Modal.Body>

                        <Modal.Footer className={style['modal-footer']}>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Đóng
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    {/* Modal xác nhận xóa */}
                    <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Xác Nhận Xóa</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Bạn có chắc chắn muốn xóa người dùng có tên tài khoản là {" "}
                            <strong>{userToDelete ? userToDelete.username : ""}</strong>?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDeleteModal}>
                                Hủy
                            </Button>
                            <Button variant="danger" onClick={handleDelete}>
                                Xóa
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Phân trang */}
                    <div className={style['pagination']}>
                        <span>Bạn đang ở trang </span>
                        <input
                            type="text"
                            value={page + 1}
                            onChange={(e) => {
                                const enteredPage = Number(e.target.value) - 1;
                                if (!isNaN(enteredPage) && enteredPage >= 0 && enteredPage < totalPages) {
                                    setPage(enteredPage);
                                }
                            }}
                        />
                        <span> / {totalPages}</span>

                        <button onClick={() => setPage(0)} disabled={page === 0}>
                            Trang đầu
                        </button>
                        <button onClick={handlePrevPage} disabled={page === 0}>
                            &laquo;
                        </button>
                        <button onClick={handleNextPage} disabled={page === totalPages - 1}>
                            &raquo;
                        </button>
                        <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}>
                            Trang cuối
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
