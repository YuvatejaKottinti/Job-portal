import { useEffect, useState } from "react";
import "./App.css";

const API = "https://job-portal-yaj9.onrender.com/api";

function App() {
  const [page, setPageState] = useState(
    localStorage.getItem("jobPortalPage") || "home"
  );

  const setPage = (newPage) => {
    setPageState(newPage);
    localStorage.setItem("jobPortalPage", newPage);
  };

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(() => {
  const savedJob = localStorage.getItem("selectedJob");
  return savedJob ? JSON.parse(savedJob) : null;
});
  // =========================
  // CURRENT USER
  // =========================

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem("currentUser");
      }
    }

    return null;
  });

  const [search, setSearch] = useState("");

  // =========================
  // FORMS
  // =========================

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    skills: "",
    salary: "",
  });

  const [editingJobId, setEditingJobId] = useState(null);

  const [applicationForm, setApplicationForm] = useState({
    applicantName: "",
    email: "",
    phone: "",
    resume: "",
  });

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  useEffect(() => {
  if (currentUser?.email) {
    fetchMyApplications();
  } else {
    setMyApplications([]);
  }
}, [currentUser]);

  // =========================
  // SAVE LOGIN
  // =========================

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API}/jobs`);

      if (!response.ok) {
        throw new Error("Failed to load jobs");
      }

      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Jobs error:", error);
    }
  };

// =========================
// FETCH APPLICATIONS
// =========================

const fetchApplications = async () => {
  try {
    const response = await fetch(`${API}/applications`);

    if (!response.ok) {
      throw new Error("Failed to load applications");
    }

    const data = await response.json();
    setApplications(data);
  } catch (error) {
    console.error("Applications error:", error);
  }
};

const fetchMyApplications = async () => {
  if (!currentUser?.email) {
    setMyApplications([]);
    return;
  }

  try {
    const response = await fetch(
      `${API}/applications/user/${encodeURIComponent(
        currentUser.email
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to load your applications");
    }

    const data = await response.json();
    setMyApplications(data);
  } catch (error) {
    console.error("My applications error:", error);
  }
};
  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: String(data.role || "USER").toUpperCase(),
      };

      setCurrentUser(user);

      setLoginForm({
        email: "",
        password: "",
      });

      alert("Login successful!");

      setPage("home");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const user = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: "USER",
      };

      const response = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      alert("Registration successful! Please login.");

      setRegisterForm({
        name: "",
        email: "",
        password: "",
      });

      setPage("login");
    } catch (error) {
      console.error("Register error:", error);
      alert(error.message);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setSelectedJob(null);
    setPage("home");
  };

  // =========================
  // ADD JOB
  // =========================

  const handleAddJob = async (e) => {
    e.preventDefault();

    if (currentUser?.role !== "ADMIN") {
      alert("Only administrators can add jobs.");
      return;
    }

    try {
      const response = await fetch(`${API}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobForm),
      });

      if (!response.ok) {
        throw new Error("Failed to add job");
      }

      alert("Job added successfully!");

      clearJobForm();

      await fetchJobs();

      setPage("jobs");
    } catch (error) {
      console.error("Add job error:", error);
      alert(error.message);
    }
  };

  // =========================
  // CLEAR JOB FORM
  // =========================

  const clearJobForm = () => {
    setJobForm({
      title: "",
      company: "",
      location: "",
      description: "",
      skills: "",
      salary: "",
    });

    setEditingJobId(null);
  };

  // =========================
  // EDIT JOB
  // =========================

  const editJob = (job) => {
    if (currentUser?.role !== "ADMIN") {
      alert("Only administrators can edit jobs.");
      return;
    }

    setEditingJobId(job.id);

    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      description: job.description || "",
      skills: job.skills || "",
      salary: job.salary || "",
    });

    setPage("add-job");
  };

  // =========================
  // UPDATE JOB
  // =========================

  const handleUpdateJob = async (e) => {
    e.preventDefault();

    if (currentUser?.role !== "ADMIN") {
      alert("Only administrators can update jobs.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/jobs/${editingJobId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jobForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update job");
      }

      alert("Job updated successfully!");

      clearJobForm();

      await fetchJobs();

      setPage("jobs");
    } catch (error) {
      console.error("Update job error:", error);
      alert(error.message);
    }
  };

  // =========================
  // DELETE JOB
  // =========================

  const deleteJob = async (id) => {
    if (currentUser?.role !== "ADMIN") {
      alert("Only administrators can delete jobs.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API}/jobs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      alert("Job deleted successfully!");

      await fetchJobs();

      if (selectedJob?.id === id) {
        setSelectedJob(null);
        setPage("jobs");
      }
    } catch (error) {
      console.error("Delete job error:", error);
      alert(error.message);
    }
  };

  // =========================
  // APPLY
  // =========================

  const handleApplication = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login before applying.");
      setPage("login");
      return;
    }

    try {
      const application = {
        applicantName: applicationForm.applicantName,
        email: applicationForm.email,
        phone: applicationForm.phone,
        resume: applicationForm.resume,
        jobId: selectedJob.id,
      };

      const response = await fetch(`${API}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(application),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Application failed"
        );
      }

      alert("Application submitted successfully!");

      setApplicationForm({
        applicantName: "",
        email: "",
        phone: "",
        resume: "",
      });

      await fetchApplications();
await fetchMyApplications();

setSelectedJob(null);
setPage("jobs");
    } catch (error) {
      console.error("Application error:", error);
      alert(error.message);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredJobs = jobs.filter((job) => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return true;
    }

    return (
      job.title?.toLowerCase().includes(text) ||
      job.company?.toLowerCase().includes(text) ||
      job.location?.toLowerCase().includes(text) ||
      job.skills?.toLowerCase().includes(text)
    );
  });
