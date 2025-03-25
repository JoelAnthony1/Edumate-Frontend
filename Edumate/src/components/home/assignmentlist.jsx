import { useEffect, useState } from 'react';
import { Table, Button, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AssignmentList.css';

const AssignmentList = ({ classroomId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/assignments?classroomId=${classroomId}`);
        setAssignments(response.data);
      } catch (error) {
        message.error('Failed to load assignments');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [classroomId]);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">View</Button>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="assignment-list-container">
      <div className="assignment-list-header">
        <h2></h2>
        <Button type="primary" icon={<PlusOutlined />}>
          New Assignment
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={assignments}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default AssignmentList;