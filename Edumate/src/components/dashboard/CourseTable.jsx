import { Table, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./CourseTable.css";

const CourseTable = () => {
  const dataSource = [
    { key: "1", title: "Google UX Design", date: "2023-02-20", enrolled: 30 },
    { key: "2", title: "React Fundamentals", date: "2023-03-10", enrolled: 45 },
    { key: "3", title: "Spring Boot Backend", date: "2023-04-15", enrolled: 25 },
  ];

  const handleEdit = (record) => {
    console.log("Edit:", record);
  };

  const handleDelete = (record) => {
    console.log("Delete:", record);
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