// =========================
// NAVBAR
// =========================

const Navbar = () => {
  return (
    <nav className="navbar">

      <div
        className="logo"
        onClick={() => setPage("home")}
      >
        <span className="logo-icon">🎯</span>{" "}
        <span className="logo-job">Job</span>{" "}
        <span className="logo-portal">Portal</span>
      </div>


      <div className="nav-buttons">

        {/* HOME */}

        <button
          type="button"
          onClick={() => setPage("home")}
        >
          Home
        </button>


        {/* JOBS DROPDOWN */}

        <div className="nav-dropdown">

          <button
            type="button"
            className="dropdown-btn"
          >
            Jobs ▾
          </button>

          <div className="dropdown-menu">

            <button
              type="button"
              onClick={() => setPage("jobs")}
            >
              Jobs
            </button>

            {currentUser?.role === "ADMIN" && (
              <button
                type="button"
                onClick={() => {
                  clearJobForm();
                  setPage("add-job");
                }}
              >
                Add Job
              </button>
            )}

          </div>

        </div>


        {/* MY APPLICATIONS DROPDOWN */}

        {currentUser && (
          <div className="nav-dropdown">

            <button
              type="button"
              className="dropdown-btn"
            >
              My Applications ▾
            </button>

            <div className="dropdown-menu">

              <button
                type="button"
                onClick={() =>
                  setPage("my-applications")
                }
              >
                My Applications
              </button>

              {currentUser.role === "ADMIN" && (
                <button
                  type="button"
                  onClick={() =>
                    setPage("applications")
                  }
                >
                  Applications
                </button>
              )}

            </div>

          </div>
        )}


        {/* ADMIN DASHBOARD */}

        {currentUser?.role === "ADMIN" && (
          <button
            type="button"
            onClick={() => setPage("admin-dashboard")}
          >
            Dashboard
          </button>
        )}


        {/* PROFILE + LOGIN */}

        {currentUser ? (
          <>
            <button
              type="button"
              onClick={() => setPage("profile")}
            >
              Profile
            </button>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setPage("login")}
            >
              Login
            </button>

            <button
              type="button"
              className="register-nav-btn"
              onClick={() => setPage("register")}
            >
              Register
            </button>
          </>
        )}

      </div>
    </nav>
  );
};

 // =========================
