import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Space, Button, Empty, Modal, Form, Input, message, Spin, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import './StudentList.css';

const StudentList = ({ classroomId }) => {
  console.log('StudentList component mounted'); // Initial mount log
  // const { classroomId } = useParams();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  console.log('StudentList received classroomId:', classroomId);
  // Enhanced mock data with more details
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

  // Robust fetchStudents with detailed logging
  const fetchStudents = useCallback(async () => {
    console.group('fetchStudents Execution');
    try {
      console.log('Starting fetch for classroom:', classroomId);
      setLoading(true);
      setError(null);
      
      const classId = Number(classroomId);
      console.log('Parsed classroom ID:', classId);
      
      if (isNaN(classId)) {
        const err = new Error(`Invalid classroom ID: ${classroomId}`);
        console.error('Validation error:', err);
        throw err;
      }

      console.log('Making API request...');
      const response = await axios.get(
        `http://localhost:8081/classrooms/${classId}/students`,
        {
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000,
          validateStatus: (status) => status === 200
        }
      );

      console.log('API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      const students = Array.isArray(response.data) ? response.data : [];
      console.log('Processed students:', students);
      
      setData(students);
      message.success('Students loaded successfully');
      
    } catch (error) {
      console.error('Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        isAxiosError: axios.isAxiosError(error),
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : undefined,
        config: error.config
      });

      setError(error.message);

      if (error.response?.status === 404) {
        console.log('No students found (404)');
        setData([]);
        message.info('No students found in this classroom');
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data in development mode');
        message.warning('Using mock data in development');
        setData(mockStudents);
      } else {
        console.error('Critical fetch error');
        message.error(`Failed to load students: ${error.message}`);
        setData([]);
      }
    } finally {
      console.log('Fetch operation completed');
      setLoading(false);
      console.groupEnd();
    }
  }, [classroomId]);

  // Enhanced useEffect with cleanup
  useEffect(() => {
    console.log('useEffect triggered with classroomId:', classroomId);
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (classroomId && isMounted) {
          console.log('Initiating data fetch...');
          await fetchStudents();
        }
      } catch (err) {
        if (isMounted) {
          console.error('Uncaught error in useEffect:', err);
          setError(err.message);
        }
      }
    };

    fetchData();

    return () => {
      console.log('Cleanup: cancelling pending operations');
      isMounted = false;
      // Optionally add Axios cancel token here
    };
  }, [classroomId, fetchStudents]);

  // Enhanced handler functions
  const handleAdd = async (values) => {
    console.log('Add student form submitted:', values);
    try {
      setLoading(true);
      
      // Try real API first
      try {
        console.log('Attempting real API call');
        const response = await axios.post('http://localhost:8081/students', {
          name: values.name,
          email: `${values.name.replace(/\s+/g, '').toLowerCase()}@example.com`
        });
        
        console.log('Student created:', response.data);
        
        await axios.post(
          `http://localhost:8081/classrooms/${classroomId}/students/${response.data.id}`
        );
        
        setData(prev => [...prev, response.data]);
        message.success('Student added successfully');
        form.resetFields();
        setIsModalVisible(false);
        return;
      } catch (apiError) {
        console.warn('API failed, using mock implementation:', apiError);
      }

      // Fallback to mock implementation
      console.log('Using mock implementation');
      const newStudent = {
        id: `mock-${Date.now()}`,
        name: values.name,
        email: `${values.name.replace(/\s+/g, '').toLowerCase()}@example.com`,
        progress: 0,
        assignments: []
      };
      
      setData(prev => [...prev, newStudent]);
      message.success('Student added (mock implementation)');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Add student error:', error);
      message.error(`Failed to add student: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values) => {
    console.log('Editing student:', currentStudent.id, 'with:', values);
    try {
      setLoading(true);
      
      // Try real API first
      try {
        console.log('Attempting real API update');
        await axios.put(`http://localhost:8081/students/${currentStudent.id}`, {
          name: values.name
        });
        
        setData(prev => prev.map(student => 
          student.id === currentStudent.id ? { ...student, name: values.name } : student
        ));
        message.success('Student updated successfully');
        setIsEditModalVisible(false);
        return;
      } catch (apiError) {
        console.warn('API failed, using mock implementation:', apiError);
      }

      // Fallback to mock implementation
      console.log('Using mock implementation');
      setData(prev => prev.map(student => 
        student.id === currentStudent.id ? { ...student, name: values.name } : student
      ));
      message.success('Student updated (mock implementation)');
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Edit student error:', error);
      message.error(`Failed to update student: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log('Deleting student:', id);
    try {
      setLoading(true);
      
      // Try real API first
      try {
        console.log('Attempting real API deletion');
        await axios.delete(
          `http://localhost:8081/classrooms/${classroomId}/students/${id}`
        );
        await axios.delete(`http://localhost:8081/students/${id}`);
        
        setData(prev => prev.filter(student => student.id !== id));
        message.success('Student deleted successfully');
        return;
      } catch (apiError) {
        console.warn('API failed, using mock implementation:', apiError);
      }

      // Fallback to mock implementation
      console.log('Using mock implementation');
      setData(prev => prev.filter(student => student.id !== id));
      message.success('Student deleted (mock implementation)');
    } catch (error) {
      console.error('Delete student error:', error);
      message.error(`Failed to delete student: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (student) => {
    console.log('Showing edit modal for student:', student.id);
    setCurrentStudent(student);
    form.setFieldsValue({ name: student.name });
    setIsEditModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      className: 'student-name-column',
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
            onClick={() => navigate(`/classrooms/${classroomId}/students/${record.id}`)}
          >
            Details
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

  console.log('Rendering with current state:', { data, loading, error });

  return (
    <div className="student-list-container">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}
      
      <div className="student-list-header">
        <h3>Students in Classroom {classroomId}</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            console.log('Add student button clicked');
            setIsModalVisible(true);
          }}
          loading={loading}
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
          emptyText: loading ? (
            <Spin tip="Loading students..." size="large" />
          ) : (
            <Empty 
              description={
                error ? 'Failed to load students' : 'No students found'
              } 
            />
          )
        }}
        onChange={(pagination, filters, sorter) => {
          console.log('Table changed:', { pagination, filters, sorter });
        }}
      />

      {/* Add Student Modal */}
      <Modal
        title="Add New Student"
        open={isModalVisible}
        onCancel={() => {
          console.log('Add modal closed');
          setIsModalVisible(false);
        }}
        footer={null}
        destroyOnClose
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
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Add Student
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        title="Edit Student"
        open={isEditModalVisible}
        onCancel={() => {
          console.log('Edit modal closed');
          setIsEditModalVisible(false);
        }}
        footer={null}
        destroyOnClose
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
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Update Student
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;