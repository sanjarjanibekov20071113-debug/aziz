import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://69b6d87b583f543fbd9eb074.mockapi.io/grades'; 

const usersDb = {
  admin: { id: "101", email: 'admin@gmail.com', pass: 'admin123', name: 'Wade Warren', role: 'System Administrator', avatar: '😎' },
  student1: { id: "303", email: 'student@gmail.com', pass: 'stud2026', name: 'Аманкелди Т.', role: 'Student', avatar: '🎓' },
  student2: { id: "404", email: 'ivan@gmail.com', pass: 'ivan2026', name: 'Иван Иванов', role: 'Student', avatar: '🧑‍🎓' },
  student3: { id: "505", email: 'damir@gmail.com', pass: 'damir2026', name: 'Дамир С.', role: 'Student', avatar: '👨‍🎓' },
  student4: { id: "606", email: 'alina@gmail.com', pass: 'alina2026', name: 'Алина М.', role: 'Student', avatar: '👩‍🎓' }
};

const subjects = ['Mathematics', 'Russian', 'English'];
const days = Array.from({ length: 15 }, (_, i) => i + 1);

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('wave_user_v12');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setGrades(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (currentUser) fetchGrades(); }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('wave_user_v12', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  const handleGradeChange = async (studentId, day, value) => {
    if (currentUser.role !== 'System Administrator') return;
    const existing = grades.find(g => g.studentId === studentId && g.day === day && g.subject === selectedSubject);
    try {
      if (value === "") {
        if (existing) await fetch(`${API_URL}/${existing.id}`, { method: 'DELETE' });
      } else if (existing) {
        await fetch(`${API_URL}/${existing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value })
        });
      } else {
        await fetch(API_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, day, subject: selectedSubject, value })
        });
      }
      fetchGrades();
    } catch (e) { alert("Ошибка сервера"); }
  };

  const calculateAverage = (studentId) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.subject === selectedSubject && !isNaN(g.value));
    if (studentGrades.length === 0) return "-";
    const sum = studentGrades.reduce((acc, curr) => acc + Number(curr.value), 0);
    return (sum / studentGrades.length).toFixed(1);
  };

  // Функция для быстрого входа
  const quickLogin = (key) => {
    setEmail(usersDb[key].email);
    setPassword(usersDb[key].pass);
    setCurrentUser(usersDb[key]);
  };

  if (!currentUser) {
    return (
      <div className="login-screen">
        <div className="auth-glass-card fade-in">
          <div className="auth-logo-box">W</div>
          <h1>WAVE<span>.IO</span></h1>
          <form className="auth-form" onSubmit={(e) => {
            e.preventDefault();
            const user = Object.values(usersDb).find(u => u.email === email && u.pass === password);
            if (user) setCurrentUser(user); else setError("Неверные данные");
          }}>
            <div className="input-field"><span>✉️</span><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="input-field"><span>🔒</span><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
            {error && <p className="err-msg">{error}</p>}
            <button className="btn-primary">Войти</button>
          </form>
          
          <div className="login-hints">
            <p>Выберите аккаунт для входа:</p>
            <div className="hint-chips">
              <button className="chip-admin" onClick={() => quickLogin('admin')}>Admin 😎</button>
              <button onClick={() => quickLogin('student1')}>Аманкелди 🎓</button>
              <button onClick={() => quickLogin('student2')}>Иван 🧑‍🎓</button>
              <button onClick={() => quickLogin('student3')}>Дамир 👨‍🎓</button>
              <button onClick={() => quickLogin('student4')}>Алина 👩‍🎓</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const studentList = Object.values(usersDb).filter(u => u.role === 'Student');

  return (
    <div className="app-portal">
      <div className="portal-container">
        <aside className="app-sidebar glass-effect">
          <div className="side-logo">WAVE<span>.IO</span></div>
          <nav className="side-menu">
            <button className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 <span className="hide-mobile">Dashboard</span></button>
            <button className={`menu-item ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>📝 <span className="hide-mobile">Journal</span></button>
          </nav>
          <button className="btn-exit" onClick={() => setCurrentUser(null)}>🚪 <span className="hide-mobile">Logout</span></button>
        </aside>

        <main className="portal-content">
          <header className="portal-header glass-effect">
            <div className="h-left">Привет, <b>{currentUser.name}</b> {loading && <span className="loader-text">...</span>}</div>
            <div className="role-badge">{currentUser.role}</div>
          </header>

          <section className="dynamic-view fade-in">
            {activeTab === 'dashboard' && (
              <div className="dashboard-grid">
                <div className="stat-card glass-effect border-blue">
                   <div className="s-icon icon-blue">👤</div>
                   <div><p>Пользователь</p><h3>{currentUser.name}</h3></div>
                </div>
                <div className="stat-card glass-effect border-purple">
                   <div className="s-icon icon-purple">🌍</div>
                   <div><p>Статус</p><h3>Online</h3></div>
                </div>
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="journal-card glass-effect">
                <div className="card-header">
                  <h2>{selectedSubject}</h2>
                  <div className="subject-selector">
                    {subjects.map(s => (
                      <button key={s} className={selectedSubject === s ? 'active' : ''} onClick={() => setSelectedSubject(s)}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="journal-table">
                    <thead>
                      <tr>
                        <th className="sticky-col">Студент</th>
                        {days.map(d => <th key={d}>{d}</th>)}
                        <th className="avg-col">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentUser.role === 'System Administrator' ? studentList : [currentUser]).map(st => (
                        <tr key={st.id}>
                          <td className="sticky-col student-name-cell">
                             <span className="mini-avatar">{st.avatar}</span> {st.name}
                          </td>
                          {days.map(d => {
                            const grade = grades.find(g => g.studentId === st.id && g.day === d && g.subject === selectedSubject);
                            return (
                              <td key={d} className="grade-cell">
                                {currentUser.role === 'System Administrator' ? (
                                  <select 
                                    className={`grade-select g-${grade?.value === 'нб' ? 'nb' : grade?.value || 'empty'}`}
                                    value={grade?.value || ""} 
                                    onChange={(e) => handleGradeChange(st.id, d, e.target.value)}
                                  >
                                    <option value=""></option>
                                    <option value="5">5</option><option value="4">4</option>
                                    <option value="3">3</option><option value="2">2</option>
                                    <option value="нб">нб</option>
                                  </select>
                                ) : (
                                  grade && <span className={`grade-pill g-${grade.value === 'нб' ? 'nb' : grade.value}`}>{grade.value}</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="avg-cell"><b>{calculateAverage(st.id)}</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
