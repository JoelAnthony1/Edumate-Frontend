import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Descriptions, Upload, Modal, Image, Tabs, Divider } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AssignmentDetails.css';

const { TabPane } = Tabs;
const { Dragger } = Upload;

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [activeTab, setActiveTab] = useState('images');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8082/rubrics/${id}`);
        setAssignment(response.data);
      } catch (error) {
        message.error('Failed to load assignment details');
        console.error('Error:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const showUploadModal = (tab) => {
    setActiveTab(tab);
    setIsModalVisible(true);
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'documents' && fileList.length > 0) {
        // Handle PDF upload
        const formData = new FormData();
        fileList.forEach(file => {
          formData.append('document', file);
        });

        await axios.put(`http://localhost:8082/rubrics/${id}/upload-documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } 
      else if (activeTab === 'images' && fileList.length > 0) {
        // Handle image upload
        const formData = new FormData();
        fileList.forEach(file => {
          formData.append('images', file);
        });

        const response = await axios.put(`http://localhost:8082/rubrics/${id}/upload-images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setAssignment(response.data);
      }
      else if (activeTab === 'questionImages' && fileList.length > 0) {
        // Handle question image upload
        const formData = new FormData();
        fileList.forEach(file => {
          formData.append('questionImages', file);
        });

        const response = await axios.put(`http://localhost:8082/rubrics/${id}/upload-question-images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setAssignment(response.data);
      }

      // Refresh assignment data
      const response = await axios.get(`http://localhost:8082/rubrics/${id}`);
      setAssignment(response.data);
      
      message.success('Files uploaded successfully');
      setIsModalVisible(false);
      setFileList([]);
    } catch (error) {
      message.error('Failed to upload files');
      console.error('Upload error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async (type) => {
    try {
      setLoading(true);
      let endpoint = '';
      
      if (type === 'answers') {
        endpoint = `extractPNG`;
      } else if (type === 'questions') {
        endpoint = `extract-question-png`;
      }

      const response = await axios.put(`http://localhost:8082/rubrics/${id}/${endpoint}`);
      setAssignment(response.data);
      message.success(`Successfully extracted ${type}`);
    } catch (error) {
      message.error(`Failed to extract ${type}`);
      console.error('Extraction error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
  };

  const handlePreview = async (file) => {
    if (file.type.startsWith('image/')) {
      setPreviewImage(URL.createObjectURL(file));
      setPreviewVisible(true);
    } else if (file.type === 'application/pdf') {
      window.open(URL.createObjectURL(file), '_blank');
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      let isValid = false;
      
      if (activeTab === 'documents') {
        isValid = file.type === 'application/pdf';
        if (!isValid) message.error('You can only upload PDF files for documents!');
      } else {
        isValid = file.type.startsWith('image/');
        if (!isValid) message.error('You can only upload image files!');
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      
      if (isValid) {
        setFileList([...fileList, file]);
      }
      return false;
    },
    fileList,
    accept: activeTab === 'documents' ? '.pdf' : '.jpg,.jpeg,.png',
    multiple: true,
    onPreview: handlePreview
  };

  const renderFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />;
    } else if (file.type.startsWith('image/')) {
      return <FileImageOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
    }
    return <UploadOutlined />;
  };

  if (loading && !assignment) {
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
        title={assignment.title} 
        className="assignment-details-card"
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Questions & Criteria" key="1">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Questions">
                <div style={{ whiteSpace: 'pre-line' }}>{assignment.questions}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Grading Criteria">
                <div style={{ whiteSpace: 'pre-line' }}>{assignment.gradingCriteria}</div>
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Documents" key="2">
            <Button 
              type="primary" 
              onClick={() => showUploadModal('documents')}
              style={{ marginBottom: 16 }}
            >
              Upload Documents
            </Button>
            {assignment.documents?.length > 0 ? (
              <ul style={{ margin: 0 }}>
                {assignment.documents.map((doc, index) => (
                  <li key={`doc-${index}`}>
                    <a 
                      href={`http://localhost:8082/rubrics/${id}/documents/${doc.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FilePdfOutlined /> {doc.name || `Document ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            ) : 'No documents uploaded'}
          </TabPane>

          <TabPane tab="Answer Images" key="3">
            <Button 
              type="primary" 
              onClick={() => showUploadModal('images')}
              style={{ marginBottom: 16, marginRight: 16 }}
            >
              Upload Answer Images
            </Button>
            <Button 
              type="default"
              onClick={() => handleExtract('answers')}
              style={{ marginBottom: 16 }}
              disabled={!assignment.images?.length}
            >
              Extract Answers
            </Button>
            {assignment.images?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {assignment.images.map((img, index) => (
                  <div key={`img-${index}`} style={{ cursor: 'pointer' }}>
                    <Image
                      width={100}
                      src={`http://localhost:8082/rubrics/${id}/images/${img.id}`}
                      alt={img.name || `Image ${index + 1}`}
                      preview={{
                        src: `http://localhost:8082/rubrics/${id}/images/${img.id}`
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : 'No answer images uploaded'}
          </TabPane>

          <TabPane tab="Question Images" key="4">
            <Button 
              type="primary" 
              onClick={() => showUploadModal('questionImages')}
              style={{ marginBottom: 16, marginRight: 16 }}
            >
              Upload Question Images
            </Button>
            <Button 
              type="default"
              onClick={() => handleExtract('questions')}
              style={{ marginBottom: 16 }}
              disabled={!assignment.questionImages?.length}
            >
              Extract Questions
            </Button>
            {assignment.questionImages?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {assignment.questionImages.map((img, index) => (
                  <div key={`qimg-${index}`} style={{ cursor: 'pointer' }}>
                    <Image
                      width={100}
                      src={`http://localhost:8082/rubrics/${id}/question-images/${img.id}`}
                      alt={img.name || `Question Image ${index + 1}`}
                      preview={{
                        src: `http://localhost:8082/rubrics/${id}/question-images/${img.id}`
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : 'No question images uploaded'}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`Upload ${activeTab === 'documents' ? 'Documents' : activeTab === 'questionImages' ? 'Question Images' : 'Answer Images'}`}
        open={isModalVisible}
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
            {activeTab === 'documents' 
              ? 'Supports PDF files only. Max 5MB per file.'
              : 'Supports JPG or PNG files only. Max 5MB per file.'}
          </p>
        </Dragger>
        <div style={{ marginTop: 16 }}>
          {fileList.map(file => (
            <div key={file.uid} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              {renderFileIcon(file)}
              <span style={{ marginLeft: 8 }}>{file.name}</span>
              <span style={{ marginLeft: 8, color: '#888' }}>{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default AssignmentDetails;