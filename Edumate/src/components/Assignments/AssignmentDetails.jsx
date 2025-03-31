import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Upload, Modal, Tabs } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AssignmentDetails.css';

const { TabPane } = Tabs;
const { Dragger } = Upload;

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [images, setImages] = useState([]); // state for image metadata
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
        console.error('Assignment error:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchImageMetadata = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/rubrics/${id}/image-metadata`);
        setImages(response.data);
      } catch (error) {
        console.error('Image metadata error:', error.response?.data || error.message);
      }
    };

    fetchAssignment();
    fetchImageMetadata();
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
        const formData = new FormData();
        fileList.forEach(file => formData.append('document', file));
        await axios.put(`http://localhost:8082/rubrics/${id}/upload-documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (activeTab === 'images' && fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach(file => formData.append('images', file));
        const response = await axios.put(`http://localhost:8082/rubrics/${id}/upload-images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setAssignment(response.data);
        // Refresh image metadata after upload
        const metaResponse = await axios.get(`http://localhost:8082/rubrics/${id}/image-metadata`);
        setImages(metaResponse.data);
      }
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
      const newFileList = fileList.filter((f) => f.uid !== file.uid);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      let isValid = activeTab === 'documents' 
        ? file.type === 'application/pdf' 
        : file.type.startsWith('image/');
      if (!isValid) {
        message.error(activeTab === 'documents' 
          ? 'You can only upload PDF files for documents!' 
          : 'You can only upload image files!');
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
        style={{ fontWeight: 'bold', fontSize: '16px', padding: '10px 20px' }}
      >
        Back to Assignments
      </Button>

      <Card
        title={assignment.title}
        className="assignment-details-card"
        style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}
      >
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="Rubrics PDF" key="1">
            <Button
              type="primary"
              onClick={() => showUploadModal('documents')}
              style={{ marginBottom: 16, fontWeight: 'bold' }}
            >
              Upload Rubrics PDF
            </Button>
            {assignment.documents?.length > 0 ? (
              <ul style={{ margin: 0 }}>
                {assignment.documents.map((doc, index) => (
                  <li key={doc.id} style={{ marginBottom: '8px' }}>
                    <a
                      href={`http://localhost:8082/rubrics/${id}/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: '#1890ff' }}
                    >
                      <FilePdfOutlined /> {doc.name || `Document ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              'No rubrics PDF uploaded'
            )}
          </TabPane>

          <TabPane tab="Rubrics Images" key="2">
            <Button
              type="primary"
              onClick={() => showUploadModal('images')}
              style={{ marginBottom: 16, marginRight: 16, fontWeight: 'bold' }}
            >
              Upload Rubrics Images
            </Button>
            {images.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {images.map((img, index) => (
                  <div key={img.id} style={{ cursor: 'pointer' }}>
                    <a
                      href={`http://localhost:8082/rubrics/${id}/images/${img.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block' }}
                    >
                      <img
                        src={`http://localhost:8082/rubrics/${id}/images/${img.id}`}
                        alt={`Image ${index + 1}`}
                        width={100}
                        style={{ border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              'No rubrics images uploaded'
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`Upload ${activeTab === 'documents' ? 'Rubrics PDF' : 'Rubrics Images'}`}
        open={isModalVisible}
        onOk={handleUpload}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={700}
        bodyStyle={{ padding: '20px' }}
      >
        <Dragger
          {...uploadProps}
          style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
        >
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
        style={{ maxWidth: '90%' }}
      >
        <img alt="preview" style={{ width: '100%', borderRadius: '8px' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default AssignmentDetails;
