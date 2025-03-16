import { Button, Checkbox, Form, Input, message } from "antd";
import { useDispatch } from "react-redux";
import { loginUser } from "../../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await dispatch(loginUser(values)).unwrap();
      message.success("Login successful!");
      navigate("/home"); // Redirect after login
    } catch (error) {
      message.error(error || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="login-form-wrapper">
      <div className="login-items">
        <Form initialValues={{ remember: true }} onFinish={onFinish} autoComplete="off">
          <div className="logo">
            <img
              style={{ width: "40px", height: "40px", paddingRight: "9px" }}
              src="https://seeklogo.com/images/A/ant-design-logo-EAB6B3D5D9-seeklogo.com.png"
              alt="logo"
            />
            <h1 className="logo-name">LMS</h1>
          </div>

          <Form.Item name="email" rules={[{ required: true, message: "Email is required" }]}>
            <Input placeholder="Email" style={{ width: "296px" }} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Password is required" }]}>
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

          {/* Register Button */}
          <Form.Item>
            <Link to="/register">
              <Button
                style={{
                  width: "296px",
                  borderRadius: "1px",
                  backgroundColor: "#BCBCBC",
                  color: "#000",
                }}
              >
                Register
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
