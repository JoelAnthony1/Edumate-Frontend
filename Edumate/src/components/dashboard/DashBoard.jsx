import { EditOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import CreateCourse from "./CreateCourse";
import CourseTable from "./CourseTable";
import React, { useState } from "react";
import "./DashBoard.css";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const DashBoard = () => {
  const [isList, setList] = useState(false);

  const items = [
    { key: "1", icon: <EditOutlined />, label: "Course Create" },
    { key: "2", icon: <UnorderedListOutlined />, label: "Course List" },
  ];

  const handleClick = (e) => {
    setList(e.key === "2");
  };

  return (
    <Layout>
      <Sider style={{ backgroundColor: "#FFFFFF" }} breakpoint="lg" collapsedWidth="0">
        <div className="logo-dash">
          <img
            style={{ width: "40px", height: "40px", paddingLeft: "8px", paddingTop: "10px" }}
            src="https://seeklogo.com/images/A/ant-design-logo-EAB6B3D5D9-seeklogo.com.png"
            alt="logo"
          />
          <h1 className="logo-name-dash">LMS</h1>
        </div>
        <Menu onClick={handleClick} style={{ marginTop: "20px" }} defaultSelectedKeys={["1"]} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, backgroundColor: "#003A8C" }}>
          <div className="title-dash">
            <Title level={5} style={{ color: "white" }}>{isList ? "Course List" : "Create Course"}</Title>
          </div>
        </Header>
        <Content style={{ margin: "24px 16px 0" }}>
          <div className={isList ? "table-items" : "content-wrapper"}>
            {isList ? <CourseTable /> : <div className="create-form"><CreateCourse /></div>}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashBoard;
