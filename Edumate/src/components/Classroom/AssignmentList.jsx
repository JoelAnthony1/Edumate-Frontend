import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, message, Space, Modal, Form, Input, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './AssignmentList.css';

const AssignmentList = ({ classroomId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Mock data - replace with real API calls later
  useEffect(() => {
    const mockAssignments = [
      {
        id: '1',
        title: 'Math Homework',
        dueDate: '2023-12-15T00:00:00Z',
        status: 'Active',
        description: 'Complete exercises 1-10'
      },
      {
        id: '2',
        title: 'Science Project',
        dueDate: '2023-12-20T00:00:00Z',
        status: 'Active',
        description: 'Research paper on photosynthesis'
      }
    ];
    
    setAssignments(mockAssignments);
    setLoading(false);
  }, [classroomId]);

  const handleCreateAssignment = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      // In a real app, you would POST to your backend here
      const newAssignment = {
        id: `${assignments.length + 1}`,
        title: values.title,
        dueDate: values.dueDate.toISOString(),
        status: 'Active',
        description: values.description
      };
      
      setAssignments([...assignments, newAssignment]);
      message.success('Assignment created successfully');
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
  };

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
          <Button type="link" onClick={() => handleViewAssignment(record.id)}>View</Button>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="assignment-list-container">
      <div className="assignment-list-header">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateAssignment}
        >
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

      <Modal
        title="Create New Assignment"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the assignment title!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select the due date!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignmentList;

// import { useEffect, useState } from 'react';
// import { Table, Button, message, Space } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import axios from 'axios';
// import './AssignmentList.css';

// const AssignmentList = ({ classroomId }) => {
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAssignments = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8082/assignments?classroomId=${classroomId}`);
//         setAssignments(response.data);
//       } catch (error) {
//         message.error('Failed to load assignments');
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAssignments();
//   }, [classroomId]);

//   const columns = [
//     {
//       title: 'Title',
//       dataIndex: 'title',
//       key: 'title',
//     },
//     {
//       title: 'Due Date',
//       dataIndex: 'dueDate',
//       key: 'dueDate',
//       render: (date) => new Date(date).toLocaleDateString(),
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record) => (
//         <Space size="middle">
//           <Button type="link">View</Button>
//           <Button type="link">Edit</Button>
//           <Button type="link" danger>Delete</Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="assignment-list-container">
//       <div className="assignment-list-header">
//         <h2></h2>
//         <Button type="primary" icon={<PlusOutlined />}>
//           New Assignment
//         </Button>
//       </div>
//       <Table
//         columns={columns}
//         dataSource={assignments}
//         rowKey="id"
//         loading={loading}
//         pagination={false}
//       />
//     </div>
//   );
// };

// export default AssignmentList;