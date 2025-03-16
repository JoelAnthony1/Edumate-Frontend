import { Button, Form, Input, message } from "antd";
import { useDispatch } from "react-redux";
import { registerUser } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await dispatch(registerUser(values)).unwrap();
      message.success("Registration successful!");

      navigate("/home");
    } catch (error) {
      message.error(error || "Registration failed.");
    }
  };

  return (
    <div className="register-form-wrapper">
      <div className="register-items">
        <Form onFinish={onFinish} autoComplete="off">
          <div className="logo">
            <img
              style={{ width: "40px", height: "40px", paddingRight: "9px" }}
              src="https://seeklogo.com/images/A/ant-design-logo-EAB6B3D5D9-seeklogo.com.png"
              alt="logo"
            />
            <h1 className="logo-name">LMS</h1>
          </div>

          <Form.Item name="name" rules={[{ required: true, message: "Name is required" }]}>
            <Input placeholder="Name" style={{ width: "296px" }} />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, message: "Email is required" }]}>
            <Input placeholder="Email" style={{ width: "296px" }} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Password is required" }]}>
            <Input.Password placeholder="Password" style={{ width: "296px" }} />
          </Form.Item>

          <Form.Item>
            <Button
              style={{
                width: "296px",
                backgroundColor: "#003A8C",
                borderRadius: "1px",
              }}
              type="primary"
              htmlType="submit"
              className="register-button"
            >
              Register
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="link" onClick={() => navigate("/")}>
              Already have an account? Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
