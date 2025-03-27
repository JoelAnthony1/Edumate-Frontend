import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Spin, Progress, Divider, Table } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './StudentDetails.css';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API calls later
//   useEffect(() => {
//     const fetchStudent = async () => {
//       const response = await axios.get(`http://localhost:8081/students/${id}`);
//       setStudent(response.data);
//     };
//     fetchStudent();
//   }, [id]);
  useEffect(() => {
    const mockStudents = {
      '26': {
        id: '26',
        name: 'John Doe',
        email: 'john@example.com',
        progress: 75,
        assignments: [
          { id: '1', title: 'Math Homework', status: 'Submitted', grade: 'A' },
          { id: '2', title: 'Science Project', status: 'Pending', grade: '-' },
        ],
      },
      '2': {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        progress: 60,
        assignments: [
          { id: '1', title: 'Math Homework', status: 'Late', grade: 'B' },
          { id: '2', title: 'Science Project', status: 'Submitted', grade: 'A-' },
        ],
      },
    };

    setTimeout(() => {
      setStudent(mockStudents[id] || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  const assignmentColumns = [
    {
      title: 'Assignment',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
  ];

  return (
    <div className="student-details-container">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        className="back-button"
      >
        Back to Students
      </Button>

      <Card title="Student Details" className="student-details-card">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">{student.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{student.email}</Descriptions.Item>
          <Descriptions.Item label="Overall Progress">
            <Progress percent={student.progress} status="active" />
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Assignments</Divider>
        <Table
          columns={assignmentColumns}
          dataSource={student.assignments}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default StudentDetails;