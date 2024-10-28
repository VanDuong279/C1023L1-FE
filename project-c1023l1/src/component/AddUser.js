import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { checkUsernameExists, saveEmployeeToAPI } from "../service/UserService";
import { storage } from "../firebaseConfig/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddEmployeeForm() {
    const [url, setUrl] = useState(""); // URL của ảnh sau khi upload
    const navigate = useNavigate();
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Im5ndXllbmRpbmhoYXVhY2U4Iiwic3ViIjoibmd1eWVuZGluaGhhdWFjZTgiLCJleHAiOjIwOTAwOTI0MDd9.4YrsRllD5jUSUhNhmpA6QjeP777BIjMwkCQwmmojKfg'; // Thay thế bằng token của bạn

    const initialValues = {
        username: "",
        fullName: "",
        address: "",
        numberphone: "",
        gender: "", // Gender là chuỗi
        birthday: "",
        salary: 0,
        roleId: "1", // Role chưa chọn
        password: "",
        email: "",
        imgUrl: "", // Thêm trường imgUrl
    };

    const validateEmployee = {
        fullName: Yup.string().required("Tên là bắt buộc."),
        address: Yup.string().required("Địa chỉ là bắt buộc."),
        numberphone: Yup.string().required("Số điện thoại là bắt buộc."),
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
        email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc."),
        salary: Yup.number()
            .min(0, "Lương phải lớn hơn 0.")
            .required("Lương là bắt buộc.")
            .test(
                "is-multiple-of-100000",
                "Lương phải là bội số của 100.000 VND.",
                (value) => value % 100000 === 0 // Kiểm tra nếu lương là bội số của 100.000
            ),        roleId: Yup.string()
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
        navigate("/users");
    };

    const handleSubmitEmployee = async (values) => {
        try {
            await saveEmployeeToAPI(values, token);
            navigate("/users");
        } catch (error) {
            console.error("Có lỗi xảy ra khi lưu nhân viên.", error);
        }
    };

    return (
        <div className="update-employee-container">
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmitEmployee}
                validationSchema={Yup.object(validateEmployee)}
            >
                {({ setFieldValue }) => (
                    <Form>
                        <h1>Thêm mới Nhân Viên</h1>

                        <div>
                            <label>Tên Đầy Đủ:</label>
                            <Field name="fullName" />
                            <ErrorMessage name="fullName" component="span" />
                        </div>

                        <div>
                            <label>Địa Chỉ:</label>
                            <Field name="address" />
                            <ErrorMessage name="address" component="span" />
                        </div>

                        <div>
                            <label>Ngày Sinh:</label>
                            <Field name="birthday" type="date" />
                            <ErrorMessage name="birthday" component="span" />
                        </div>

                        <div>
                            <label>Số Điện Thoại:</label>
                            <Field name="numberphone" />
                            <ErrorMessage name="numberphone" component="span" />
                        </div>

                        <div>
                            <label>Tên Đăng Nhập:</label>
                            <Field name="username" />
                            <ErrorMessage name="username" component="span" />
                        </div>

                        <div>
                            <label>Mật Khẩu:</label>
                            <Field name="password" type="password" />
                            <ErrorMessage name="password" component="span" />
                        </div>

                        <div>
                            <label>Email:</label>
                            <Field name="email" />
                            <ErrorMessage name="email" component="span" />
                        </div>

                        <div>
                            <label>Lương:</label>
                            <Field name="salary" type="number" />
                            <ErrorMessage name="salary" component="span" />
                        </div>

                        <div>
                            <label>Giới Tính:</label>
                            <div>
                                <label>
                                    <Field type="radio" name="gender" value="true" />
                                    Nam
                                </label>
                                <label>
                                    <Field type="radio" name="gender" value="false" />
                                    Nữ
                                </label>
                                <ErrorMessage name="gender" component="span" />
                            </div>
                        </div>


                        <div>
                            <label>Ảnh:</label>
                            <input type="file" onChange={(e) => handleImageChange(e, setFieldValue)} />
                            {url && <img src={url} alt="Uploaded" width="100" />}
                        </div>

                        <div>
                            <label>Quyền:</label>
                            <Field name="roleId" as="select">
                                <option value="1">Nhân viên</option>
                                <option value="2">Admin</option>
                            </Field>
                            <ErrorMessage name="roleId" component="span" />
                        </div>

                        <div>
                            <button type="submit">Thêm mới</button>
                        </div>

                        <div>
                            <button type="button" onClick={handleBack}>Trở về</button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
