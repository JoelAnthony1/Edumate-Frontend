import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Descriptions, 
  Spin, 
  Progress, 
  Divider, 
  Table, 
  Alert, 
  Tag,
  Modal,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ReloadOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import './StudentDetails.css';

const StudentDetails = () => {
  const { studentId, classroomId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [progressReport, setProgressReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [rubricsLoading, setRubricsLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Mock data
  const mockStudents = {
    '1': {
      id: '1',
      name: 'John Doe',
      assignments: [
        { id: '1', title: 'Math Homework', status: 'Submitted', grade: 'A' },
        { id: '2', title: 'Science Project', status: 'Pending', grade: '-' },
      ],
    },
    '2': {
      id: '2',
      name: 'Jane Smith',
      assignments: [
        { id: '1', title: 'Math Homework', status: 'Late', grade: 'B' },
        { id: '2', title: 'Science Project', status: 'Submitted', grade: 'A-' },
      ],
    },
  };

  const mockRubrics = [
    {
      id: 1,
      title: 'Math Midterm Rubric',
      criteria: 'Algebra, Geometry, Calculus',
      totalMarks: 100,
      questions: "1. Solve quadratic equations\n2. Prove geometric theorems\n3. Calculate derivatives",
      gradingCriteria: "1. Correct solution (50%)\n2. Proper methodology (30%)\n3. Neat presentation (20%)"
    },
    {
      id: 2,
      title: 'Science Project Rubric',
      criteria: 'Research, Presentation, Creativity',
      totalMarks: 50,
      questions: "1. Research depth\n2. Experimental design\n3. Presentation quality",
      gradingCriteria: "1. Bibliography (20%)\n2. Methodology (30%)\n3. Visual aids (20%)\n4. Conclusions (30%)"
    }
  ];

  const mockProgressReports = {
    '1': 'John is performing well overall with a 75% completion rate. He excels in mathematics but needs to submit his science project.',
    '2': 'Jane is making good progress (60%). She submitted her science project but was late with math homework.'
  };

  // Fetch all initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Only fetch student data and rubrics
        const [studentRes, rubricsRes] = await Promise.all([
          axios.get(`http://localhost:8081/students/${studentId}`),
          axios.get(`http://localhost:8082/rubrics/classrooms/${classroomId}/students/${studentId}`)
        ]);
        
        setStudent(studentRes.data);
        setRubrics(rubricsRes.data);
        setUsingMockData(false);
      } catch (error) {
        console.error('API Error, using mock data:', error);
        setUsingMockData(true);
        
        // Fallback to mock data
        setStudent(mockStudents[studentId] || null);
        setRubrics(mockRubrics);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInitialData();
  }, [studentId, classroomId]); // Make sure to include classroomId in dependencies
  // Fetch rubrics from backend - Updated endpoint
  const fetchRubrics = async () => {
    try {
      setRubricsLoading(true);
      const response = await axios.get(
        `http://localhost:8082/rubrics/classrooms/${classroomId}/students/${studentId}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          validateStatus: (status) => status === 200 || status === 404
        }
      );

      if (response.status === 404) {
        setRubrics([]);
        message.info('No rubrics found for this student');
      } else {
        setRubrics(response.data);
      }
    } catch (error) {
      console.error('Rubrics API Error:', {
        config: error.config,
        response: error.response?.data,
        status: error.response?.status
      });
      setRubrics(mockRubrics);
      message.warning('Using mock rubric data');
    } finally {
      setRubricsLoading(false);
    }
  };

  // Rest of your functions remain unchanged...
  const fetchProgressReport = async () => {
    try {
      setProgressLoading(true);
      const response = await axios.get(`http://localhost:8082/progress/${studentId}`);
      setProgressReport(response.data);
    } catch (error) {
      console.error('Progress API Error, using mock data:', error);
      setProgressReport(mockProgressReports[studentId] || 'No progress report available');
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchFeedback = async (rubricId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/feedback/${studentId}/${classroomId}/${rubricId}`
      );
      setFeedback(response.data);
    } catch (error) {
      console.error('Feedback API Error:', error);
      setFeedback('No feedback available for this rubric');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const showRubricDetails = (rubric) => {
    setSelectedRubric(rubric);
    fetchFeedback(rubric.id);
  };

  const handleRubricClose = () => {
    setSelectedRubric(null);
    setFeedback('');
  };

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
      render: status => {
        let color = 'default';
        if (status === 'Submitted') color = 'green';
        if (status === 'Late') color = 'orange';
        if (status === 'Pending') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
  ];

  const rubricColumns = [
    {
      title: 'Rubric Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Button type="link" onClick={() => showRubricDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Criteria',
      dataIndex: 'criteria',
      key: 'criteria',
    },
    {
      title: 'Total Marks',
      dataIndex: 'totalMarks',
      key: 'totalMarks',
      render: marks => `${marks} points`,
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading student data..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="error-container">
        <Alert
          message="Error"
          description="Student not found"
          type="error"
          showIcon
        />
        <Button onClick={handleBack} style={{ marginTop: 16 }}>
          Back to Students
        </Button>
      </div>
    );
  }

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
          icon={<FileTextOutlined />}
        >
          Generate Progress Report
        </Button>
        
        {progressReport && (
          <Card>
            <p style={{ whiteSpace: 'pre-line' }}>{progressReport}</p>
          </Card>
        )}
      </Card>

      {/* Rubric Details Modal */}
      <Modal
        title={selectedRubric?.title || 'Rubric Details'}
        open={!!selectedRubric}
        onCancel={handleRubricClose}
        footer={null}
        width={800}
      >
        {selectedRubric && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Criteria">
                {selectedRubric.criteria}
              </Descriptions.Item>
              <Descriptions.Item label="Total Marks">
                {selectedRubric.totalMarks} points
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Questions</Divider>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedRubric.questions}</pre>

            <Divider orientation="left">Grading Criteria</Divider>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedRubric.gradingCriteria}</pre>

            <Divider orientation="left">Feedback</Divider>
            <Card>
              <p style={{ whiteSpace: 'pre-line' }}>
                {feedback || 'Loading feedback...'}
              </p>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDetails;