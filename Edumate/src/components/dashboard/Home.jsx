import { EditOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import CreateCourse from "./CreateClassroom";
import CourseTable from "./ClassroomTable";
import React, { useState } from "react";
import "./DashBoard.css";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Home = () => {
  const [isList, setList] = useState(false);

  const items = [
    { key: "1", icon: <EditOutlined />, label: "Create Course" },
    { key: "2", icon: <UnorderedListOutlined />, label: "Course List" },
  ];

  return (
    <Layout>
      <Sider style={{ backgroundColor: "#FFFFFF" }} breakpoint="lg" collapsedWidth="0">
        <Menu onClick={(e) => setList(e.key === "2")} style={{ marginTop: "20px" }} defaultSelectedKeys={["1"]} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, backgroundColor: "#003A8C" }}>
          <div className="title-dash">
            <Title level={5} style={{ color: "white" }}>{isList ? "Course List" : "Create Course"}</Title>
          </div>
        </Header>
        <Content style={{ margin: "24px 16px 0" }}>
          {isList ? <CourseTable /> : <CreateCourse />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
