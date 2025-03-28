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
      <Sider style={{ backgroundColor: "#FFFFFF" }} breakpoint="lg" collapsedWidth="0">
        <Menu 
          onClick={(e) => setList(e.key === "2")} 
          style={{ marginTop: "20px" }} 
          defaultSelectedKeys={["2"]} // Changed to "2" to highlight Classroom List by default
          mode="inline" 
          items={items} 
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, backgroundColor: "#003A8C" }}>
          <div className="title-dash">
            <Title level={5} style={{ color: "white" }}>
              {isList ? "Classroom List" : "Create Classroom"}
            </Title>
          </div>
        </Header>
        <Content style={{ margin: "24px 16px 0" }}>
          {isList ? <ClassroomTable /> : <CreateClassroom />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;