  import React from "react";
  import { Button, Form, Input, message } from "antd";
  import axios from "axios";

  const CreateClassroom = () => {
    const onFinish = async (values) => {
      try {
        const response = await axios.post("http://localhost:8081/classrooms", values);
        message.success("Classroom created successfully!");
        console.log("Classroom Created:", response.data);
      } catch (error) {
        message.error("Failed to create course.");
      }
    };

    return (
      <Form name="course-form" onFinish={onFinish} style={{ maxWidth: 400 }}>
        <Form.Item name="classname" rules={[{ required: true, message: "Please enter a classname" }]}>
          <Input placeholder="Classname" />
        </Form.Item>
        <Form.Item name="subject">
          <Input placeholder="Subject" />
        </Form.Item>
        <Form.Item name="description">
          <Input.TextArea placeholder="Description" />
        </Form.Item>
        <Form.Item>
          <Button style={{ backgroundColor: "#003A8C", borderRadius: "1px" }} type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    );
  };

  export default CreateClassroom;
