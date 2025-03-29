import React from "react";
import { Button, Form, Input, message } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import "./CreateClassroom.css";

const CreateClassroom = () => {
  const userid = useSelector((state) => state.auth.userid);
  const localStorageUserId = localStorage.getItem("userid");
  const onFinish = async (values) => {
    try {
      const dataToSend = {
        ...values,
        userId: localStorageUserId // Include the userid
      };
      console.log(dataToSend);
      const response = await axios.post("http://localhost:8081/classrooms", dataToSend);
      message.success("Classroom created successfully!");
      console.log("Classroom Created:", response.data);
    } catch (error) {
      message.error("Failed to create course.");
    }
  };

  return (
    <Form name="course-form" onFinish={onFinish}>
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
