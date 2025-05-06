import { useEffect, useState } from 'react';
import { useParams, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import courses from '../../data/courses';

const CourseDetail = ({ user }) => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('introduction');

  useEffect(() => {
    // Find the course by ID
    const foundCourse = courses.find((c) => c.id === parseInt(courseId));
    if (foundCourse) {
      setCourse(foundCourse);
    } else {
      // Redirect to dashboard if course not found
      navigate('/');
    }

    // Set active tab based on URL
    const path = location.pathname;
    if (path.includes('introduction')) setActiveTab('introduction');
    else if (path.includes('quiz')) setActiveTab('quiz');
    else if (path.includes('advanced')) setActiveTab('advanced');
    else if (path.includes('homework')) setActiveTab('homework');
  }, [courseId, location, navigate]);

  if (!course) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading course...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <div className="row mb-4">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>
          <h1 className="mb-2">{course.title}</h1>
          <p className="lead text-muted">{course.description}</p>
        </div>
        <div className="col-md-4 d-flex flex-column justify-content-center">
          <div className="d-flex align-items-center mb-2">
            <div className="me-3">
              <span className="badge bg-primary">{course.level}</span>
            </div>
            <div className="me-3">
              <i className="bi bi-clock me-1"></i>
              <span>{course.duration}</span>
            </div>
            <div>
              <i className="bi bi-star-fill text-warning me-1"></i>
              <span>{course.rating}</span>
            </div>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: '25%' }}
              aria-valuenow="25"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <small className="text-muted mt-1">25% complete</small>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <Link
            className={`nav-link ${activeTab === 'introduction' ? 'active' : ''}`}
            to={`/course/${courseId}/introduction`}
            onClick={() => setActiveTab('introduction')}
          >
            <i className="bi bi-book me-1"></i>
            Introduction
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link ${activeTab === 'quiz' ? 'active' : ''}`}
            to={`/course/${courseId}/quiz`}
            onClick={() => setActiveTab('quiz')}
          >
            <i className="bi bi-question-circle me-1"></i>
            Quiz
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link ${activeTab === 'advanced' ? 'active' : ''}`}
            to={`/course/${courseId}/advanced`}
            onClick={() => setActiveTab('advanced')}
          >
            <i className="bi bi-graph-up me-1"></i>
            Advanced
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link ${activeTab === 'homework' ? 'active' : ''}`}
            to={`/course/${courseId}/homework`}
            onClick={() => setActiveTab('homework')}
          >
            <i className="bi bi-journal-text me-1"></i>
            Take Home Work
          </Link>
        </li>
      </ul>

      <div className="course-content">
        <Outlet context={{ course, user }} />
      </div>
    </div>
  );
};

export default CourseDetail;
