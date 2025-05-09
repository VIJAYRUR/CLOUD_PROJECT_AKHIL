import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ModernProfile.css';

const Profile = () => {
  const { currentUser, userPreferences, updateProfile, updatePreferences, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [learningStyle, setLearningStyle] = useState(userPreferences?.learningStyle || 'visual');
  const [pacePreference, setPacePreference] = useState(userPreferences?.pacePreference || 'moderate');
  const [difficultyPreference, setDifficultyPreference] = useState(userPreferences?.difficultyPreference || 'challenging');
  const [interests, setInterests] = useState(userPreferences?.interests || []);
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      const preferences = {
        learningStyle,
        pacePreference,
        difficultyPreference,
        interests
      };
      await updatePreferences(preferences);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="decorative-circle decorative-circle-1"></div>
        <div className="decorative-circle decorative-circle-2"></div>

        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="profile-title">Your Profile</h1>
              <p className="text-muted">Manage your account and learning preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="profile-tabs-container">
              <div className="profile-tabs-header">
                <button
                  className={`profile-tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </button>
                <button
                  className={`profile-tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <i className="bi bi-sliders me-2"></i>
                  Learning Preferences
                </button>
                <button
                  className={`profile-tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Learning Stats
                </button>
              </div>

              <div className="profile-tabs-content p-4">
                {activeTab === 'profile' && (
                  <div className="profile-tab">
                    <div className="profile-header-section">
                      <div className="profile-avatar">
                        {currentUser?.name ? currentUser.name.charAt(0) : currentUser?.email?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="mb-1">{currentUser?.name || 'User'}</h3>
                        <p className="text-muted mb-2">{currentUser?.email}</p>
                        <div className="member-badge">
                          <i className="bi bi-award me-1"></i> Member since April 2023
                        </div>
                      </div>
                    </div>

                    <div className="account-info-section mb-4">
                      <h5 className="section-title">Account Information</h5>

                      <div className="info-card">
                        <div className="row mb-3">
                          <div className="col-md-3">
                            <div className="info-label">Name:</div>
                          </div>
                          <div className="col-md-9">
                            <div className="info-value">{currentUser?.name || 'Not set'}</div>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-3">
                            <div className="info-label">Email:</div>
                          </div>
                          <div className="col-md-9">
                            <div className="info-value">{currentUser?.email}</div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-3">
                            <div className="info-label">Member Since:</div>
                          </div>
                          <div className="col-md-9">
                            <div className="info-value">April 2023</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const newName = prompt('Enter your new name:', currentUser?.name || '');
                          if (newName && newName.trim()) {
                            updateProfile({ name: newName.trim() })
                              .then(() => alert('Profile updated successfully!'))
                              .catch(err => {
                                console.error('Error updating profile:', err);
                                alert('Failed to update profile. Please try again.');
                              });
                          }
                        }}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Edit Profile
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          const oldPassword = prompt('Enter your current password:');
                          if (!oldPassword) return;

                          const newPassword = prompt('Enter your new password:');
                          if (!newPassword) return;

                          const confirmPassword = prompt('Confirm your new password:');
                          if (newPassword !== confirmPassword) {
                            alert('Passwords do not match!');
                            return;
                          }

                          changePassword(currentUser, oldPassword, newPassword)
                            .then(() => alert('Password changed successfully!'))
                            .catch(err => {
                              console.error('Error changing password:', err);
                              alert('Failed to change password. Please check your current password and try again.');
                            });
                        }}
                      >
                        <i className="bi bi-key me-2"></i>
                        Change Password
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="preferences-tab">
                  <h5 className="section-title">Learning Preferences</h5>
                  <form onSubmit={handleSavePreferences}>
                    <div className="preference-card">
                      <div className="mb-3">
                        <label htmlFor="learningStyle" className="form-label fw-bold">Learning Style</label>
                        <select
                          className="form-select"
                          id="learningStyle"
                          value={learningStyle}
                          onChange={(e) => setLearningStyle(e.target.value)}
                        >
                          <option value="visual">Visual (images, diagrams, videos)</option>
                          <option value="auditory">Auditory (lectures, discussions)</option>
                          <option value="reading">Reading/Writing (books, articles)</option>
                          <option value="kinesthetic">Hands-on (projects, practice)</option>
                        </select>
                        <div className="form-text mt-2">
                          <i className="bi bi-info-circle me-1"></i>
                          This helps us tailor learning plans to your preferred way of learning.
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="pacePreference" className="form-label fw-bold">Learning Pace</label>
                        <select
                          className="form-select"
                          id="pacePreference"
                          value={pacePreference}
                          onChange={(e) => setPacePreference(e.target.value)}
                        >
                          <option value="slow">Slow & Thorough</option>
                          <option value="moderate">Moderate</option>
                          <option value="fast">Fast-paced</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="difficultyPreference" className="form-label fw-bold">Difficulty Preference</label>
                        <select
                          className="form-select"
                          id="difficultyPreference"
                          value={difficultyPreference}
                          onChange={(e) => setDifficultyPreference(e.target.value)}
                        >
                          <option value="beginner">Beginner-friendly</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="challenging">Challenging</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="preference-card">
                      <label className="form-label fw-bold mb-3">Your Interests</label>
                      <div className="d-flex mb-3">
                        <input
                          type="text"
                          className="form-control me-2"
                          placeholder="Add a new interest"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            borderRadius: "var(--radius-full)",
                            padding: "0.5rem 1.25rem"
                          }}
                          onClick={handleAddInterest}
                          disabled={!newInterest.trim()}
                        >
                          <i className="bi bi-plus-lg me-1"></i> Add
                        </button>
                      </div>
                      <div className="d-flex flex-wrap mb-3">
                        {interests.map((interest, index) => (
                          <div key={index} className="interest-tag">
                            {interest}
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() => handleRemoveInterest(interest)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                        {interests.length === 0 && (
                          <p className="text-muted fst-italic mb-0">No interests added yet</p>
                        )}
                      </div>
                      <div className="form-text">
                        <i className="bi bi-lightbulb me-1"></i>
                        Your interests help us recommend relevant learning plans.
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                          background: "linear-gradient(135deg, var(--primary-color), var(--primary-dark))",
                          border: "none",
                          boxShadow: "0 4px 10px rgba(67, 97, 238, 0.2)",
                          transition: "all 0.3s ease",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "var(--radius-full)"
                        }}
                      >
                        <i className="bi bi-check2-circle me-2"></i>
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}

                {activeTab === 'stats' && (
                  <div className="stats-tab">
                  <h5 className="section-title">Your Learning Statistics</h5>

                  <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                      <div className="stats-card text-center">
                        <div className="stat-value">2</div>
                        <p className="text-muted mb-0">Active Plans</p>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="stats-card text-center">
                        <div className="stat-value">48%</div>
                        <p className="text-muted mb-0">Average Progress</p>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="stats-card text-center">
                        <div className="stat-value">7</div>
                        <p className="text-muted mb-0">Steps Completed</p>
                      </div>
                    </div>
                  </div>

                  <div className="stats-card mb-4">
                    <h6 className="mb-3 fw-bold">
                      <i className="bi bi-calendar-check me-2" style={{ color: "var(--primary-color)" }}></i>
                      Learning Activity
                    </h6>
                    <div className="mb-3">
                      <label className="form-label">Last 30 Days</label>
                      <div className="d-flex gap-1" style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        {Array.from({ length: 30 }).map((_, index) => {
                          const activity = Math.floor(Math.random() * 4); // 0-3 for demo
                          return (
                            <div
                              key={index}
                              className="flex-grow-1"
                              style={{
                                height: '24px',
                                backgroundColor: activity === 0 ? 'rgba(67, 97, 238, 0.1)' :
                                                 activity === 1 ? 'rgba(67, 97, 238, 0.3)' :
                                                 activity === 2 ? 'rgba(67, 97, 238, 0.6)' : 'var(--primary-color)',
                                transition: 'all 0.3s ease'
                              }}
                              title={`Day ${index + 1}: ${activity} activities`}
                            ></div>
                          );
                        })}
                      </div>
                      <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">30 days ago</small>
                        <small className="text-muted">Today</small>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
