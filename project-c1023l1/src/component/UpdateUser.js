import React, { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { checkUsernameExists, getUserById, updateUser } from "../service/UserService"; // Import các hàm từ service
import { storage } from "../firebaseConfig/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {ToastContainer,toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toastify


export default function UpdateUserForm() {
    const [user, setUser] = useState(null);
    const [url, setUrl] = useState("");
    const [initialUsername, setInitialUsername] = useState(""); // Thêm biến để lưu tên đăng nhập ban đầu
    const [password, setPassword] = useState(""); // Thêm biến để lưu mật khẩu
    const navigate = useNavigate();
    const { userId } = useParams();
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Im5ndXllbmRpbmhoYXVhY2U4Iiwic3ViIjoibmd1eWVuZGluaGhhdWFjZTgiLCJleHAiOjIwOTAwOTI0MDd9.4YrsRllD5jUSUhNhmpA6QjeP777BIjMwkCQwmmojKfg';

    useEffect(() => {
        const fetchUser = async () => {
            const fetchedUser = await getUserById(userId, token);
            setUser(fetchedUser);
            setInitialUsername(fetchedUser.username); // Lưu tên đăng nhập ban đầu
            setUrl(fetchedUser.imgUrl);
            setPassword(fetchedUser.password); // Lưu mật khẩu vào state
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
                if (value === initialUsername) return true; // Không cần kiểm tra

                const exists = await checkUsernameExists(value, token);
                console.log("Checking username:", value, "Exists:", exists); // Debug log
                return !exists; // Trả về true nếu không tồn tại
            }),



        email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc."),
        salary: Yup.number()
            .min(0, "Lương phải lớn hơn 0.")
            .required("Lương là bắt buộc.")
            .test(
                "is-multiple-of-100000",
                "Lương phải là bội số của 100.000 VND.",
                (value) => value % 100000 === 0
            ),
        roleId: Yup.string()
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
            navigate("/users");
        } catch (error) {
            console.error("Có lỗi xảy ra khi cập nhật người dùng.", error.response?.data || error.message);
            toast.error("Cập nhật không thành công! Vui lòng thử lại."); // Hiển thị toast lỗi

        }
    };


    return (
        <div className="update-user-container">
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmitUser}
                validationSchema={Yup.object(validateEmployee)}
                enableReinitialize
            >
                {({ setFieldValue }) => (
                    <Form>
                        <h1>Cập nhật Người Dùng</h1>

                        {/* Các trường thông tin người dùng */}
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
                            <label>Mật khẩu:</label>
                            <Field name="password" type="password" />
                            <ErrorMessage name="password" component="span" />
                        </div>
                        <button type="submit">Cập nhật</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
