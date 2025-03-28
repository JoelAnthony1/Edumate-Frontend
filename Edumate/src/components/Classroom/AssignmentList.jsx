import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, message, Space, Modal, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AssignmentList.css';

const AssignmentList = ({ classroomId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8082/assignment?classroomId=${classroomId}`);
        
        // Assuming your backend returns an array of assignments with this structure:
        const fetchedAssignments = response.data.map(assignment => ({
          id: assignment.id,
          classroomId: assignment.classroomId,
          subject: assignment.subject,
          gradingCriteria: assignment.gradingCriteria,
          rubricsCount: assignment.rubrics?.length || 0 // Count the number of rubrics
        }));
        
        setAssignments(fetchedAssignments);
      } catch (error) {
        message.error('Failed to load assignments');
        console.error('Error fetching assignments:', error);
        
        // Fallback to mock data if API fails (remove in production)
        const mockAssignments = [
          {
            id: '1',
            classroomId: classroomId,
            subject: 'Mathematics',
            gradingCriteria: 'Complete all problems with work shown',
            rubricsCount: 1
          },
          {
            id: '2',
            classroomId: classroomId,
            subject: 'Science',
            gradingCriteria: 'Follow scientific method properly',
            rubricsCount: 2
          }
        ];
        setAssignments(mockAssignments);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAssignments();
  }, [classroomId]);


  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // In production: await axios.post('http://localhost:8082/assignment', {
      //   classroomId,
      //   subject: values.subject,
      //   gradingCriteria: values.gradingCriteria
      // });

      const newAssignment = {
        id: `${assignments.length + 1}`,
        classroomId: classroomId,
        subject: values.subject,
        gradingCriteria: values.gradingCriteria,
        rubricsCount: 0
      };

      setAssignments([...assignments, newAssignment]);
      message.success('Assignment created successfully');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to create assignment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Grading Criteria',
      dataIndex: 'gradingCriteria',
      key: 'gradingCriteria',
      render: text => <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
    },
    {
      title: 'Rubrics',
      dataIndex: 'rubricsCount',
      key: 'rubricsCount',
      render: count => `${count} file(s) attached`
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
        visible={isModalVisible}
        onOk={handleCreate}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please input the subject!' }]}
          >
            <Input placeholder="Enter subject (e.g., Mathematics)" />
          </Form.Item>
          
          <Form.Item
            name="gradingCriteria"
            label="Grading Criteria"
            rules={[{ required: true, message: 'Please input the grading criteria!' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter grading criteria details" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignmentList;