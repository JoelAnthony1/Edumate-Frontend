import { useState } from 'react';
import { Table, Space, Button, Empty, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import './StudentList.css';

const StudentList = ({ students = [], classroomId }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(students);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add new student
  const handleAdd = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8081/students', {
        name: values.name,
        // Add other fields if needed
      });
      
      // If you have a classroom-student association endpoint
      await axios.post(`http://localhost:8081/classrooms/${classroomId}/students/${response.data.id}`);
      
      setData([...data, response.data]);
      message.success('Student added successfully');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to add student');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // First remove from classroom if needed
      await axios.delete(`http://localhost:8081/classrooms/${classroomId}/students/${id}`);
      
      // Then delete the student
      await axios.delete(`http://localhost:8081/students/${id}`);
      
      setData(data.filter(student => student.id !== id));
      message.success('Student deleted successfully');
    } catch (error) {
      message.error('Failed to delete student');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            loading={loading}
          >
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="student-list-container">
      <div className="student-list-header">
        <h3>Students</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Student
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        loading={loading}
        locale={{
          emptyText: <Empty description="No students found" />
        }}
      />

      <Modal
        title="Add New Student"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="name"
            label="Student Name"
            rules={[{ required: true, message: 'Please enter student name' }]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              Add Student
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;