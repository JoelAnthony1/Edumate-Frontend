import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './AssignmentDetails.css';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API call later
  useEffect(() => {
    const mockAssignments = {
      '1': {
        id: '1',
        title: 'Math Homework',
        dueDate: '2023-12-15T00:00:00Z',
        status: 'Active',
        description: 'Complete exercises 1-10',
        instructions: 'Show all your work and submit as PDF',
        points: 100
      },
      '2': {
        id: '2',
        title: 'Science Project',
        dueDate: '2023-12-20T00:00:00Z',
        status: 'Active',
        description: 'Research paper on photosynthesis',
        instructions: '5-7 pages, APA format',
        points: 200
      }
    };

    setTimeout(() => {
      setAssignment(mockAssignments[id] || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  return (
    <div className="assignment-detail-container">
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
        className="assignment-detail-card"
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Description">{assignment.description}</Descriptions.Item>
          <Descriptions.Item label="Instructions">{assignment.instructions}</Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {new Date(assignment.dueDate).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Points">{assignment.points}</Descriptions.Item>
          <Descriptions.Item label="Status">{assignment.status}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default AssignmentDetail;