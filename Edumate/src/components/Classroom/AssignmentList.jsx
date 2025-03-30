import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, message, Modal, Form, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AssignmentList.css';

const AssignmentList = ({ classroomId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch assignments function - PRESERVED
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8082/rubrics/classrooms/${classroomId}`);
      
      setAssignments(response.data.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        questions: assignment.questions, // Added questions to display
        gradingCriteria: assignment.gradingCriteria,
        rubricsCount: assignment.images?.length || 0,
      })));
    } catch (error) {
      message.error('Failed to load assignments');
      console.error('Full error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) fetchAssignments();
  }, [classroomId]);

  // Show modal function - PRESERVED
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle cancel function - PRESERVED
  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  // Handle create function - UPDATED with questions
  const handleCreate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const newRubric = {
        classroomId: classroomId,
        title: values.title,
        questions: values.questions, // Added questions field
        gradingCriteria: values.gradingCriteria,
        studentIds: []
      };

      const response = await axios.post('http://localhost:8082/rubrics', newRubric, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Refresh the list after creation
      await fetchAssignments();

      message.success('Assignment created successfully');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to create assignment');
      console.error('Creation error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated columns to include questions
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Questions',
      dataIndex: 'questions',
      key: 'questions',
      render: text => <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
    },
    {
      title: 'Grading Criteria',
      dataIndex: 'gradingCriteria',
      key: 'gradingCriteria',
      render: text => <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
    },
    {
      title: 'Attachments',
      dataIndex: 'rubricsCount',
      key: 'rubricsCount',
      render: count => `${count} file(s)`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => navigate(`/assignments/${record.id}`)}
          >
            View/Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="assignment-list-container">
      <div className="assignment-list-header">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showModal}
          style={{ marginBottom: 16 }}
        >
          Add Assignment
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={assignments}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Create New Assignment"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter assignment title" />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default AssignmentList;