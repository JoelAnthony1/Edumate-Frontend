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
  Empty,
  Upload,
} from 'antd';
import {
  ArrowLeftOutlined,
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
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [modalContentTitle, setModalContentTitle] = useState('');
  const [modalContentText, setModalContentText] = useState('');
  const studentIdNum = Number(studentId);
  const classroomIdNum = Number(classroomId);


  useEffect(() => {
    console.log("Params:", { studentId, classroomId });
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [studentRes, submissionsRes, rubricsRes] = await Promise.all([
          axios.get(`http://localhost:8081/students/${studentId}`),
          axios.get(
            `http://localhost:8082/submissions/classrooms/${classroomId}/students/${studentId}`,
            { validateStatus: (status) => status === 200 || status === 404 }
          ),
          axios.get(
            `http://localhost:8082/rubrics/classrooms/${classroomId}/students/${studentId}`,
            { validateStatus: (status) => status === 200 || status === 404 }
          ),
        ]);

        setStudent(studentRes.data);
        setSubmissions(submissionsRes.status === 404 ? [] : submissionsRes.data);
        setRubrics(rubricsRes.status === 404 ? [] : rubricsRes.data);

        setUsingMockData(false);

      } catch (error) {
        console.error('API Error:', error);
        message.error('Error fetching student details. Please try again later.');
        setStudent(null);
        setSubmissions([]);
        setRubrics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [studentId, classroomId]);

  const fetchRubrics = async () => {
    try {
      setRubricsLoading(true);
      const response = await axios.get(
        `http://localhost:8082/rubrics/classrooms/${classroomId}/students/${studentId}`,
        {
          headers: { Accept: 'application/json' },
          validateStatus: (status) => status === 200 || status === 404,
        }
      );

      setRubrics(response.status === 404 ? [] : response.data);
      if (response.status === 404) message.info('No rubrics found for this student');
    } catch (error) {
      console.error('Rubrics API Error:', error);
      setRubrics(mockRubrics);
      message.warning('Using mock rubric data');
    } finally {
      setRubricsLoading(false);
    }
  };

  const fetchProgressReport = async (classroomId, studentId) => {
    try {
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

  const handleBack = () => {
    // setActiveTab('students');
    // navigate(-1);
    navigate(`/classrooms/${classroomId}`, { state: { activeTab: 'students' } });
  };

  const showRubricDetails = (rubric) => {
    setSelectedRubric(rubric);
  };

  const handleRubricClose = () => {
    setSelectedRubric(null);
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
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      message.success('Images uploaded successfully!');
      setShowConfirm(true);
    } catch (error) {
      console.error('Image upload error:', error);
      message.error('Failed to upload images.');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const processSubmission = async (submissionId, classroomId, studentId) => {
    try {
      setLoading(true);

      // Step 1: Extract written answers from PNGs
      await axios.put(`http://localhost:8082/submissions/${submissionId}/extractPNG`);

      // Step 2: Try fetching existing analysis for this student & classroom
      let analysisId;
      try {
        const existingAnalysisRes = await axios.get(
          `http://localhost:8082/analysis/classrooms/${classroomId}/students/${studentId}`
        );
        analysisId = existingAnalysisRes.data.id;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Step 3: If not found, create it
          const createRes = await axios.post(`http://localhost:8082/analysis`, {
            classId: parseInt(classroomId),
            studentId: parseInt(studentId),
            summary: "",
          });
          analysisId = createRes.data.id;
        } else {
          throw error;
        }
      }

      // Step 4: Grade the submission using the analysisId
      const gradeRes = await axios.put(
        `http://localhost:8082/submissions/${submissionId}/grade/${analysisId}`
      );
      const gradedSubmission = gradeRes.data;

      // Step 5: Mark as submitted and graded
      await axios.put(`http://localhost:8082/submissions/${submissionId}/mark-submitted`);
      await axios.put(`http://localhost:8082/submissions/${submissionId}/mark-graded`);

      // Step 6: Refresh submission list
      const updatedSubmissionsRes = await axios.get(
        `http://localhost:8082/submissions/classrooms/${classroomId}/students/${studentId}`
      );
      let updatedSubmissions = updatedSubmissionsRes.data;

      // Find the processed submission and get its rubric id
      const processedSubmission = updatedSubmissions.find(sub => sub.id === submissionId);
      const markingRubricId = processedSubmission.markingRubric.id;

      // Step 7: Call the feedback endpoint using the rubric id
      const feedbackRes = await axios.get(`http://localhost:8082/submissions/feedback`, {
        params: {
          studentId,
          classroomId,
          markingRubricId,
        },
      });
      const feedback = feedbackRes.data; // assuming feedback is a simple string

      // Merge feedback into the processed submission
      updatedSubmissions = updatedSubmissions.map(submission =>
        submission.id === submissionId ? { ...submission, feedback } : submission
      );

      setSubmissions(updatedSubmissions);

      // Step 8: Show feedback as a success message
      message.success(`Feedback successfully generated`);
      setShowConfirm(false);
    } catch (error) {
      console.error('Submission processing error:', error);
      message.error('Failed to process submission.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };



  const submissionColumns = [
    {
      title: 'Assignment Title',
      dataIndex: ['markingRubric', 'title'],
      key: 'markingRubricTitle',
    },
    {
      title: 'Submitted & Graded',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const isComplete = record.submitted && record.graded;
        return (
          <Tag color={isComplete ? 'green' : 'red'}>
            {isComplete ? 'Yes' : 'No'}
          </Tag>
        );
      },
    },
    {
      title: 'Score (%)',
      dataIndex: 'score',
      key: 'score',
      render: (score) => {
        if (score === null || score === undefined) return 'N/A';
        return parseFloat(score).toFixed(2);
      },
    },
    {
      title: 'Written Answer',
      dataIndex: 'writtenAnswer',
      key: 'writtenAnswer',
      render: (text) => {
        if (!text) return 'N/A';
        const maxWords = 20;
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
                    setModalContentTitle('Full Written Answer');
                    setModalContentText(text);
                    setContentModalVisible(true);
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
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
      render: (text) => {
        if (!text) return 'N/A';
        const maxWords = 20;
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
                    setModalContentTitle('Full Feedback');
                    setModalContentText(text);
                    setContentModalVisible(true);
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
      title: 'Upload Images',
      key: 'uploadImages',
      render: (text, record) =>
        record.submitted ? (
          <Tag color="default">Submitted</Tag>
        ) : (
          <Upload
            multiple
            beforeUpload={() => false}
            onChange={({ fileList }) => handleImageUpload(fileList, record.id)}
            showUploadList={false}
          >
            <Button loading={uploading} size="small">Upload</Button>
          </Upload>
        ),
    },
    {
      title: 'Process Submission',
      key: 'processSubmission',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => processSubmission(record.id, classroomId, studentId)}
          disabled={!showConfirm || record.graded}
          loading={loading}
          style={{
            cursor: !showConfirm || record.graded ? 'not-allowed' : 'pointer',
            opacity: !showConfirm || record.graded ? 0.5 : 1,
          }}
        >
          Confirm
        </Button>
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
        <p style={{ marginTop: 16, textAlign: 'center', fontStyle: 'italic' }}>
          AI is extracting information...
        </p>
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

        <Divider orientation="left">Submissions</Divider>
        <Table
          columns={submissionColumns}
          dataSource={submissions}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <Empty description="No submissions found" /> }}
        />

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
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {selectedRubric.questions}
            </pre>

            <Divider orientation="left">Grading Criteria</Divider>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {selectedRubric.gradingCriteria}
            </pre>
          </div>
        )}
      </Modal>

      <Modal
        title={modalContentTitle}
        open={contentModalVisible}
        onCancel={() => setContentModalVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 50 }}
      >
        <p style={{ whiteSpace: 'pre-line' }}>{modalContentText}</p>
      </Modal>
    </div>
  );
};

export default StudentDetails;