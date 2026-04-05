import { useState, useEffect } from 'react';
import { userAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminUsers() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Security Check: Only admins allowed
  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAdminUsers();
      setUsers(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError('Failed to load user database. Please ensure you have admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;

  return (
    <div className="admin-container">
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="cyber-title" style={{ margin: 0, fontSize: '2rem' }}>🛡️ User Database</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
              Full access to registered platform users.
            </p>
          </div>
          
          <div className="stats-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--accent-blue)' }}>
            <b>{users.length}</b> Total Registered
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="glass-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem' }}
          />
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* User Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Joined Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="table-row-hover">
                    <td style={{ fontWeight: '600' }}>{u.full_name}</td>
                    <td style={{ color: 'var(--accent-blue)' }}>{u.email}</td>
                    <td>{u.phone || <em style={{ opacity: 0.5 }}>Not set</em>}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${u.is_admin ? 'admin' : 'user'}`}>
                        {u.is_admin ? '🛡️ Admin' : '👤 User'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
