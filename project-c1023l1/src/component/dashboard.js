
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";
import styles from "../css/dashboard.module.css";
import backRound from "../img/backrounddashboard.jpg";

function Dashboard({ setResetList }) {
    const [isEmployeeMenuOpen, setEmployeeMenuOpen] = useState(false);
    const [isProductMenuOpen, setProductMenuOpen] = useState(false);
    const [isInitialContent, setIsInitialContent] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavClick = (path) => {
        setResetList(true);
        setIsInitialContent(false);
        navigate(path, { replace: true });
    };

    useEffect(() => {
        if (location.pathname !== "/admin") {
            setIsInitialContent(false);
        } else {
            setIsInitialContent(true);
        }
    }, [location.pathname]);

    const toggleEmployeeMenu = () => {
        setEmployeeMenuOpen(!isEmployeeMenuOpen);
    };

    const handleEmployeeInfoClick = () => {
        handleNavClick("/admin/users");
    };

    const toggleProductMenu = () => {
        setProductMenuOpen(!isProductMenuOpen);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar Left */}
                <div className={`col-auto col-md-3 col-xl-2 px-sm-2 px-0 ${styles.sidebar}`}>
                    <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 min-vh-100">
                        <div className={styles['dash-b']}>
                            <a href="/" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-decoration-none">
                                <span className={styles['sm-inline']}>
                                    <i className="fa-solid fa-briefcase" style={{ padding: "10px" }}></i>
                                    DASHMIN
                                </span>
                            </a>
                        </div>
                        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start">
                            <li className={styles['nav-item']}>
                                <div className={styles['nav-content']}>
                                    <a onClick={toggleEmployeeMenu} className={`${styles.navLink} nav-link px-0 align-middle`}>
                                        <i className={`${styles.icon2} fas fa-users`}></i>
                                        <span className="ms-1 d-none d-sm-inline">Quản lý Nhân viên</span>
                                    </a>
                                </div>
                                <div className={styles['divider']}></div>
                                {isEmployeeMenuOpen && (
                                    <ul className="nav flex-column ms-1">
                                        <li>
                                            <div className={styles['nav-content']}>
                                                <NavLink
                                                    to="users"
                                                    className={styles['nav-link']}
                                                    onClick={handleEmployeeInfoClick}
                                                    style={{ paddingLeft: "40px", paddingBottom: "20px", paddingTop: "20px" }}
                                                >
                                                    Thông tin Nhân viên
                                                </NavLink>
                                            </div>
                                            <div className={styles['divider1']}></div>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li className={styles['nav-item']}>
                                <div className={styles['nav-content']}>
                                    <a className={`${styles.navLink} nav-link px-0 align-middle`}>
                                        <i className={`${styles.icon2} fa-solid fa-mug-saucer`}></i>
                                        <span className="ms-1 d-none d-sm-inline">Quản lý Sản phẩm</span>
                                    </a>
                                </div>
                                <div className={styles['divider']}></div>

                            </li>
                            <li className={styles['nav-item']}>
                                <div className={styles['nav-content']}>
                                    <a className={`${styles.navLink} nav-link px-0 align-middle`}>
                                        <i className={`${styles.icon2} fa-solid fa-money-bill-wheat`}></i>
                                        <span className="ms-1 d-none d-sm-inline">Quản lý Hóa Đơn</span>
                                    </a>
                                </div>
                                <div className={styles['divider']}></div>

                            </li>
                            <li className={styles['nav-item']}>
                                <div className={styles['nav-content']}>
                                    <a className={`${styles.navLink} nav-link px-0 align-middle`}>
                                        <i className={`${styles.icon2} fa-solid fa-comments-dollar`}></i>
                                        <span className="ms-1 d-none d-sm-inline">Quản lý Phản Hồi</span>
                                    </a>
                                </div>
                                <div className={styles['divider']}></div>

                            </li>
                            <li className={styles['nav-item']}>
                                <div className={styles['nav-content']}>
                                    <a  className={`${styles.navLink} nav-link px-0 align-middle`}>
                                        <i className={`${styles.icon2} fas fa-chart-line`}></i>
                                        <span className="ms-1 d-none d-sm-inline">Thống kê</span>
                                    </a>
                                </div>
                                <div className={styles['divider']}></div>

                            </li>
                            <li className={styles['nav-item']}>
                                <div className={styles['nav-content']}>
                                    <a  className={`${styles.navLink} nav-link px-0 align-middle`}>
                                        <i className={`${styles.icon2} fa-solid fa-tablet`}></i>
                                        <span className="ms-1 d-none d-sm-inline">Quản lý bàn</span>
                                    </a>
                                </div>
                                <div className={styles['divider']}></div>

                            </li>
                            <li className={styles['nav-item']}>
                                <div className={styles['nav-content']}>
                                    <a  className={`${styles.navLink} nav-link px-0 align-middle`}>
                                        <i className={`${styles.icon2} fa-solid fa-question`} style={{padding:"5px"}}></i>
                                        <span className="ms-1 d-none d-sm-inline">Help</span>
                                    </a>
                                </div>
                                {/*<div className={styles['divider']}></div>*/}

                            </li>                        </ul>
                    </div>
                </div>

                {/* Main content area */}
                <div className="col">
                    <header className={styles.headerContainer}>
                        <h2 className={styles.headerTitle}>Welcome to Admin Dashboard</h2>
                        <div className={styles.headerIcons}>
                            <FaEnvelope className={styles.headerIcon} title="Messages" style={{ color: "black" }} />
                            <span>Messages</span><i className="fa-solid fa-chevron-down"></i>
                            <FaBell className={styles.headerIcon} title="Notifications" style={{ color: "black" }} />
                            <span>Notifications</span><i className="fa-solid fa-chevron-down"></i>
                            <FaUserCircle className={styles.headerIcon} title="Profile" style={{ color: "black" }} />
                            <span>Tên Đăng Nhập</span>
                            <img
                                src="https://via.placeholder.com/40"
                                alt="User Avatar"
                                className={styles.headerAvatar}
                                title="User Avatar"
                            />
                        </div>
                    </header>

                    {/* Content Row Right (for main content) */}
                    <div className="p-4">
                        {/* Render nội dung route con tại đây */}
                        {isInitialContent ? (
                            <img src={backRound} alt="Initial Content" /> // Sử dụng ảnh từ thư mục img
                        ) : (
                            <Outlet /> // Thay bằng nội dung khác khi nhấn các menu
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className={`col-auto col-md-2 col-xl-1 px-sm-2 px-0 ${styles.rightSidebar}`}>
                </div>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>© 2024 Company Name. All Rights Reserved.</p>
                <p>Contact us at support@nguyendinhhauace@gmail.com | Phone: +84 336 215 616 </p>
            </footer>
        </div>
    );
}

export default Dashboard;