// HOME
// =========================

const HomePage = () => {
  return (
    <>
      <section className="hero">
        <div className="hero-content">

          <span className="hero-badge">
            🚀 Your Career Starts Here
          </span>

          <h1>
            Find Your
            <span> Dream Job</span>
          </h1>

          <p>
            Discover the right opportunities, connect with
            great companies, and build your career.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="hero-btn"
              onClick={() => setPage("jobs")}
            >
              Browse Jobs →
            </button>

            {!currentUser && (
              <button
                type="button"
                className="hero-secondary-btn"
                onClick={() => setPage("register")}
              >
                Create Account
              </button>
            )}
          </div>

        </div>
      </section>


      {/* SEARCH */}

      <section className="home-search">
        <div className="home-search-box">

          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className="search-btn"
            onClick={() => setPage("jobs")}
          >
            Search
          </button>

        </div>
      </section>


      {/* STATS */}

      <section className="stats">

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <h2>{jobs.length}+</h2>
          <p>Available Jobs</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <h2>{applications.length}+</h2>
          <p>Applications</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌎</div>
          <h2>24/7</h2>
          <p>Career Opportunities</p>
        </div>

      </section>


      {/* LATEST JOBS */}

      <section className="page-section">

        <div className="page-header">

          <div>
            <span className="section-label">
              OPPORTUNITIES
            </span>

            <h2>Latest Jobs</h2>

            <p>
              Explore the latest opportunities and find a
              position that matches your skills.
            </p>
          </div>

          <button
            type="button"
            className="view-btn"
            onClick={() => setPage("jobs")}
          >
            View All Jobs →
          </button>

        </div>


        <div className="jobs-grid">

          {jobs.length === 0 ? (
            <p>No jobs available right now.</p>
          ) : (
            jobs.slice(0, 3).map((job) =>
              JobCard({ job })
            )
          )}

        </div>

      </section>


      {/* WHY CHOOSE US */}

      <section className="why-section">

        <div className="why-header">
          <span className="section-label">
            WHY JOB PORTAL?
          </span>

          <h2>Everything You Need for Your Career</h2>

          <p>
            A simple platform to discover opportunities and
            manage your job applications.
          </p>
        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon">🔎</div>
            <h3>Find Opportunities</h3>
            <p>
              Search and explore jobs based on your skills,
              location, and career goals.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">⚡</div>
            <h3>Apply Easily</h3>
            <p>
              Submit applications quickly and keep track of
              your application status.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">📊</div>
            <h3>Track Applications</h3>
            <p>
              Monitor your applications and see updates from
              employers in one place.
            </p>
          </div>

        </div>

      </section>


      {Footer()}
    </>
  );
};

  // =========================
  // JOB CARD
  // =========================

  const JobCard = ({ job }) => {
    return (
      <div className="job-card">
        <div className="job-header">
          <div>
            <h3>{job.title}</h3>

            <p className="company">
              {job.company}
            </p>
          </div>

          <p className="salary">
            {job.salary}
          </p>
        </div>

        <p>📍 {job.location}</p>

        <p>{job.description}</p>

        <p>
          <strong>Skills:</strong>{" "}
          {job.skills}
        </p>

        <div className="job-actions">
          <button
            type="button"
            className="view-btn"
            onClick={() => {
              setSelectedJob(job);
localStorage.setItem("selectedJob", JSON.stringify(job));
setPage("job-details");
            }}
          >
            View
          </button>

          {currentUser?.role === "ADMIN" && (
            <>
              <button
                type="button"
                className="edit-btn"
                onClick={() => editJob(job)}
              >
                Edit
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={() => deleteJob(job.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // =========================
  // JOBS PAGE
  // =========================

  const JobsPage = () => {
    return (
      <section className="page-section">
        <div className="page-header">
          <div>
            <h2>Available Jobs</h2>

            <p>
              Find opportunities that match your skills.
            </p>

            <p className="job-count">
              {filteredJobs.length} jobs found
            </p>
          </div>

          {currentUser?.role === "ADMIN" && (
            <button
              type="button"
              className="add-job"
              onClick={() => {
                clearJobForm();
                setPage("add-job");
              }}
            >
              + Add Job
            </button>
          )}
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="jobs-grid">
          {filteredJobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
              />
            ))
          )}
        </div>
      </section>
    );
  };

  // =========================
// JOB DETAILS
// =========================

const JobDetailsPage = () => {
  if (!selectedJob) {
    return (
      <section className="page-section">
        <div className="job-details">
          <h2>Job not found</h2>

          <button
            type="button"
            className="view-btn"
            onClick={() => setPage("jobs")}
          >
            Back to Jobs
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">

      <div className="job-details">

        {/* JOB HEADER */}
        <div className="job-details-header">

          <div>
            <span className="job-details-label">
              Job Opportunity
            </span>

            <h2>
              {selectedJob.title}
            </h2>

            <h3>
              {selectedJob.company}
            </h3>
          </div>

          <div className="job-details-salary">
            {selectedJob.salary}
          </div>

        </div>


        {/* JOB INFORMATION */}
        <div className="job-details-info">

          <div className="job-info-item">
            <span className="info-icon">📍</span>

            <div>
              <span>Location</span>

              <strong>
                {selectedJob.location}
              </strong>
            </div>
          </div>


          <div className="job-info-item">
            <span className="info-icon">💰</span>

            <div>
              <span>Salary</span>

              <strong>
                {selectedJob.salary}
              </strong>
            </div>
          </div>


          <div className="job-info-item">
            <span className="info-icon">💼</span>

            <div>
              <span>Company</span>

              <strong>
                {selectedJob.company}
              </strong>
            </div>
          </div>

        </div>


        {/* SKILLS */}
        <div className="job-details-section">

          <h3>
            Required Skills
          </h3>

          <div className="job-skills">

            {selectedJob.skills
              ? selectedJob.skills
                  .split(",")
                  .map((skill, index) => (
                    <span
                      className="skill-tag"
                      key={`${skill.trim()}-${index}`}
                    >
                      {skill.trim()}
                    </span>
                  ))
              : (
                <span className="skill-tag">
                  Not specified
                </span>
              )}

          </div>

        </div>


        {/* DESCRIPTION */}
        <div className="job-details-section">

          <h3>
            Job Description
          </h3>

          <p className="job-description">
            {selectedJob.description}
          </p>

        </div>


        {/* ACTIONS */}
        <div className="details-actions">

          <button
            type="button"
            className="apply-btn"
            onClick={() => {

              if (!currentUser) {
                alert(
                  "Please login before applying."
                );

                setPage("login");

                return;
              }

              setApplicationForm({
                applicantName:
                  currentUser.name || "",

                email:
                  currentUser.email || "",

                phone: "",

                resume: "",
              });

              setPage("apply");
            }}
          >
            Apply Now
          </button>


          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setSelectedJob(null);

              setPage("jobs");
            }}
          >
            ← Back to Jobs
          </button>

        </div>

      </div>

    </section>
  );
};

  // =========================
  // APPLY PAGE
  // =========================

  const ApplyPage = () => {
    if (!selectedJob) {
      return (
        <section className="page-section">
          <h2>No job selected</h2>

          <button
            type="button"
            className="view-btn"
            onClick={() => setPage("jobs")}
          >
            Back to Jobs
          </button>
        </section>
      );
    }

    return (
 <section className="page-section">

  <div className="apply-header">
    <h2>
      Apply for {selectedJob.title}
    </h2>

    <p>
      Complete the form below to apply for this position.
    </p>
  </div>

  <div className="apply-job-info">

    <div className="apply-job-item">
      <span>🏢 Company</span>
      <strong>{selectedJob.company}</strong>
    </div>

    <div className="apply-job-item">
      <span>📍 Location</span>
      <strong>{selectedJob.location}</strong>
    </div>

    <div className="apply-job-item">
      <span>💰 Salary</span>
      <strong>{selectedJob.salary}</strong>
    </div>

    <div className="apply-job-item">
      <span>🛠️ Skills</span>
      <strong>{selectedJob.skills}</strong>
    </div>

  </div>

  <form
    className="apply-form"
    onSubmit={handleApplication}
  >
          <input
            type="tel"
            placeholder="Phone"
            value={applicationForm.phone}
            onChange={(e) =>
              setApplicationForm({
                ...applicationForm,
                phone: e.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Resume link"
            value={applicationForm.resume}
            onChange={(e) =>
              setApplicationForm({
                ...applicationForm,
                resume: e.target.value,
              })
            }
            required
          />

          <div className="form-buttons">
            <button
              type="submit"
              className="submit-btn"
            >
              Submit Application
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => setPage("job-details")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  };

  // =========================
  // ADD / EDIT JOB
  // =========================

  const AddJobPage = () => {
    if (currentUser?.role !== "ADMIN") {
      return (
        <section className="page-section">
          <h2>Access Denied</h2>

          <p>
            Only administrators can add or edit jobs.
          </p>

          <button
            type="button"
            className="view-btn"
            onClick={() => setPage("home")}
          >
            Go Home
          </button>
        </section>
      );
    }

    return (
      <section className="page-section">
        <h2>
          {editingJobId
            ? "Edit Job"
            : "Add New Job"}
        </h2>

        <form
          className="apply-form"
          onSubmit={
            editingJobId
              ? handleUpdateJob
              : handleAddJob
          }
        >
          <input
            type="text"
            placeholder="Job Title"
            value={jobForm.title}
            onChange={(e) =>
              setJobForm({
                ...jobForm,
                title: e.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Company"
            value={jobForm.company}
            onChange={(e) =>
              setJobForm({
                ...jobForm,
                company: e.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={jobForm.location}
            onChange={(e) =>
              setJobForm({
                ...jobForm,
                location: e.target.value,
              })
            }
            required
          />

          <textarea
            placeholder="Job Description"
            value={jobForm.description}
            onChange={(e) =>
              setJobForm({
                ...jobForm,
                description: e.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Skills"
            value={jobForm.skills}
            onChange={(e) =>
              setJobForm({
                ...jobForm,
                skills: e.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Salary"
            value={jobForm.salary}
            onChange={(e) =>
              setJobForm({
                ...jobForm,
                salary: e.target.value,
              })
            }
            required
          />

          <div className="form-buttons">
            <button
              type="submit"
              className="submit-btn"
            >
              {editingJobId
                ? "Update Job"
                : "Add Job"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                clearJobForm();
                setPage("jobs");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  };

  // =========================
// MY APPLICATIONS PAGE
// =========================

const MyApplicationsPage = () => {
  if (!currentUser) {
    return (
      <section className="page-section">
        <h2>Please Login</h2>

        <p>
          Please login to view your applications.
        </p>

        <button
          type="button"
          className="view-btn"
          onClick={() => setPage("login")}
        >
          Login
        </button>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>My Applications</h2>

          <p>
            Jobs you have applied for.
          </p>

          <p className="application-count">
            Total Applications: {myApplications.length}
          </p>
        </div>
      </div>

      {myApplications.length === 0 ? (
        <div className="no-applications">
          <h3>No applications yet</h3>

          <p>
            You haven't applied for any jobs yet.
          </p>

          <button
            type="button"
            className="view-btn"
            onClick={() => setPage("jobs")}
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="applications">
          {myApplications.map((application) => {
            const job = jobs.find(
              (item) =>
                Number(item.id) === Number(application.jobId)
            );

            const status =
              application.status || "APPLIED";

            return (
              <div
                className="application-card"
                key={application.id}
              >
                <h3>
                  {job
                    ? job.title
                    : `Job #${application.jobId}`}
                </h3>

                {job && (
                  <>
                    <p>
                      <strong>Company:</strong>{" "}
                      {job.company}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {job.location}
                    </p>

                    <p>
                      <strong>Salary:</strong>{" "}
                      {job.salary}
                    </p>
                  </>
                )}

                <p>
                  <strong>Applicant:</strong>{" "}
                  {application.applicantName}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {application.email}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {application.phone}
                </p>

                <p>
                  <strong>Resume:</strong>{" "}
                  {application.resume}
                </p>

                <div className="application-status">
                  <strong>Status:</strong>

                  <span
                    className={`status-badge status-${status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};



// =========================
// APPLICATIONS PAGE
// =========================

const ApplicationsPage = () => {
  if (currentUser?.role !== "ADMIN") {
    return (
      <section className="page-section">
        <h2>Access Denied</h2>

        <p>
          Only administrators can view applications.
        </p>
      </section>
    );
  }

  // =========================
  // UPDATE APPLICATION STATUS
  // =========================

  const updateApplicationStatus = async (
    applicationId,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `${API}/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchApplications();

      alert("Application status updated!");
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.message);
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Applications</h2>

          <p className="application-count">
            Total Applications:{" "}
            {applications.length}
          </p>
        </div>
      </div>

      <div className="applications">
        {applications.length === 0 ? (
          <div className="no-applications">
            <h3>No applications yet</h3>

            <p>
              Applications submitted by users will
              appear here.
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <div
              className="application-card"
              key={application.id}
            >
              <h3>
                {application.applicantName}
              </h3>

              <p>
                <strong>Email:</strong>{" "}
                {application.email}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {application.phone}
              </p>

              <p>
                <strong>Resume:</strong>{" "}
                {application.resume}
              </p>

              <p>
                <strong>Job ID:</strong>{" "}
                {application.jobId}
              </p>

              <p>
                <strong>Current Status:</strong>{" "}
                {application.status || "APPLIED"}
              </p>

              <div className="status-control">
                <label>
                  <strong>Update Status:</strong>
                </label>

                <select
                  value={
                    application.status || "APPLIED"
                  }
                  onChange={(e) =>
                    updateApplicationStatus(
                      application.id,
                      e.target.value
                    )
                  }
                >
                  <option value="APPLIED">
                    Applied
                  </option>

                  <option value="UNDER REVIEW">
                    Under Review
                  </option>

                  <option value="SHORTLISTED">
                    Shortlisted
                  </option>

                  <option value="SELECTED">
                    Selected
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};


// =========================
// ADMIN DASHBOARD
// =========================

const AdminDashboard = () => {
  // Allow only ADMIN users
  if (currentUser?.role !== "ADMIN") {
    return (
      <section className="page-section">
        <h2>Access Denied</h2>

        <p>
          Only administrators can view the dashboard.
        </p>
      </section>
    );
  }

  // =========================
  // DASHBOARD COUNTS
  // =========================

  const totalJobs = jobs.length;

  const totalApplications = applications.length;

  const appliedCount = applications.filter(
    (application) =>
      (application.status || "APPLIED") === "APPLIED"
  ).length;

  const reviewCount = applications.filter(
    (application) =>
      (application.status || "APPLIED") === "UNDER REVIEW"
  ).length;

  const shortlistedCount = applications.filter(
    (application) =>
      (application.status || "APPLIED") === "SHORTLISTED"
  ).length;

  const selectedCount = applications.filter(
    (application) =>
      (application.status || "APPLIED") === "SELECTED"
  ).length;

  const rejectedCount = applications.filter(
    (application) =>
      (application.status || "APPLIED") === "REJECTED"
  ).length;

  // =========================
  // DASHBOARD
  // =========================

  return (
    <section className="page-section">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>

          <p>
            Manage your Job Portal and monitor applications.
          </p>
        </div>
      </div>

      {/* MAIN STATISTICS */}
      <div className="dashboard-grid">

        {/* TOTAL JOBS */}
        <div className="dashboard-card">
          <div className="dashboard-icon">
            💼
          </div>

          <div>
            <h3>Total Jobs</h3>

            <strong>
              {totalJobs}
            </strong>

            <p>
              Available jobs
            </p>
          </div>
        </div>

        {/* TOTAL APPLICATIONS */}
        <div className="dashboard-card">
          <div className="dashboard-icon">
            📄
          </div>

          <div>
            <h3>Total Applications</h3>

            <strong>
              {totalApplications}
            </strong>

            <p>
              Applications received
            </p>
          </div>
        </div>

        {/* SELECTED */}
        <div className="dashboard-card">
          <div className="dashboard-icon">
            🟢
          </div>

          <div>
            <h3>Selected</h3>

            <strong>
              {selectedCount}
            </strong>

            <p>
              Selected candidates
            </p>
          </div>
        </div>

        {/* UNDER REVIEW */}
        <div className="dashboard-card">
          <div className="dashboard-icon">
            🔵
          </div>

          <div>
            <h3>Under Review</h3>

            <strong>
              {reviewCount}
            </strong>

            <p>
              Applications under review
            </p>
          </div>
        </div>

        {/* SHORTLISTED */}
        <div className="dashboard-card">
          <div className="dashboard-icon">
            🟣
          </div>

          <div>
            <h3>Shortlisted</h3>

            <strong>
              {shortlistedCount}
            </strong>

            <p>
              Shortlisted candidates
            </p>
          </div>
        </div>

        {/* REJECTED */}
        <div className="dashboard-card">
          <div className="dashboard-icon">
            🔴
          </div>

          <div>
            <h3>Rejected</h3>

            <strong>
              {rejectedCount}
            </strong>

            <p>
              Rejected applications
            </p>
          </div>
        </div>

      </div>

      {/* APPLICATION STATUS SUMMARY */}
      <div className="dashboard-section">

        <h3>
          Application Status Summary
        </h3>

        <div className="status-summary">

          <div className="summary-item">
            <span>
              Applied
            </span>

            <strong>
              {appliedCount}
            </strong>
          </div>

          <div className="summary-item">
            <span>
              Under Review
            </span>

            <strong>
              {reviewCount}
            </strong>
          </div>

          <div className="summary-item">
            <span>
              Shortlisted
            </span>

            <strong>
              {shortlistedCount}
            </strong>
          </div>

          <div className="summary-item">
            <span>
              Selected
            </span>

            <strong>
              {selectedCount}
            </strong>
          </div>

          <div className="summary-item">
            <span>
              Rejected
            </span>

            <strong>
              {rejectedCount}
            </strong>
          </div>

        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="dashboard-section">

      {/* =========================
    RECENT APPLICATIONS
========================= */}

<div className="dashboard-section">

  <h3>Recent Applications</h3>

  {applications.length === 0 ? (
    <p className="no-applications">
      No applications yet.
    </p>
  ) : (
    <div className="recent-applications">

      {applications
        .slice()
        .reverse()
        .slice(0, 5)
        .map((application) => {

          const job = jobs.find(
            (item) => item.id === application.jobId
          );

          const status =
            application.status || "APPLIED";

          return (
            <div
              className="recent-application"
              key={application.id}
            >

              <div className="recent-application-info">

                <h4>
                  {application.applicantName}
                </h4>

                <p>
                  {application.email}
                </p>

                <p>
                  <strong>Job:</strong>{" "}
                  {job
                    ? job.title
                    : `Job #${application.jobId}`}
                </p>

              </div>

              <span
                className={`status-badge status-${status
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {status}
              </span>

            </div>
          );
        })}

    </div>
  )}

</div>

        <h3>
          Quick Actions
        </h3>

        <div className="dashboard-actions">

          <button
            type="button"
            className="view-btn"
            onClick={() => {
              clearJobForm();
              setPage("add-job");
            }}
          >
            + Add New Job
          </button>

          <button
            type="button"
            className="view-btn"
            onClick={() => setPage("jobs")}
          >
            💼 Manage Jobs
          </button>

          <button
            type="button"
            className="view-btn"
            onClick={() => setPage("applications")}
          >
            📄 View Applications
          </button>

        </div>

      </div>

    </section>
  );
};
  // =========================
  // LOGIN PAGE
  // =========================

  const LoginPage = () => {
    return (
      <section className="page-section auth-section">
        <div className="login-form">
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value,
                })
              }
              required
            />

            <button
              type="submit"
              className="submit-btn"
            >
              Login
            </button>
          </form>

          <p className="register-link">
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => setPage("register")}
            >
              Register
            </button>
          </p>
        </div>
      </section>
    );
  };

  // =========================
  // REGISTER PAGE
  // =========================

  const RegisterPage = () => {
    return (
      <section className="page-section auth-section">
        <div className="register-form">
          <h2>Create Account</h2>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  name: e.target.value,
                })
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  password: e.target.value,
                })
              }
              required
            />

            <button
              type="submit"
              className="submit-btn"
            >
              Register
            </button>
          </form>

          <p className="login-link">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() => setPage("login")}
            >
              Login
            </button>
          </p>
        </div>
      </section>
    );
  };

  // =========================
  // PROFILE
  // =========================

  const ProfilePage = () => {
    if (!currentUser) {
      return (
        <section className="page-section">
          <div className="profile-card">
            <h2>Please Login</h2>

            <p>
              You need to login to view your profile.
            </p>

            <button
              type="button"
              className="view-btn"
              onClick={() => setPage("login")}
            >
              Login
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="page-section profile-section">
        <div className="profile-card">
          <div className="profile-icon">
            👤
          </div>

          <h2>{currentUser.name}</h2>

          <div className="profile-info">
            <p>
              <strong>Email:</strong>{" "}
              {currentUser.email}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              <span className="role-badge">
                {currentUser.role}
              </span>
            </p>
          </div>

          {currentUser.role === "ADMIN" ? (
            <p className="admin-message">
              You are logged in as an administrator.
            </p>
          ) : (
            <p>
              You are logged in as a normal user.
            </p>
          )}

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>
    );
  };

  // =========================
  // FOOTER
  // =========================

  const Footer = () => {
    return (
      <footer className="footer">
        <p>
          © 2026 Job Portal. All rights reserved.
        </p>
      </footer>
    );
  };

  // =========================
  // PAGE ROUTING
  // =========================

  const renderPage = () => {
    switch (page) {
      case "home":
        return HomePage();

      case "jobs":
        return JobsPage();

      case "job-details":
        return JobDetailsPage();

      case "apply":
        return ApplyPage();

      case "add-job":
        return AddJobPage();

      case "applications":
        return ApplicationsPage();

      case "admin-dashboard":
  return AdminDashboard();

      case "my-applications":
  return MyApplicationsPage();

      case "login":
        return LoginPage();

      case "register":
        return RegisterPage();

      case "profile":
        return ProfilePage();

      default:
        return HomePage();
    }
  };

  // =========================
  // APP
  // =========================

  return (
    <>
      {Navbar()}

      <main>{renderPage()}</main>
    </>
  );
}

export default App;