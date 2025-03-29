import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Card, Spin, message, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import AssignmentList from './AssignmentList';
import StudentList from './StudentList';
import './ClassroomDetails.css';

const ClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  console.log('ClassroomDetail ID from route:', id);
  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/classrooms/${id}`);
        setClassroom(response.data);
      } catch (error) {
        message.error('Failed to load classroom details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [id]);

  const handleBack = () => {
    navigate('/home'); // Or your classroom list route
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!classroom) {
    return <div>Classroom not found</div>;
  }

  const items = [
    {
      key: 'assignments',
      label: 'Assignments',
      children: <AssignmentList classroomId={classroom.id} />,
    },
    {
      key: 'students',
      label: 'Students',
      children: <StudentList classroomId={classroom.id} />, // Just pass classroomId
    },
  ];

  return (
    <div className="classroom-detail-container">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        className="back-button"
      >
        Back to Classrooms
      </Button>
      <Card 
        title={classroom.classname} 
        className="classroom-detail-card"
      >
        <Tabs
          activeKey={activeTab}
          items={items}
          onChange={setActiveTab}
          className="classroom-tabs"
        />
      </Card>
    </div>
  );
};

export default ClassroomDetail;