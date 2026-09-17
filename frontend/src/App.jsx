
import { useEffect, useState } from 'react';

const statuses = ['pending', 'running', 'completed', 'failed'];
const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://airth-assignment-1.onrender.com').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadJobs() {
    try {
      setError('');
      setLoading(true);
      setJobs(await request('/jobs'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchJobs() {
      try {
        setJobs(await request('/jobs'));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  function handleFormChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function createJob(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.type.trim()) {
      setError('Title and type are required');
      return;
    }

    try {
      setError('');
      setSaving(true);
      const newJob = await request('/jobs', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setJobs([newJob, ...jobs]);
      setForm({ title: '', type: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      setError('');
      await request(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setJobs(jobs.map((job) => job.id === id ? { ...job, status } : job));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteJob(id) {
    try {
      setError('');
      await request(`/jobs/${id}`, { method: 'DELETE' });
      setJobs(jobs.filter((job) => job.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const visibleJobs = filter === 'all' ? jobs : jobs.filter((job) => job.status === filter);

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Jobs</p>
          <h1>Job dashboard</h1>
        </div>
        <button className="refresh-button" type="button" onClick={loadJobs}>Refresh</button>
      </header>

      {error && <div className="error" role="alert">{error}</div>}

      <section className="summary" aria-label="Job counts">
        <div className="summary-item"><span>All</span><strong>{jobs.length}</strong></div>
        {statuses.map((status) => (
          <div className="summary-item" key={status}>
            <span>{status}</span>
            <strong>{jobs.filter((job) => job.status === status).length}</strong>
          </div>
        ))}
      </section>

      <section className="content-grid">
        <form className="panel create-form" onSubmit={createJob}>
          <h2>Create a job</h2>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleFormChange} placeholder="Backend developer" />
          </label>
          <label>
            Type
            <input name="type" value={form.type} onChange={handleFormChange} placeholder="Full-time" />
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create job'}
          </button>
        </form>

        <section className="panel jobs-panel">
          <div className="jobs-heading">
            <h2>Jobs</h2>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter jobs by status">
              <option value="all">All statuses</option>
              {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
            </select>
          </div>

          {loading ? <p className="empty-state">Loading jobs...</p> : visibleJobs.length === 0 ? (
            <p className="empty-state">No jobs found.</p>
          ) : (
            <div className="job-list">
              {visibleJobs.map((job) => (
                <article className="job-row" key={job.id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.type} · Created {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="job-actions">
                    <select value={job.status} onChange={(event) => changeStatus(job.id, event.target.value)} aria-label={`Change status for ${job.title}`}>
                      {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
                    </select>
                    <button className="delete-button" type="button" onClick={() => deleteJob(job.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
