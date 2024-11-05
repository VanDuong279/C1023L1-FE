import React, {useState} from "react";
import {Formik, Field, Form, ErrorMessage} from "formik";
import * as Yup from "yup";
import {useNavigate} from "react-router-dom";
import {checkNumberphoneExists, checkEmailExists, checkUsernameExists, saveEmployeeToAPI,} from "../service/UserService";
import {storage} from "../firebaseConfig/firebase";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import addStyle from '../css/UserAdd.module.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal, Button } from "react-bootstrap"; // Import Modal và Button từ Bootstrap

export default function AddEmployeeForm() {
    const [url, setUrl] = useState(""); // URL của ảnh sau khi upload
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false); // State để điều khiển modal
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImhhdXZpcCIsInN1YiI6ImhhdXZpcCIsImV4cCI6MjA5MDczODU3Mn0.uV13KM04jTu96mzVxIpq6aUky2Swk-cSY-Glm1Qt--E'; // Thay thế bằng token của bạn

    const initialValues = {
        username: "",
        fullName: "",
        address: "",
        numberphone: "",
        gender: "", // Gender là chuỗi
        birthday: "",
        salary: "",
        roleId: "1", // Role chưa chọn
        password: "",
        email: "",
        imgUrl: "", // Thêm trường imgUrl
    };

    const validateEmployee = {
        fullName: Yup.string().required("Tên là bắt buộc.")
            .max(50,"Tên đăng nhập chỉ chứa 50 ký tự "),
        address: Yup.string().required("Địa chỉ là bắt buộc.")
            .max(50,"Địa chỉ chứa 50 ký tự "),

        numberphone: Yup.string().required("Số điện thoại là bắt buộc.")
            .matches(/^0\d{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số.")
            .test("is-unique", "số điện thoaại đã tồn tại.", async (value) => {
                if (!value) return true; // Nếu không có email, không cần kiểm tra
                const numberphoneExists = await checkNumberphoneExists(value, token);
                return !numberphoneExists;
            }),// Kiểm tra nếu sđt đã tồn tại,
        username: Yup.string()
            .required("Tên đăng nhập là bắt buộc.")
            .min(6, "Tên đăng nhập phải lớn hơn 6 kí tự.")
            .matches(/^[^\d]/, "Tên đăng nhập không được bắt đầu bằng số.")
            .notOneOf(["admin", "root"], "Tên đăng nhập không được là 'admin' hoặc 'root'.")
            .test("is-unique", "Tên đăng nhập đã tồn tại.", async (value) => {
                if (!value) return true;
                const exists = await checkUsernameExists(value, token);
                return !exists;
            }),

        password: Yup.string().required("Mật khẩu là bắt buộc."),
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Email là bắt buộc.")
            .test("is-unique", "Email đã tồn tại.", async (value) => {
        if (!value) return true; // Nếu không có email, không cần kiểm tra
        const emailExists = await checkEmailExists(value, token);
        return !emailExists; // Kiểm tra nếu email đã tồn tại
    }),
        salary: Yup.number()
            .min(0, "Lương phải lớn hơn 0.")
            .required("Lương là bắt buộc.")
            .test(
                "is-multiple-of-100000",
                "Lương phải là bội số của 100.000 VND.",
                (value) => value % 100000 === 0 // Kiểm tra nếu lương là bội số của 100.000
            ), roleId: Yup.string()
            .required("Quyền là bắt buộc.")
            .oneOf(["1", "2"], "Vui lòng chọn quyền hợp lệ.")
            .default("1"),
    };

    const handleUpload = async (file, setFieldValue) => {
        const storageRef = ref(storage, `images/${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setFieldValue("imgUrl", downloadURL);
            setUrl(downloadURL);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    const handleImageChange = (e, setFieldValue) => {
        const file = e.target.files[0];
        if (file) {
            handleUpload(file, setFieldValue);
        }
    };

    const handleBack = () => {
        navigate("/admin/users");
    };

    const handleSubmitEmployee = async (values) => {
        console.log("Submitting employee data:", values); // Log dữ liệu của nhân viên
        try {
            await saveEmployeeToAPI(values, token);
            navigate("/admin/users");
        } catch (error) {
            console.error("Có lỗi xảy ra khi lưu nhân viên.", error);
        }
    };
    // Hàm mở Modal
    const handleOpenModal = () => {
        setShowModal(true);
    };

    // Hàm đóng Modal
    const handleCloseModal = () => {
        setShowModal(false);
    };
    return (
        <div className={addStyle.wrapper}>
            <div className={addStyle['form-container']}>
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmitEmployee}
                    validationSchema={Yup.object(validateEmployee)}
                >
                    {({setFieldValue,handleSubmit}) => (
                        <Form>
                            <h4 className={addStyle['title']}>Thêm mới Nhân Viên</h4>

                            <div className={addStyle['form-group']}>
                                <label htmlFor="fullname">Họ và tên:<span className={addStyle['required']}>*</span ></label>
                                <Field className={addStyle.inputField} name="fullName"/>
                            </div>
                            <ErrorMessage name="fullName" component="span" className={addStyle['error-message']}/>


                            <div className={addStyle['form-group']}>
                                <label htmlFor="address">Địa chỉ:<span className={addStyle['required']}>*</span></label>
                                <Field className={addStyle.inputField} name="address"/>
                            </div>
                            <ErrorMessage name="address" component="span" className={addStyle['error-message']}/>


                            <div className={addStyle['form-group']}>
                                <label>Ngày Sinh:</label>
                                <Field className={addStyle.inputField} name="birthday" type="date"/>
                            </div>
                            <ErrorMessage name="birthday" component="span" className={addStyle['error-message']}/>

                            <div className={addStyle['form-group']}>
                                <label>Số Điện Thoại:</label>
                                <Field className={addStyle.inputField} name="numberphone"/>
                            </div>
                            <ErrorMessage name="numberphone" component="span" className={addStyle['error-message']}/>


                            <div className={addStyle['form-group']}>
                                <label htmlFor="username">Tên tài khoản:<span className={addStyle['required']}>*</span></label>
                                <Field className={addStyle.inputField} name="username"/>
                            </div>
                            <ErrorMessage name="username" component="span" className={addStyle['error-message']}/>

                            <div className={addStyle['form-group']}>
                                <label htmlFor="password">Mật khẩu:<span className={addStyle['required']}>*</span></label>
                                <Field className={addStyle.inputField} name="password" type="password"/>
                            </div>
                            <ErrorMessage name="password" component="span" className={addStyle['error-message']}/>

                            <div className={addStyle['form-group']}>
                                <label>Email:</label>
                                <Field className={addStyle.inputField} name="email"/>
                            </div>
                            <ErrorMessage name="email" component="span" className={addStyle['error-message']}/>

                            <div className={addStyle['form-group']}>
                                <label htmlFor="salary">Lương:<span className={addStyle['required']}>*</span></label>
                                <Field className={addStyle.inputField} name="salary" type="number"/>
                            </div>
                            <ErrorMessage name="salary" component="span" className={addStyle['error-message']}/>

                            <div className={addStyle['form-group']}>
                                <label className={addStyle['gender-label']}>Giới Tính:</label>
                                <div className={addStyle['gender-options']}>
                                    <label className={addStyle['gender-label']}>
                                        <Field type="radio" name="gender" value="true"/>
                                        Nam
                                    </label>
                                    <label className={addStyle['gender-label']}>
                                        <Field type="radio" name="gender"
                                               value="false"/>
                                        Nữ
                                    </label>
                                </div>
                            </div>
                            <ErrorMessage name="gender" component="span" className={addStyle['error-message']}/>


                            <div className={addStyle['form-group']}>
                                <label htmlFor="image" className={addStyle.label1}>
                                    <i className={`fas fa-image ${addStyle.icon}`}></i> {/* Icon hình ảnh */}
                                    Ảnh:
                                </label>
                                <input
                                    className={addStyle.inputField}
                                    type="file"
                                    id="image"
                                    onChange={(e) => handleImageChange(e, setFieldValue)}
                                    style={{ display: 'none' }} // Ẩn ô input gốc
                                />
                                <div
                                    className={addStyle.uploadIcon}
                                    onClick={() => document.getElementById('image').click()} // Khi click vào icon, gọi ô input
                                >
                                    <i className={`fas fa-upload ${addStyle.uploadButtonIcon}`}></i> {/* Icon upload */}
                                    <span className={addStyle.uploadText}>Upload Ảnh</span>
                                </div>
                            </div>
                            {url && <img src={url} alt="Uploaded" className={addStyle.previewImage} />}


                            <div className={addStyle['form-group']}>
                                <label htmlFor="position">Vị trí:<span className={addStyle['required']}>*</span></label>
                                <Field className={addStyle.inputField} name="roleId" as="select">
                                    <option value="1">Nhân viên</option>
                                    <option value="2">Admin</option>
                                </Field>
                            </div>
                            <ErrorMessage name="roleId" component="span" className={addStyle['error-message']}/>

                            <div className="d-flex justify-content-between">
                                <div>
                                    <button className={addStyle['cancel-button']} type="button" onClick={handleBack}>Cancel</button>
                                </div>
                                <div>
                                    <button type="button" onClick={handleOpenModal} className="btn btn-secondary" style={{ border: "none", borderRadius: "50px", backgroundColor: "#bd965f" }}>Continue <i className="bi bi-arrow-right"></i></button>
                                </div>
                            </div>
                            {/* Modal */}
                            <Modal show={showModal} onHide={handleCloseModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Xác nhận thêm nhân viên</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Bạn có chắc chắn muốn thêm nhân viên mới này không?</Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleCloseModal}>Hủy</Button>
                                    <Button variant="primary" onClick={() => {
                                        handleSubmit(); // Thêm nhân viên
                                        handleCloseModal(); // Đóng modal sau khi thêm
                                    }}>
                                        Xác nhận
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </Form>
                    )}
                </Formik>

            </div>
        </div>
    );
}
// <div className={styleDashBoard.wrapper}>
//     <div className={styleDashBoard['dashboard-container']}>
//         <div className={styleDashBoard['row-left']}>
//
//         </div>
//         <div className={styleDashBoard['header']}>
//             <div className={styleDashBoard.nav}>nav nhỏ</div>
//         </div>
//         <div className={styleDashBoard['row-right']}>Row Right</div>
//     </div>
//     <div className={styleDashBoard['footer']}>Footer</div>
// </div>