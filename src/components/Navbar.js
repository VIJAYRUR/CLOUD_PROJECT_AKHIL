import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import * as bootstrap from 'bootstrap';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Initialize all dropdowns
    if (currentUser && dropdownRef.current) {
      const dropdownToggle = dropdownRef.current.querySelector('.dropdown-toggle');
      if (dropdownToggle) {
        // Initialize the dropdown
        new bootstrap.Dropdown(dropdownToggle, {
          autoClose: true
        });
      }
    }
  }, [currentUser]);
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to={currentUser ? "/" : "/login"}>
          <span style={{ fontWeight: '800', background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SkillForge
          </span>
          <span className="ms-2 text-white opacity-75">AI Learning Planner</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: 'none', padding: '0.5rem' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/" style={{ padding: '0.75rem 1rem' }}>
                    <i className="bi bi-house-door me-2"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/generate" style={{ padding: '0.75rem 1rem' }}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Generate New Plan
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
          <ul className="navbar-nav">
            {currentUser ? (
              <li className="nav-item dropdown" ref={dropdownRef}>
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center btn btn-link text-white"
                  type="button"
                  id="navbarDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={(e) => {
                    const dropdownToggle = e.currentTarget;
                    const bsDropdown = bootstrap.Dropdown.getInstance(dropdownToggle) ||
                                      new bootstrap.Dropdown(dropdownToggle);
                    bsDropdown.toggle();
                  }}
                  style={{
                    textDecoration: 'none',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  <div className="me-2 bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                       style={{
                         width: '36px',
                         height: '36px',
                         fontWeight: '600',
                         boxShadow: 'var(--shadow-sm)'
                       }}>
                    {currentUser?.name ? currentUser.name.charAt(0) : currentUser?.email?.charAt(0) || 'U'}
                  </div>
                  <span>{currentUser?.name || currentUser?.email || 'User'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0"
                    aria-labelledby="navbarDropdown"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      marginTop: '0.5rem',
                      padding: '0.5rem'
                    }}>
                  <li>
                    <Link className="dropdown-item rounded" to="/profile" style={{ padding: '0.5rem 1rem' }}>
                      <i className="bi bi-person me-2"></i>Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item rounded text-danger"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link btn btn-outline-light me-2" to="/login" style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '0.5rem 1.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-light text-primary" to="/register" style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '0.5rem 1.25rem',
                    fontWeight: '500'
                  }}>
                    <i className="bi bi-person-plus me-2"></i>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
