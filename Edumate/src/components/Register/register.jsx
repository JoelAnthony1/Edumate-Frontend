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
              style={{ width: "250px", height: "250px"}}
              src="../src/images/EduMate_logo.png"
              alt="logo"
            />
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
                backgroundColor: "#5aa8d6"
              }}
              type="primary"
              htmlType="submit"
              className="register-button"
            >
              Register
            </Button>
          </Form.Item>

          <Form.Item>
            <Button id="go-to-login-btn" type="link" onClick={() => navigate("/")}>
              Already have an account? Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
