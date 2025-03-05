import { Button, Checkbox, Form, Input, message } from "antd";
import "./Login.css";
import { useDispatch } from "react-redux";
import { loginUser } from "../../features/auth/authSlice"; // Import Redux action
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // Dispatch login action (connects to backend)
      const response = await dispatch(loginUser(values)).unwrap();

      // Show success message and navigate to dashboard
      message.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      message.error("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="login-form-wrapper">
      <div className="login-items">
        <Form
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <div className="logo">
            <img
              style={{ width: "40px", height: "40px", paddingRight: "9px" }}
              src="https://seeklogo.com/images/A/ant-design-logo-EAB6B3D5D9-seeklogo.com.png"
              alt="logo"
            />
            <h1 className="logo-name">LMS</h1>
          </div>

          <Form.Item name="username" rules={[{ required: true, message: "required" }]}>
            <Input placeholder="Username or Email" style={{ width: "296px" }} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "required" }]}>
            <Input.Password placeholder="Password" style={{ width: "296px" }} />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
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
              className="login-button"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
