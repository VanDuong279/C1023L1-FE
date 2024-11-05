import './App.css';
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./component/dashboard"; // Import component Dashboard
import ListUser from "./component/ListUser"; // Import danh sách người dùng
import CreateEmployee from "./component/AddUser"; // Import form thêm mới
import UpdateUser from "./component/UpdateUser";
import {ToastContainer} from "react-toastify";
import UserList from "./component/ListUser";
import {useState} from "react";
function App() {
    const [resetList, setResetList] = useState(false); // Định nghĩa ở đây
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Navigate to="/admin" />} />
                <Route path="/admin" element={<Dashboard setResetList={setResetList} />}>
                    <Route path="users" element={<UserList resetList={resetList} setResetList={setResetList} />} />
                    <Route path="users/add" element={<CreateEmployee />} /> {/* Route cho form thêm mới */}
                    <Route path="users/update/:userId" element={<UpdateUser />} />
                </Route>
            </Routes>
            <ToastContainer></ToastContainer>

        </div>
    );
}

export default App;
