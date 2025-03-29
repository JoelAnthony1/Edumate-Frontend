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
              style={{ width: "250px", height: "250px"}}
              src="../src/images/EduMate_logo.png"
              alt="logo"
            />
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
                backgroundColor: "#5aa8d6"
              }}
              type="primary"
              htmlType="submit"
              className="login-button"
            >
              LOGIN
            </Button>
          </Form.Item>

          {/* Register Button */}
          <Form.Item>
            <Link to="/register">
              <Button id="register-btn"
                style={{
                  width: "296px",
                  backgroundColor: "#fafcfb",
                  color: "#000",
                  border: "1px solid black"
                }}
              >
                REGISTER
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
