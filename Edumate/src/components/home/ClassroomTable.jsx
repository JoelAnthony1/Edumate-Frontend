import { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "./ClassroomTable.css";

const CourseTable = () => {
  const [dataSource, setDataSource] = useState([]);

  // Fetch courses from the backend
  useEffect(() => {
    axios.get("http://localhost:8080/api/classrooms")
      .then((response) => setDataSource(response.data))
      .catch(() => message.error("Failed to load courses"));
  }, []);

  // Handle Edit (Not implemented yet)
  const handleEdit = (record) => {
    console.log("Edit:", record);
  };

  // Handle Delete (DELETE request to backend)
  const handleDelete = async (record) => {
    try {
      await axios.delete(`http://localhost:8080/api/courses/${record.key}`);
      setDataSource((prev) => prev.filter(course => course.key !== record.key));
      message.success("Course deleted successfully!");
    } catch {
      message.error("Failed to delete course.");
    }
  };

  const columns = [
    { title: "No", dataIndex: "key", key: "key" },
    { title: "Course Title", dataIndex: "title", key: "title" },
    { 
      title: "Date", 
      dataIndex: "date", 
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    },
    { title: "Enrolled Counts", dataIndex: "enrolled", key: "enrolled" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div className="table-wrapper">
      <Table size="large" dataSource={dataSource} columns={columns} pagination={{ position: ["bottomLeft"] }} />
    </div>
  );
};

export default CourseTable;
