import { EditOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import CreateClassroom from "./CreateClassroom";
import ClassroomTable from "./ClassroomTable";
import React, { useState } from "react";
import "./Home.css";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Home = () => {
  const [isList, setList] = useState(true); // Changed to true to default to Classroom List

  const items = [
    { key: "1", icon: <EditOutlined />, label: "Create Classroom" },
    { key: "2", icon: <UnorderedListOutlined />, label: "Classroom List" },
  ];

  return (
    <Layout>
      <Sider style={{ backgroundColor: "#fafcfb" }} breakpoint="lg" collapsedWidth="0">
      <div className="logo">
            <img
              style={{ width: "200px", height: "200px"}}
              src="../src/images/EduMate_logo.png"
              alt="logo"
            />
          </div>
        <Menu 
          onClick={(e) => setList(e.key === "2")} 
          defaultSelectedKeys={["2"]} // Changed to "2" to highlight Classroom List by default
          mode="inline" 
          items={items} 
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, backgroundColor: "#5aa8d6" }}>
          <div className="title-dash">
            <Title level={5} style={{ color: "white" }}>
              {isList ? "Classroom List" : "Create Classroom"}
            </Title>
          </div>
        </Header>
        <Content class="home-main-content">
          {isList ? <ClassroomTable /> : <CreateClassroom />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;