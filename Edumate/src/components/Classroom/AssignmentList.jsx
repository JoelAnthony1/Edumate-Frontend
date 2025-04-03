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
  const [criteriaModalVisible, setCriteriaModalVisible] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState('');

  const navigate = useNavigate();
  const numericClassroomId = Number(classroomId);

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

      // 1. Fetch all students in the classroom
      const studentsObj = await axios.get(
        `http://localhost:8081/classrooms/${classroomId}/students`
      );
      const students = studentsObj.data;
      const studentIds = students.map((student) => student.id);

      // 2. Create the new rubric (assignment)
      const newRubric = {
        classroomId: classroomId,
        title: values.title,
        questions: values.questions, // from your form
        gradingCriteria: values.gradingCriteria,
        studentIds: studentIds,
      };

      const rubricResponse = await axios.post('http://localhost:8082/rubrics', newRubric, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 3. Grab the newly created rubric's ID
      const newRubricId = rubricResponse.data.id;

      // 4. For each student, create a submission object
      //    using the required format
      const submissionPromises = studentIds.map(async (sId) => {
        const submissionData = {
          studentId: sId,
          classroomId: Number(classroomId),
          markingRubric: { id: newRubricId },
          writtenAnswer: '',
          score: 0.0,
          feedback: '',
          validatedByBayesian: false,
        };
        return axios.post('http://localhost:8082/submissions', submissionData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // 5. Execute all submission creations in parallel
      await Promise.all(submissionPromises);

      // 6. Refresh the list after creation
      await fetchAssignments();

      message.success('Assignment and submissions created successfully!');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to create assignment and submissions');
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
      title: 'Grading Criteria',
      dataIndex: 'gradingCriteria',
      key: 'gradingCriteria',
      render: text => {
        const maxWords = 30;
        // Check if text is null or undefined
        if (!text) {
          return 'No grading criteria provided.';
        }
        const words = text.split(' ');
        const shortText = words.length > maxWords
          ? words.slice(0, maxWords).join(' ') + '...'
          : text;

        return (
          <div style={{ whiteSpace: 'pre-line' }}>
            {shortText}
            {words.length > maxWords && (
              <div style={{ marginTop: 20 }}>
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedCriteria(text);
                    setCriteriaModalVisible(true);
                  }}
                >
                  Read More
                </Button>
              </div>
            )}
          </div>
        );
      }
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

      <Modal
        title="Full Grading Criteria"
        open={criteriaModalVisible}
        onCancel={() => setCriteriaModalVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 50 }}
      >
        <p style={{ whiteSpace: 'pre-line' }}>{selectedCriteria}</p>
      </Modal>
    </div>
  );
};

export default AssignmentList;