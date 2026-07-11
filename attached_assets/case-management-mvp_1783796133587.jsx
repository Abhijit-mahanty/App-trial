import React, { useState } from 'react';

export default function CaseManagementMVP() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([
    { id: 1, name: 'Smith v. Johnson', client: 'John Smith', status: 'Active', daysActive: 124 },
    { id: 2, name: 'Property Dispute - Chen Estate', client: 'Sarah Chen', status: 'Pending', daysActive: 18 },
    { id: 3, name: 'Contract Review - TechCorp', client: 'TechCorp Inc', status: 'Active', daysActive: 45 },
  ]);
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Motion for Summary Judgment', caseId: 1, date: '2024-07-08', type: 'Legal Document' },
    { id: 2, name: 'Deposition Transcript - Witness A', caseId: 1, date: '2024-07-05', type: 'Transcript' },
    { id: 3, name: 'Contract - Service Agreement', caseId: 3, date: '2024-07-10', type: 'Contract' },
    { id: 4, name: 'Initial Complaint', caseId: 2, date: '2024-06-28', type: 'Legal Document' },
  ]);
  const [deadlines, setDeadlines] = useState([
    { id: 1, title: 'Response Brief Due', date: '2024-07-22', caseId: 1, priority: 'High' },
    { id: 2, title: 'Discovery Deadline', date: '2024-07-25', caseId: 2, priority: 'Medium' },
    { id: 3, title: 'Expert Report Due', date: '2024-07-15', caseId: 1, priority: 'High' },
  ]);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review plaintiff deposition', caseId: 1, assignee: 'You', status: 'In Progress', dueDate: '2024-07-12' },
    { id: 2, title: 'Prepare witness list', caseId: 2, assignee: 'Sarah', status: 'Open', dueDate: '2024-07-18' },
    { id: 3, title: 'File amended complaint', caseId: 1, assignee: 'You', status: 'Open', dueDate: '2024-07-20' },
  ]);
  const [interactions, setInteractions] = useState([
    { id: 1, caseId: 1, client: 'John Smith', date: '2024-07-10', type: 'Phone Call', notes: 'Discussed trial strategy, client happy with progress' },
    { id: 2, caseId: 1, client: 'John Smith', date: '2024-07-08', type: 'Email', notes: 'Sent motion for review' },
    { id: 3, caseId: 3, client: 'TechCorp Inc', date: '2024-07-09', type: 'Meeting', notes: 'In-person review of contract terms' },
  ]);
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [newTask, setNewTask] = useState('');

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(searchDoc.toLowerCase()) || 
    d.type.toLowerCase().includes(searchDoc.toLowerCase())
  );

  const caseDocuments = selectedCase ? documents.filter(d => d.caseId === selectedCase) : documents;
  const caseTasks = selectedCase ? tasks.filter(t => t.caseId === selectedCase) : tasks;
  const caseInteractions = selectedCase ? interactions.filter(i => i.caseId === selectedCase) : interactions;
  const caseDeadlines = selectedCase ? deadlines.filter(d => d.caseId === selectedCase) : deadlines;

  const getCaseStatus = (status) => {
    return status === 'Active' ? 'var(--fill-success)' : 'var(--fill-warning)';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'var(--fill-danger)';
    if (priority === 'Medium') return 'var(--fill-warning)';
    return 'var(--fill-success)';
  };

  const getTaskStatusColor = (status) => {
    return status === 'In Progress' ? 'var(--fill-accent)' : 'var(--border-strong)';
  };

  const handleAddTask = () => {
    if (newTask && selectedCase) {
      setTasks([...tasks, {
        id: Math.max(...tasks.map(t => t.id)) + 1,
        title: newTask,
        caseId: selectedCase,
        assignee: 'You',
        status: 'Open',
        dueDate: '2024-07-20'
      }]);
      setNewTask('');
    }
  };

  return (
    <div style={{ background: 'var(--surface-0)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ padding: '20px 0', borderBottom: '0.5px solid var(--border)' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)' }}>
            Case Management System
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Manage cases, documents, deadlines, and team collaboration
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '0.5px solid var(--border)', marginTop: '20px' }}>
          {['dashboard', 'documents', 'calendar', 'tasks', 'interactions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--fill-accent)' : 'none',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 500 : 400,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px 0' }}>

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Total Cases</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)' }}>{cases.length}</p>
                </div>
                <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Upcoming Deadlines</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)' }}>{deadlines.length}</p>
                </div>
                <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Open Tasks</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)' }}>{tasks.filter(t => t.status === 'Open').length}</p>
                </div>
                <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Documents</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)' }}>{documents.length}</p>
                </div>
              </div>

              <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-primary)' }}>Active Cases</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {cases.map(caseItem => (
                  <div
                    key={caseItem.id}
                    onClick={() => { setSelectedCase(caseItem.id); setActiveTab('documents'); }}
                    style={{
                      background: 'var(--surface-2)',
                      border: '0.5px solid var(--border)',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {caseItem.name}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {caseItem.client}
                        </p>
                      </div>
                      <span style={{
                        background: getCaseStatus(caseItem.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius)',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {caseItem.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {caseItem.daysActive} days active
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Search documents by name or type..."
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {selectedCase && (
                <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--bg-accent)', borderRadius: 'var(--radius)' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-accent)', fontWeight: 500 }}>
                    Viewing: <strong>{cases.find(c => c.id === selectedCase)?.name}</strong>
                    <button onClick={() => setSelectedCase(null)} style={{
                      marginLeft: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-accent)',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}>Clear filter</button>
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gap: '12px' }}>
                {(selectedCase ? caseDocuments : filteredDocs).map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      background: 'var(--surface-2)',
                      border: '0.5px solid var(--border)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {doc.name}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>{doc.type}</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      background: 'var(--fill-accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}>
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {activeTab === 'calendar' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', color: 'var(--text-primary)' }}>
                Upcoming Deadlines
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(selectedCase ? caseDeadlines : deadlines).map(deadline => (
                  <div
                    key={deadline.id}
                    style={{
                      background: 'var(--surface-2)',
                      border: `2px solid ${getPriorityColor(deadline.priority)}`,
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {deadline.title}
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {cases.find(c => c.id === deadline.caseId)?.name}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {deadline.date}
                      </p>
                      <span style={{
                        background: getPriorityColor(deadline.priority),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius)',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>
                        {deadline.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--surface-2)', borderRadius: '8px', border: '0.5px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Add New Task
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Task description..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    disabled={!selectedCase}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '0.5px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-sans)',
                      background: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!selectedCase}
                    style={{
                      padding: '10px 16px',
                      background: selectedCase ? 'var(--fill-accent)' : 'var(--border)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      cursor: selectedCase ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Add
                  </button>
                </div>
                {!selectedCase && <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Select a case first</p>}
              </div>

              <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-primary)' }}>Tasks</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(selectedCase ? caseTasks : tasks).map(task => (
                  <div
                    key={task.id}
                    style={{
                      background: 'var(--surface-2)',
                      border: '0.5px solid var(--border)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {task.title}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>{cases.find(c => c.id === task.caseId)?.name}</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: getTaskStatusColor(task.status),
                        color: task.status === 'In Progress' ? 'white' : 'var(--text-primary)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius)',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'inline-block'
                      }}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTERACTIONS */}
          {activeTab === 'interactions' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Client Interactions
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(selectedCase ? caseInteractions : interactions).map(interaction => (
                  <div
                    key={interaction.id}
                    style={{
                      background: 'var(--surface-2)',
                      border: '0.5px solid var(--border)',
                      borderRadius: '8px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {interaction.client}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {cases.find(c => c.id === interaction.caseId)?.name}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {interaction.date}
                        </p>
                        <span style={{
                          background: 'var(--bg-accent)',
                          color: 'var(--text-accent)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius)',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}>
                          {interaction.type}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {interaction.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
