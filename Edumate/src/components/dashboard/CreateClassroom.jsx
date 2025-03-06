import React from "react";
import { Button, Form, Input, message } from "antd";
import axios from "axios";

const CreateCourse = () => {
  const onFinish = async (values) => {
    try {
      const response = await axios.post("http://localhost:8080/api/courses", values);
      message.success("Course created successfully!");
      console.log("Course Created:", response.data);
    } catch (error) {
      message.error("Failed to create course.");
    }
  };

  return (
    <Form name="course-form" onFinish={onFinish} style={{ maxWidth: 400 }}>
      <Form.Item name="title" rules={[{ required: true, message: "Please enter a title" }]}>
        <Input placeholder="Title" />
      </Form.Item>
      <Form.Item name="imgurl">
        <Input placeholder="Image URL" />
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
