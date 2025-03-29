import { useEffect, useState } from "react";
import { Table, Button, message, Form, Input, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import "./ClassroomTable.css";

const CourseTable = () => {
  const [dataSource, setDataSource] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm] = Form.useForm();
  const userId = localStorage.getItem("userid");
  const navigate = useNavigate();

  // Fetch courses from the backend
  useEffect(() => {
    if (!userId) return;

    axios.get("http://localhost:8081/classrooms", {
      params: { userId }
    })
      .then((response) => {
        const formattedData = response.data.map(classroom => ({
          key: classroom.id,
          id: classroom.id,
          title: classroom.classname,
          subject: classroom.subject,
          description: classroom.description,
        }));
        setDataSource(formattedData);
      })
      .catch((error) => {
        message.error("Failed to load courses");
        console.error("Error:", error);
      });
  }, [userId]);

  const handleEdit = (record) => {
    editForm.setFieldsValue({
      title: record.title,
      subject: record.subject,
      description: record.description
    });
    setEditingRow(record.key);
  };

  const onCancelEdit = () => {
    setEditingRow(null);
  };

  const onSaveEdit = async (key) => {
    try {
      const row = await editForm.validateFields();
      const updatedData = {
        classname: row.title,
        subject: row.subject,
        description: row.description
      };

      await axios.put(`http://localhost:8081/classrooms/${key}`, updatedData);

      setDataSource(prev => prev.map(item => {
        if (item.key === key) {
          return {
            ...item,
            ...row,
            title: row.title
          };
        }
        return item;
      }));

      message.success("Classroom updated successfully!");
      setEditingRow(null);
    } catch (error) {
      message.error("Failed to update classroom");
      console.error("Error:", error);
    }
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`http://localhost:8081/classrooms/${record.key}`);
      setDataSource((prev) => prev.filter(course => course.key !== record.key));
      message.success("Course deleted successfully!");
    } catch {
      message.error("Failed to delete course.");
    }
  };

  const handleRowClick = (record) => {
    if (editingRow) {
      return; // Prevent navigation if editing
    }
    navigate(`/classrooms/${record.id}`);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Class Name",
      dataIndex: "title",
      key: "classname",
      render: (text, record) => {
        if (editingRow === record.key) {
          return (
            <Form.Item name="title" rules={[{ required: true, message: 'Class name is required' }]}>
              <Input />
            </Form.Item>
          );
        }
        return (
          <Link
            to={`/classrooms/${record.id}`}
            className="classroom-link"
            onClick={(e) => editingRow && e.preventDefault()}
          >
            {text}
          </Link>
        );
      }
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text, record) => {
        if (editingRow === record.key) {
          return (
            <Form.Item name="subject">
              <Input />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text, record) => {
        if (editingRow === record.key) {
          return (
            <Form.Item name="description">
              <Input.TextArea />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        if (editingRow === record.key) {
          return (
            <span>
              <Space size="middle">
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveEdit(record.key);
                  }}
                >
                  Save
                </Button>
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelEdit();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </span>
          );
        }
        return (
          <span>
            <Space size="middle">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(record);
                }}
                disabled={editingRow !== null}
              >
                Edit
              </Button>
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record);
                }}
                disabled={editingRow !== null}
              >
                Delete
              </Button>
            </Space>
          </span>
        );
      },
    },
  ];

  return (
    <div className="table-wrapper">
      <Form form={editForm} component={false}>
        <Table
          size="large"
          dataSource={dataSource}
          columns={columns}
          pagination={{ position: ["bottomLeft"] }}
          rowClassName={() => "editable-row"}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </Form>
    </div>
  );
};

export default CourseTable;