import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Space, Button, Empty, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import './StudentList.css';

const StudentList = () => {
  const { classroomId } = useParams();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock data fallback
  const mockStudents = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      progress: 75,
      assignments: [
        { id: '1', title: 'Math Homework', status: 'Submitted', grade: 'A' }
      ]
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      progress: 60,
      assignments: [
        { id: '1', title: 'Science Project', status: 'Pending', grade: '-' }
      ]
    }
  ];

  // Fetch students for the current classroom
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8081/classrooms/${classroomId}/students`);
        
        // Use API data if available, otherwise fallback to mock data
        setData(response.data?.length > 0 ? response.data : mockStudents);
      } catch (error) {
        message.error('Failed to load students. Using mock data instead.');
        console.error('API Error:', error);
        setData(mockStudents); // Fallback to mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classroomId]);

  // Add new student (with API call and mock fallback)
const handleAdd = async (values) => {
  try {
    setLoading(true);
    
    // Try real API first
    try {
      const response = await axios.post('http://localhost:8081/students', {
        name: values.name,
        email: `${values.name.replace(/\s+/g, '').toLowerCase()}@example.com`
      });
      
      // Associate with classroom
      await axios.post(`http://localhost:8081/classrooms/${classroomId}/students/${response.data.id}`);
      
      setData([...data, response.data]);
      message.success('Student added successfully');
      form.resetFields();
      setIsModalVisible(false);
      return;
    } catch (apiError) {
      console.warn('API failed, using mock implementation:', apiError);
    }

    // Fallback to mock implementation
    const newStudent = {
      id: `mock-${Date.now()}`,
      name: values.name,
      email: `${values.name.replace(/\s+/g, '').toLowerCase()}@example.com`,
      progress: 0,
      assignments: []
    };
    
    setData([...data, newStudent]);
    message.success('Student added (mock implementation)');
    form.resetFields();
    setIsModalVisible(false);
  } catch (error) {
    message.error('Failed to add student');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Edit student name (with API call and mock fallback)
const handleEdit = async (values) => {
  try {
    setLoading(true);
    
    // Try real API first
    try {
      await axios.put(`http://localhost:8081/students/${currentStudent.id}`, {
        name: values.name
      });
      
      setData(data.map(student => 
        student.id === currentStudent.id ? { ...student, name: values.name } : student
      ));
      message.success('Student updated successfully');
      setIsEditModalVisible(false);
      return;
    } catch (apiError) {
      console.warn('API failed, using mock implementation:', apiError);
    }

    // Fallback to mock implementation
    setData(data.map(student => 
      student.id === currentStudent.id ? { ...student, name: values.name } : student
    ));
    message.success('Student updated (mock implementation)');
    setIsEditModalVisible(false);
  } catch (error) {
    message.error('Failed to update student');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Delete student (with API call and mock fallback)
const handleDelete = async (id) => {
  try {
    setLoading(true);
    
    // Try real API first
    try {
      await axios.delete(`http://localhost:8081/classrooms/${classroomId}/students/${id}`);
      await axios.delete(`http://localhost:8081/students/${id}`);
      
      setData(data.filter(student => student.id !== id));
      message.success('Student deleted successfully');
      return;
    } catch (apiError) {
      console.warn('API failed, using mock implementation:', apiError);
    }

    // Fallback to mock implementation
    setData(data.filter(student => student.id !== id));
    message.success('Student deleted (mock implementation)');
  } catch (error) {
    message.error('Failed to delete student');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Fetch students (with API call and mock fallback)
useEffect(() => {
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Try real API first
      try {
        const response = await axios.get(`http://localhost:8081/classrooms/${classroomId}/students`);
        if (response.data?.length > 0) {
          setData(response.data);
          return;
        }
      } catch (apiError) {
        console.warn('API failed, using mock implementation:', apiError);
      }

      // Fallback to mock implementation
      const mockStudents = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          progress: 75,
          assignments: [
            { id: '1', title: 'Math Homework', status: 'Submitted', grade: 'A' }
          ]
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          progress: 60,
          assignments: [
            { id: '1', title: 'Science Project', status: 'Pending', grade: '-' }
          ]
        }
      ];
      setData(mockStudents);
    } catch (error) {
      message.error('Failed to load students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, [classroomId]);

  const showEditModal = (student) => {
    setCurrentStudent(student);
    form.setFieldsValue({ name: student.name });
    setIsEditModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            onClick={() => navigate(`/students/${record.id}`)}
          >
            Progress
          </Button>
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
        <h3>Students in Classroom {classroomId}</h3>
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

      {/* Add Student Modal */}
      <Modal
        title="Add New Student"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="name"
            label="Student Name"
            rules={[{ required: true, message: 'Please enter student name' }]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Student
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        title="Edit Student"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="name"
            label="Student Name"
            rules={[{ required: true, message: 'Please enter student name' }]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Student
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;