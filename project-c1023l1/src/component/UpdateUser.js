import React, { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import {
    checkEmailExistsForUpdate, checkNumberPhonneExistsForUpdate,
    getUserById,
    updateUser
} from "../service/UserService"; // Import các hàm từ service
import { storage } from "../firebaseConfig/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {ToastContainer,toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import addStyle from "../css/UserAdd.module.css"; // Import CSS for Toastify
import { Modal, Button } from "react-bootstrap";


export default function UpdateUserForm() {
    const [user, setUser] = useState(null);
    const [url, setUrl] = useState("");
    const [initialUsername, setInitialUsername] = useState(""); // Thêm biến để lưu tên đăng nhập ban đầu
    const [password, setPassword] = useState(""); // Thêm biến để lưu mật khẩu
    const navigate = useNavigate();
    const { userId } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [formValues, setFormValues] = useState(null); // State to hold form values before submission
    const [initialEmail, setInitialEmail] = useState(""); // Thêm biến lưu email ban đầu
    const [initialNumberPhone, setinitialNumberPhone] = useState(""); // Thêm biến lưu email ban đầu

    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImhhdXZpcCIsInN1YiI6ImhhdXZpcCIsImV4cCI6MjA5MDczODU3Mn0.uV13KM04jTu96mzVxIpq6aUky2Swk-cSY-Glm1Qt--E';

    useEffect(() => {
        const fetchUser = async () => {
            const fetchedUser = await getUserById(userId, token);
            setUser(fetchedUser);
            setInitialUsername(fetchedUser.username); // Lưu tên đăng nhập ban đầu
            setUrl(fetchedUser.imgUrl);
            setInitialEmail(fetchedUser.email); // Lưu email ban đầu
            setinitialNumberPhone(fetchedUser.numberphone);

            // setPassword(fetchedUser.password); // Lưu mật khẩu vào state
        };

        fetchUser();
    }, [userId, token]);

    if (!user) return <div>Loading...</div>;

    const initialValues = {
        username: user.username,
        fullName: user.fullName,
        address: user.address,
        numberphone: user.numberphone,
        gender: user.gender === "true" || user.gender === true ? "true" : "false",
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        salary: user.salary,
        roleId: user.role.roleId.toString(),
        email: user.email,
        imgUrl: user.imgUrl,
        password: user.password, // Để lại trường mật khẩu trong initialValues
    };
    // Giả lập hàm kiểm tra email đã tồn tại
    const isEmailTaken = async (email) => {
        // Giả định kiểm tra email đã tồn tại từ API (thay thế bằng API thực tế)
        const exists = await checkEmailExistsForUpdate(email);
        return exists;
    };
    const isNumberPhoneTaken = async (numberphone) => {
        // Giả định kiểm tra email đã tồn tại từ API (thay thế bằng API thực tế)
        const exists = await checkNumberPhonneExistsForUpdate(numberphone);
        return exists;
    };
    const validateEmployee = {
        fullName: Yup.string().required("Tên là bắt buộc.")
            .max(50,"Tên đăng nhập chỉ chứa 50 ký tự "),
        address: Yup.string().required("Địa chỉ là bắt buộc.")
            .max(50,"Địa chỉ chứa 50 ký tự "),

        numberphone: Yup.string().required("Số điện thoại là bắt buộc.")
            .matches(/^0\d{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số.")
        .test("is-same-email", "số điện thoại đã tồn tại", (value) => {
            // Nếu email không thay đổi thì bỏ qua kiểm tra
            return value === initialNumberPhone || !isNumberPhoneTaken(value);
        }),

        password: Yup.string().required("Mật khẩu là bắt buộc."),
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Email là bắt buộc.")
            .test("is-same-email", "Email đã tồn tại", (value) => {
                // Nếu email không thay đổi thì bỏ qua kiểm tra
                return value === initialEmail || !isEmailTaken(value);
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

    const handleSubmitUser = async (values) => {
        try {
            console.log("Submitting values: ", values); // Kiểm tra giá trị submit
            const adjustedValues = {
                ...values,
                roleId: Number(values.roleId),
                gender: values.gender === "true" ? true : false,
                birthday: new Date(values.birthday).toISOString().split("T")[0],
            };

            // Để lại trường mật khẩu trong adjustedValues nếu nó không rỗng
            if (password) {
                adjustedValues.password = password;
            }

            await updateUser(userId, adjustedValues, token);
            console.log("Update successful, now fetching user list...");
            toast.success("Cập nhật người dùng thành công!"); // Hiển thị toast thành công
            navigate("/admin/users");
        } catch (error) {
            console.error("Có lỗi xảy ra khi cập nhật người dùng.", error.response?.data || error.message);
            toast.error("Cập nhật không thành công! Vui lòng thử lại."); // Hiển thị toast lỗi

        }
    };
    const handleBack = () => {
        navigate("/admin/users");    };

    const handleOpenModal = (values) => {
        setFormValues(values); // Lưu các giá trị form hiện tại vào state
        setShowModal(true);
    };    const handleCloseModal = () => setShowModal(false);
    const handleConfirmSubmit = async () => {
        await handleSubmitUser(formValues); // Gọi hàm submit với các giá trị đã lưu
        handleCloseModal();
    };

    return (
        <div className={addStyle.wrapper}>
            <div className={addStyle['form-container']}>

            <Formik
                initialValues={initialValues}
                onSubmit={handleOpenModal}
                validationSchema={Yup.object(validateEmployee)}
                enableReinitialize
            >
                {({ setFieldValue,handleSubmit , values }) => (
                    <Form>
                        <h4 className={addStyle['title']}>Chỉnh sửa Nhân Viên</h4>

                        {/* Các trường thông tin người dùng */}
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
                            <Field className={addStyle.inputField} name="username" readOnly/>
                        </div>
                        <ErrorMessage name="username" component="span" className={addStyle['error-message']}/>

                        <div className={addStyle['form-group']}>
                            <label htmlFor="password">Mật khẩu:<span className={addStyle['required']}>*</span></label>
                            <Field className={addStyle.inputField} name="password" type="password" readOnly/>
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
                                <span >Upload Ảnh</span>
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
                                <button type="submit" onClick={handleOpenModal} className="btn btn-secondary" style={{border:"none",borderRadius:"50px",backgroundColor:"#bd965f"}}>Continue <i className="bi bi-arrow-right"></i></button>
                            </div>


                        </div>
                        <Modal show={showModal} onHide={handleCloseModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Xác Nhận Cập Nhật</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>Bạn có chắc chắn muốn cập nhật thông tin này không?</Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Hủy
                                </Button>
                                <Button variant="primary" onClick={handleConfirmSubmit}>
                                    Cập nhật
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
