import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const Header = ({ title }) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    toast.success("Logged out successfully");

    navigate("/login");
  };

  return (
    <header className="header">
      <div>
        <h1>{title}</h1>
        <p>
          Manage your business operations efficiently
        </p>
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="avatar">
            {user?.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;