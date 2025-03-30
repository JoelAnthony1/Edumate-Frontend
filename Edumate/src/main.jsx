import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import ErrorPage from "./components/error/ErrorPage";
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import Register from "./components/register/Register"; 
import ClassroomDetail from "./components/Classroom/ClassroomDetails";
import AssignmentDetail from './components/Assignments/AssignmentDetails';
import StudentDetails from './components/Students/StudentDetails';
import StudentList from './components/Classroom/StudentList';
import "./index.css";

// Import the compatibility package
import '@ant-design/v5-patch-for-react-19';
import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';

// Set the custom render method
unstableSetRender((node, container) => {
  const root = createRoot(container);
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

// Render the application
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<ErrorPage />} />
          <Route path="/classrooms/:id" element={<ClassroomDetail />} />
          <Route path="/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/classrooms/:classroomId/students" element={<StudentList />} />
          <Route path="/classrooms/:classroomId/students/:studentId" element={<StudentDetails />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
