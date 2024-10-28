import logo from './logo.svg';
import './App.css';
import ListUser from "./component/ListUser";
import {NavLink, Route, Routes} from "react-router-dom";
import CreateEmployee from "./component/AddUser";
import UpdateUserForm from "./component/UpdateUser";
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify";
import React, {useState} from "react"; // Import CSS for Toastify


function App() {
    const [resetList, setResetList] = useState(false);
    const handleResetList = () => {
        setResetList(true);
    };
  return (
      <div className="App">
        <nav>
          <NavLink to="/users" onClick={handleResetList}>Danh sách users</NavLink>
          <NavLink to="/users/add">Create</NavLink>

        </nav>
        <Routes>
          <Route path="/users" element={<ListUser resetList={resetList} setResetList={setResetList}/>}></Route>
          <Route path="/users/add" element={<CreateEmployee/>}></Route>
            <Route path="/users/update/:userId" element={<UpdateUserForm />} /> {/* Route cho trang cập nhật */}

        </Routes>
          <ToastContainer /> {/* Thêm ToastContainer */}

      </div>
  );
}
export default App;
