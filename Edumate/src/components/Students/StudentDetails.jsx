import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Descriptions,
  Spin,
  Alert,
  Divider,
  Table,
  Tag,
  Modal,
  message,
  Upload,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import './StudentDetails.css';

const StudentDetails = () => {
  const { studentId, classroomId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [progressReport, setProgressReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [rubricsLoading, setRubricsLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [uploading, setUploading] = useState(false);

  // Mock data
  const mockStudents = {
    '1': { id: '1', name: 'John Doe' },
    '2': { id: '2', name: 'Jane Smith' },
  };

  const mockRubrics = [
    { id: 1, title: 'Math Midterm Rubric', criteria: 'Algebra, Geometry, Calculus', totalMarks: 100, questions: '1. Solve quadratic equations\n2. Prove geometric theorems\n3. Calculate derivatives', gradingCriteria: '1. Correct solution (50%)\n2. Proper methodology (30%)\n3. Neat presentation (20%)' },
    { id: 2, title: 'Science Project Rubric', criteria: 'Research, Presentation, Creativity', totalMarks: 50, questions: '1. Research depth\n2. Experimental design\n3. Presentation quality', gradingCriteria: '1. Bibliography (20%)\n2. Methodology (30%)\n3. Visual aids (20%)\n4. Conclusions (30%)' },
  ];

  const mockProgressReports = {
    '1': 'John is performing well overall with a 75% completion rate. He excels in mathematics but needs to submit his science project.',
    '2': 'Jane is making good progress (60%). She submitted her science project but was late with math homework.',
  };

  const mockSubmissions = [
    { id: 1, studentId: '1', classroomId: '101', markingRubric: { title: 'Math Midterm Rubric' }, submitted: true, graded: true, score: 85, feedback: 'Good job, but you can improve on calculus.' },
    { id: 2, studentId: '1', classroomId: '101', markingRubric: { title: 'Science Project Rubric' }, submitted: false, graded: false, score: null, feedback: null },
    { id: 3, studentId: '2', classroomId: '101', markingRubric: { title: 'Math Midterm Rubric' }, submitted: true, graded: true, score: 70, feedback: 'You were late, but the work was satisfactory.' },
    { id: 4, studentId: '2', classroomId: '101', markingRubric: { title: 'Science Project Rubric' }, submitted: true, graded: true, score: 92, feedback: 'Excellent work!' },
  ];

  // Fetch all initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [studentRes, submissionsRes, rubricsRes] = await Promise.all([
          axios.get(`http://localhost:8081/students/${studentId}`),
          axios.get(`http://localhost:8082/submissions/classrooms/${classroomId}/students/${studentId}`),
          axios.get(`http://localhost:8082/rubrics/classrooms/${classroomId}/students/${studentId}`),
        ]);

        setStudent(studentRes.data);
        setSubmissions(submissionsRes.data);
        setRubrics(rubricsRes.data);
        setUsingMockData(false);
      } catch (error) {
        console.error('API Error, using mock data:', error);
        setUsingMockData(true);

        setStudent(mockStudents[studentId] || null);
        setSubmissions(mockSubmissions.filter((sub) => sub.studentId === studentId));
        setRubrics(mockRubrics);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [studentId, classroomId]);

  // Fetch rubrics from backend - Updated endpoint
  const fetchRubrics = async () => {
    try {
      setRubricsLoading(true);
      const response = await axios.get(
        `http://localhost:8082/rubrics/classrooms/${classroomId}/students/${studentId}`,
        {
          headers: {
            Accept: 'application/json',
          },
          validateStatus: (status) => status === 200 || status === 404,
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
        status: error.response?.status,
      });
      setRubrics(mockRubrics);
      message.warning('Using mock rubric data');
    } finally {
      setRubricsLoading(false);
    }
  };

  const fetchProgressReport = async (classroomId, studentId) => {
    try {
      console.log('Classroom ID:', classroomId);
      console.log('Student ID:', studentId);
      setProgressLoading(true);

      const url = `http://localhost:8082/analysis/classrooms/${classroomId}/students/${studentId}`;

      const response = await axios.get(url);
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

  const handleImageUpload = async (fileList, submissionId) => {
    try {
      setUploading(true);
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append('images', file.originFileObj);
      });

      await axios.put(
        `http://localhost:8082/submissions/${submissionId}/upload-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      message.success('Images uploaded successfully!');
      await processSubmission(submissionId); // Chain the operations
    } catch (error) {
      console.error('Image upload error:', error);
      message.error('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const processSubmission = async (submissionId) => {
    try {
      setLoading(true);

      // 1. Extract PNG
      await axios.put(`http://localhost:8082/submissions/${submissionId}/extractPNG`);

      // 2. Mark as Submitted (and grade)
      await axios.put(`http://localhost:8082/submissions/${submissionId}/mark-submitted`);

      // 3. Mark as Graded
      await axios.put(`http://localhost:8082/submissions/${submissionId}/mark-graded`);

      message.success('Submission processed successfully!');
      const submissionsRes = await axios.get(
        `http://localhost:8082/submissions/classrooms/${classroomId}/students/${studentId}`
      );
      setSubmissions(submissionsRes.data);

    } catch (error) {
      console.error('Submission processing error:', error);
      message.error('Failed to process submission.');
    } finally {
      setLoading(false);
    }
  };

  const submissionColumns = [
    {
      title: 'Rubric Title',
      dataIndex: ['markingRubric', 'title'],
      key: 'markingRubricTitle',
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted',
      key: 'submitted',
      render: (submitted) => (submitted ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>),
    },
    {
      title: 'Graded',
      dataIndex: 'graded',
      key: 'graded',
      render: (graded) => (graded ? <Tag color="green">Yes</Tag> : <Tag color="orange">No</Tag>),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
    },
    {
      title: 'Upload Images',
      key: 'uploadImages',
      render: (text, record) => (
        <Upload
          multiple
          beforeUpload={() => false}
          onChange={({ fileList }) => handleImageUpload(fileList, record.id)}
          showUploadList={false}
        >
          <Button loading={uploading} size="small">
            Upload
          </Button>
        </Upload>
      ),
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
      render: (marks) => `${marks} points`,
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
        <Alert message="Error" description="Student not found" type="error" showIcon />
        <Button onClick={handleBack} style={{ marginTop: 16 }}>
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="student-details-container">
      {usingMockData && (
        <Alert message="Using mock data - API not available" type="warning" showIcon style={{ marginBottom: 16 }} />
      )}

      <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="back-button">
        Back to Students
      </Button>

      <Card title="Student Details" className="student-details-card">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">{student.name}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Submissions</Divider>
        <Table columns={submissionColumns} dataSource={submissions} rowKey="id" pagination={false} loading={loading} />

        <Divider orientation="left">Progress Report</Divider>
        <Button
          type="primary"
          onClick={() => fetchProgressReport(classroomId, studentId)}
          loading={progressLoading}
          style={{ marginBottom: 16 }}
          icon={<FileTextOutlined />}
        >
          Generate Progress Report
        </Button>

        {progressReport && (
          <Card>
            {typeof progressReport === 'string' ? (
              <p style={{ whiteSpace: 'pre-line' }}>{progressReport}</p>
            ) : (
              <p style={{ whiteSpace: 'pre-line' }}>{progressReport.summary}</p>
            )}
          </Card>
        )}
      </Card>

      {/* Rubric Details Modal */}
      <Modal title={selectedRubric?.title || 'Rubric Details'} open={!!selectedRubric} onCancel={handleRubricClose} footer={null} width={800}>
        {selectedRubric && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Criteria">{selectedRubric.criteria}</Descriptions.Item>
              <Descriptions.Item label="Total Marks">{selectedRubric.totalMarks} points</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Questions</Divider>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedRubric.questions}</pre>

            <Divider orientation="left">Grading Criteria</Divider>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedRubric.gradingCriteria}</pre>

            <Divider orientation="left">Feedback</Divider>
            <Card>
              <p style={{ whiteSpace: 'pre-line' }}>{feedback || 'Loading feedback...'}</p>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDetails;