

import { useState, useEffect } from 'react';

// API endpoints configured directly for the MERN execution server
const CLEARANCE_REQ_URL = 'http://localhost:5000/api/clearance/request';
const CLEARANCE_STATUS_URL = 'http://localhost:5000/api/clearance/my-status';
const PENDING_REQS_URL = 'http://localhost:5000/api/clearance/pending';
const CLEARANCE_ACTION_URL = 'http://localhost:5000/api/clearance/action';

const CLEARANCE_RESUBMIT_URL = 'http://localhost:5000/api/clearance/resubmit';
const RESUBMITTED_REQS_URL = 'http://localhost:5000/api/clearance/resubmitted';

function DashboardScreen({ user, handleLogout, handleHistory }) {
  const isStudent = user.role === 'student';

  const [clearanceData, setClearanceData] = useState(null);

  const [pendingStudents, setPendingStudents] = useState([]);

  const [resubmittedStudents, setResubmittedStudents] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);

  const [dashboardMsg, setDashboardMsg] = useState('');

  const [activeRejectionRequest, setActiveRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const fetchClearanceStatus = async () => {
    try {
      setLoading(true);
      setDashboardMsg('');

      const response = await fetch(`${CLEARANCE_STATUS_URL}?studentId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setClearanceData(data.clearance); 
      } else {
        setDashboardMsg("error: could not fetch clearance status");
      }
    } catch (error) {
      console.error(error);
      setDashboardMsg("error: network connection failed");
    } finally {
      setLoading(false);
    }
  };


  const handleInitiateClearance = async () => {
    try {
      setLoading(true);
      setDashboardMsg('');

      const response = await fetch(CLEARANCE_REQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id })
      });
      
      const data = await response.json();

      if (response.ok) {
        setClearanceData(data.clearance); 
      } else {
        setDashboardMsg(`error: ${data.message || "Failed to initiate clearance."}`);
      }
    } catch (err) {
      console.error(err);
      setDashboardMsg("error: Network connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (departmentRole) => {
    try {
      setLoading(true);
      setDashboardMsg('');

      const response = await fetch(CLEARANCE_RESUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          departmentRole: departmentRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        setClearanceData(data.clearance); // Instantly update view checklist
      } else {
        setDashboardMsg(`error: ${data.message || "Failed to resubmit request."}`);
      }
    } catch (err) {
      console.error(err);
      setDashboardMsg("error: Network connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingStudents = async () => {
    try {
      const response = await fetch(`${PENDING_REQS_URL}?departmentRole=${user.role}`);
      const data = await response.json();

      if (response.ok) {
        setPendingStudents(data.requests); 
      } else {
        setDashboardMsg("error: Could not fetch pending students.");
      }
    } catch (err) {
      console.error(err);
      setDashboardMsg("error: Network connection failed.");
    }
  };

  const fetchResubmittedStudents = async () => {
    try {
      const response = await fetch(`${RESUBMITTED_REQS_URL}?departmentRole=${user.role}`);
      const data = await response.json();

      if (response.ok) {
        setResubmittedStudents(data.requests); 
      } else {
        setDashboardMsg("error: Could not fetch resubmitted students.");
      }
    } catch (err) {
      console.error(err);
      setDashboardMsg("error: Network connection failed.");
    }
  };

  const refreshAdminViews = async () => {
    setLoading(true);
    await Promise.all([fetchPendingStudents(), fetchResubmittedStudents()]);
    setLoading(false);
  };

  const handleClearanceAction = async (requestId, action, reasonText = '') => {
    try {
      setLoading(true);
      setDashboardMsg('');

      const response = await fetch(CLEARANCE_ACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          departmentRole: user.role,
          action,
          reason: reasonText
        })
      });

      const data = await response.json();

      if (response.ok) {
        setActiveRejectionRequest(null);
        setRejectionReason('');
        await refreshAdminViews(); 
      } else {
        setDashboardMsg(`error: ${data.message || "Failed to update action."}`);
      }
    } catch (err) {
      console.error(err);
      setDashboardMsg("error: Network connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudent) {
      fetchClearanceStatus(); 
    } else {
      refreshAdminViews(); 
    }
  }, [user.id]);

  const filteredResubmitted = resubmittedStudents.filter((request) => {
    const rollNo = request.studentId?.registeration_no || '';
    return rollNo.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ ...cardStyle, maxWidth: '650px' }}>
      <h2 style={titleStyle}>Welcome, {user.name}!</h2>
      
      <div style={infoBoxStyle}>
        <p style={infoTextStyle}><strong>Registration ID:</strong> {user.registeration_no}</p>
        <p style={infoTextStyle}><strong>System Role:</strong> <span style={{ fontWeight: 'bold' }}>{user.role.toUpperCase()}</span></p>
        <p style={infoTextStyle}><strong>Academic Dept:</strong> {user.department}</p>
      </div>

      {dashboardMsg && <p style={msgStyle(dashboardMsg)}>{dashboardMsg}</p>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'black', fontWeight: 'bold' }}>Loading database records...</p>
      ) : (
        <>
          {isStudent && (
            <div style={{ marginTop: '20px' }}>
              {!clearanceData || !clearanceData.statuses ? (
                <div style={workspaceStyle}>
                  <p style={{ color: 'black', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px', textAlign: 'center' }}>
                     Your clearance process has not been initiated yet.
                  </p>
                  <p style={{ color: 'black', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
                    Clicking the button below will submit an automatic clearance request to all 7 departments simultaneously.
                  </p>
                  <button onClick={handleInitiateClearance} style={btnStyle}>
                    Apply for Clearance
                  </button>
                </div>
              ) : (
                <div style={workspaceStyle}>
                  <h3 style={{ color: 'black', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px', textAlign: 'center' }}>
                    My Clearance Checklist
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {Object.keys(clearanceData.statuses).map((deptKey) => {
                      const dept = clearanceData.statuses[deptKey];
                      return (
                        <div key={deptKey} style={checklistLineStyle}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: 'black' }}>
                              {deptKey.toUpperCase()}
                            </span>
                            <span style={statusBadgeStyle(dept.status)}>
                              {dept.status === 'Approved' && 'Approved'}
                              {dept.status === 'Pending' && 'Pending Approval'}
                              {dept.status === 'Rejected' && 'Rejected'}
                              {dept.status === 'Resubmitted' && 'Resubmitted'}
                              {dept.status === 'Not Sent' && 'Not Initiated'}
                            </span>
                          </div>
                          
                          {dept.status === 'Rejected' && (
                            <div style={{ marginTop: '10px' }}>
                              {dept.reason && (
                                <div style={rejectionReasonStyle}>
                                  <strong>Reason:</strong> {dept.reason}
                                </div>
                              )}
                              <button 
                                onClick={() => handleResubmit(deptKey)} 
                                style={resubmitBtnStyle}
                              >
                                Resubmit
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isStudent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>
              
              <div style={workspaceStyle}>
                <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '10px' }}>
                  Awaiting Clearance ({user.role.toUpperCase()})
                </h4>
                <p style={{ color: 'black', fontSize: '0.85rem', textAlign: 'center', marginTop: '10px', marginBottom: '15px'}}>
                  New clearance requests waiting for approval:
                </p>
                
                {pendingStudents.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'black',backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black' }}>
                    No pending clearance requests.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {pendingStudents.map((request) => (
                      <div key={request._id} style={checklistLineStyle}>
                        <div style={{ marginBottom: '10px' }}>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId?.name}</p>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId?.registeration_no}</p>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Dept:</strong> {request.studentId?.department}</p>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Phone:</strong> {request.studentId?.phoneNumber}</p>
                        </div>

                        {activeRejectionRequest === request._id ? (
                          <div style={rejectionModalStyle}>
                            <label style={{ color: 'black', fontWeight: 'bold', fontSize: '0.85rem' }}>Write Rejection Reason:</label>
                            <textarea 
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              required
                              style={textAreaStyle}
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <button 
                                style={{ ...btnStyle, backgroundColor: '#822d36', flex: 1, margin: 0, padding: '8px' }}
                                onClick={() => handleClearanceAction(request._id, 'Rejected', rejectionReason)}
                              >
                                Submit
                              </button>
                              <button 
                                style={{ ...btnStyle, color:'black',backgroundColor: 'darkgrey', flex: 1, margin: 0, padding: '8px' }}
                                onClick={() => { setActiveRejectionRequest(null); setRejectionReason(''); }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={approveBtnStyle} onClick={() => handleClearanceAction(request._id, 'Approved')}>Approve</button>
                            <button style={rejectBtnStyle} onClick={() => setActiveRejectionRequest(request._id)}>Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={workspaceStyle}>
                <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '10px' }}>
                  Resubmitted Requests ({user.role.toUpperCase()})
                </h4>
                
                <div style={searchContainerStyle}>
                  <label style={{ color: 'black', fontWeight: 'bold', fontSize: '0.85rem' }}>Search Student by ARID No:</label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by registration number (e.g. 4010)..."
                    style={searchInputStyle}
                  />
                </div>
                
                {filteredResubmitted.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'black', fontStyle: 'italic', backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black' }}>
                    No resubmitted requests matching search.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {filteredResubmitted.map((request) => (
                      <div key={request._id} style={checklistLineStyle}>
                        <div style={{ marginBottom: '10px' }}>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId?.name}</p>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId?.registeration_no}</p>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Dept:</strong> {request.studentId?.department}</p>
                          <p style={{ margin: '3px 0', color: 'black' }}><strong>Phone:</strong> {request.studentId?.phoneNumber}</p>
                        </div>

                        {activeRejectionRequest === request._id ? (
                          <div style={rejectionModalStyle}>
                            <label style={{ color: 'black', fontWeight: 'bold', fontSize: '0.85rem' }}>Write Rejection Reason:</label>
                            <textarea 
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="e.g. Please resolve cafeteria payments"
                              required
                              style={textAreaStyle}
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <button 
                                style={{ ...btnStyle, backgroundColor: '#dc3545', flex: 1, margin: 0, padding: '8px' }}
                                onClick={() => handleClearanceAction(request._id, 'Rejected', rejectionReason)}
                              >
                                Submit Rejection
                              </button>
                              <button 
                                style={{ ...btnStyle, backgroundColor: '#6c757d', flex: 1, margin: 0, padding: '8px' }}
                                onClick={() => { setActiveRejectionRequest(null); setRejectionReason(''); }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={approveBtnStyle} onClick={() => handleClearanceAction(request._id, 'Approved')}>Approve</button>
                            <button style={rejectBtnStyle} onClick={() => setActiveRejectionRequest(request._id)}>Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '25px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
        <button onClick={handleLogout} style={{ ...logoutBtnStyle, backgroundColor:'lightgrey',color:'black',flex: 1, marginTop: '0' }}>
          Logout
        </button>
        {!isStudent && (
          <button onClick={handleHistory} style={{ ...logoutBtnStyle, flex: 1, marginTop: '0', backgroundColor: '#35383b' }}>
            History
          </button>
        )}
      </div>
    </div>
  );
}

const cardStyle = { padding: '30px', borderRadius: '10px', backgroundColor: 'grey', boxShadow: '3px 3px 15px black', width: '100%', maxWidth: '450px' };
const titleStyle = { textAlign: 'center', marginBottom: '30px', color: 'black', fontSize: '25px', fontWeight: 'bold' };

const infoBoxStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#e0e0e0', borderRadius: '8px', borderLeft: '5px solid black', boxShadow: 'inset 1px 1px 5px rgba(0,0,0,0.1)' };
const infoTextStyle = { margin: '5px 0', color: 'black' };

const workspaceStyle = { padding: '20px', backgroundColor: 'darkgrey', borderRadius: '8px', border: '1px solid black' };
const checklistLineStyle = { display: 'flex', flexDirection: 'column', padding: '12px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' };

const rejectionReasonStyle = { marginTop: '8px', padding: '8px',   fontSize: '0.85rem', color: '#4e4d4d', marginBottom: '10px' };
const rejectionModalStyle = { marginTop: '10px', padding: '12px', backgroundColor: 'lightgrey', borderRadius: '5px', border: '1px solid #ffeeba', display: 'flex', flexDirection: 'column', gap: '5px' };
const textAreaStyle = { width: '90%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid black', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', resize: 'vertical', marginTop: '5px' };

const btnStyle = { padding: '12px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto', width: '60%' };
const logoutBtnStyle = { padding: '12px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', width: '90%', display: 'block', marginLeft: 'auto', marginRight: 'auto' };

const approveBtnStyle = { padding: '8px 15px', backgroundColor: '#266034', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };
const rejectBtnStyle = { padding: '8px 15px', backgroundColor: '#79252d', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };

const resubmitBtnStyle = { padding: '6px 12px', backgroundColor: 'black', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'block', width: '100%' };

const searchContainerStyle = { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' };
const searchInputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid black', backgroundColor: 'white', color: 'black', fontSize: '0.9rem' };

const msgStyle = (msg) => ({
  textAlign: 'center', 
  fontWeight: 'bold', 
  color: msg.includes('error') ? '#dc3545' : '#28a745', 
  backgroundColor: msg.includes('error') ? '#f8d7da' : '#d4edda', 
  padding: '10px', 
  borderRadius: '5px', 
  border: msg.includes('error') ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
  marginTop: '15px',
  marginBottom: '15px'
});

const statusBadgeStyle = (status) => {
  let color = 'black';
  let fontStyle = 'normal';
  if (status === 'Approved') color = '#3b3d3b';
  if (status === 'Pending') {
    color = '#424242';
    fontStyle = 'italic';
  }
  if (status === 'Rejected') color = 'grey';
  if (status === 'Resubmitted') {
    color = '#141618';
    fontStyle = 'italic';
  }
  
  return {
    fontWeight: 'bold',
    color: color,
    fontStyle: fontStyle,
    fontSize: '0.9rem'
  };
};

export default DashboardScreen;