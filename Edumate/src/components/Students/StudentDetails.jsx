import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Spin, Progress, Divider, Table, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import './StudentDetails.css';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [progressReport, setProgressReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // Mock data
  const mockStudents = {
    '1': {
      id: '1',
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

  const mockProgressReports = {
    '1': 'John is performing well overall with a 75% completion rate. He excels in mathematics but needs to submit his science project.',
    '2': 'Jane is making good progress (60%). She submitted her science project but was late with math homework.'
  };

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Try real API first
        const [studentRes, assignmentsRes] = await Promise.all([
          axios.get(`http://localhost:8081/students/${id}`),
          axios.get(`http://localhost:8082/assignments/${id}`)
        ]);
        
        setStudent(studentRes.data);
        setAssignments(assignmentsRes.data);
        setUsingMockData(false);
      } catch (error) {
        console.error('API Error, using mock data:', error);
        setUsingMockData(true);
        
        // Fallback to mock data
        setTimeout(() => {
          setStudent(mockStudents[id] || null);
          setAssignments(mockStudents[id]?.assignments || []);
        }, 500);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const fetchProgressReport = async () => {
    try {
      setProgressLoading(true);
      const response = await axios.get(`http://localhost:8082/progress/${id}`);
      setProgressReport(response.data);
    } catch (error) {
      console.error('Progress API Error, using mock data:', error);
      setProgressReport(mockProgressReports[id] || 'No progress report available');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
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
      {usingMockData && (
        <Alert
          message="Using mock data - API not available"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
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
          dataSource={assignments}
          rowKey="id"
          pagination={false}
          loading={loading}
        />

        <Divider orientation="left">Progress Report</Divider>
        <Button 
          type="primary" 
          onClick={fetchProgressReport}
          loading={progressLoading}
          style={{ marginBottom: 16 }}
        >
          Generate Progress Report
        </Button>
        
        {progressReport && (
          <Card>
            <p style={{ whiteSpace: 'pre-line' }}>{progressReport}</p>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default StudentDetails;