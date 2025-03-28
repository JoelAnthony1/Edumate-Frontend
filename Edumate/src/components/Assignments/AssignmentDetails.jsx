import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Descriptions, Upload, Form, Input, Modal } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AssignmentDetails.css';

const { Dragger } = Upload;
const { TextArea } = Input;

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // In production: await axios.get(`http://localhost:8082/assignment/${id}`);
        
        // Mock data
        const mockAssignments = {
          '1': {
            id: '1',
            classroomId: '1',
            subject: 'Mathematics',
            gradingCriteria: 'Complete all problems with work shown',
            rubrics: ['math_rubric.pdf'],
            dueDate: '2023-12-15T00:00:00Z'
          },
          '2': {
            id: '2',
            classroomId: '1',
            subject: 'Science',
            gradingCriteria: 'Follow scientific method properly',
            rubrics: ['science_rubric.pdf', 'lab_rubric.jpg'],
            dueDate: '2023-12-20T00:00:00Z'
          }
        };
        
        setAssignment(mockAssignments[id] || null);
      } catch (error) {
        message.error('Failed to load assignment details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const showUploadModal = () => {
    setIsModalVisible(true);
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      
      // In production:
      // const formData = new FormData();
      // fileList.forEach(file => {
      //   if (file.type === 'application/pdf') {
      //     formData.append('documents', file);
      //   } else {
      //     formData.append('images', file);
      //   }
      // });
      // await axios.post(`http://localhost:8082/assignment/${id}/upload-${fileList[0].type === 'application/pdf' ? 'documents' : 'images'}`, formData);
      // const response = await axios.post(`http://localhost:8082/assignment/${id}/extractPNG`);
      // setAssignment(response.data);

      // Mock implementation
      const newRubrics = fileList.map(file => file.name);
      setAssignment({
        ...assignment,
        rubrics: [...assignment.rubrics, ...newRubrics]
      });
      
      message.success('Rubrics uploaded successfully');
      setIsModalVisible(false);
      setFileList([]);
    } catch (error) {
      message.error('Failed to upload rubrics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isPdfOrImage = file.type === 'application/pdf' || 
                          file.type.startsWith('image/');
      if (!isPdfOrImage) {
        message.error('You can only upload PDF or image files!');
        return Upload.LIST_IGNORE;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    accept: '.pdf,.jpg,.jpeg,.png',
    multiple: true
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  return (
    <div className="assignment-details-container">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        className="back-button"
      >
        Back to Assignments
      </Button>
      
      <Card 
        title={assignment.subject} 
        className="assignment-details-card"
        extra={<Button type="primary" onClick={showUploadModal}>Upload Rubrics</Button>}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Grading Criteria">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{assignment.gradingCriteria}</pre>
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {new Date(assignment.dueDate).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Rubrics">
            {assignment.rubrics.length > 0 ? (
              <ul style={{ margin: 0 }}>
                {assignment.rubrics.map((rubric, index) => (
                  <li key={index}>{rubric}</li>
                ))}
              </ul>
            ) : 'No rubrics uploaded'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Upload Rubrics"
        visible={isModalVisible}
        onOk={handleUpload}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={700}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to upload</p>
          <p className="ant-upload-hint">
            Supports PDF, JPG, or PNG files. Max 5MB per file.
          </p>
        </Dragger>
      </Modal>
    </div>
  );
};

export default AssignmentDetails;