import { useOutletContext } from 'react-router-dom';

const Introduction = () => {
  const { course } = useOutletContext();
  const introSection = course.sections.introduction;

  return (
    <div className="introduction-section">
      <div className="section-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{introSection.title}</h2>
          <span className="badge bg-primary">Introduction</span>
        </div>
        
        <div className="content-area mb-5">
          {introSection.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>

        {introSection.resources && introSection.resources.length > 0 && (
          <div className="resources mt-5">
            <h4 className="mb-3">
              <i className="bi bi-journal-bookmark me-2"></i>
              Learning Resources
            </h4>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {introSection.resources.map((resource, index) => (
                <div className="col" key={index}>
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-3">
                          <span className={`badge ${
                            resource.type === 'video' ? 'bg-danger' :
                            resource.type === 'article' ? 'bg-info' :
                            resource.type === 'pdf' ? 'bg-success' :
                            resource.type === 'tutorial' ? 'bg-warning' :
                            resource.type === 'documentation' ? 'bg-secondary' :
                            resource.type === 'whitepaper' ? 'bg-dark' : 'bg-primary'
                          }`}>
                            {resource.type.toUpperCase()}
                          </span>
                        </div>
                        <h5 className="card-title mb-0">{resource.title}</h5>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm w-100"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Open Resource
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="d-flex justify-content-between mt-5">
          <button className="btn btn-outline-secondary" disabled>
            <i className="bi bi-arrow-left me-1"></i>
            Previous
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = `/course/${course.id}/quiz`}>
            Next: Take Quiz
            <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
