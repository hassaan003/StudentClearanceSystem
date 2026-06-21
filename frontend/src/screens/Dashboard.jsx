// // frontend/src/screens/Dashboard.jsx

// // 'useState' lets us store and update values on the screen dynamically.
// // 'useEffect' lets us run a function automatically when the screen loads.
// import { useState, useEffect } from 'react';

// // For the preview environment, we declare the endpoints directly here 
// // to avoid compilation errors with relative imports.
// const CLEARANCE_REQ_URL = 'http://localhost:5000/api/clearance/request';
// const CLEARANCE_STATUS_URL = 'http://localhost:5000/api/clearance/my-status';
// const PENDING_REQS_URL = 'http://localhost:5000/api/clearance/pending';

// function DashboardScreen({ user, handleLogout }) {
//   // Evaluates to 'true' if the logged-in user is a student, 'false' if it's a department admin.
//   const isStudent = user.role === 'student';

//   // --- STATE VARIABLES ---
//   // 'clearanceData' holds the student's 7-department checklist from the database.
//   // It starts as 'null' because we haven't fetched it yet.
//   const [clearanceData, setClearanceData] = useState(null);

//   // NEW: 'pendingStudents' holds the array of students waiting for this admin's approval
//   const [pendingStudents, setPendingStudents] = useState([]);

//   // 'loading' shows a "Loading..." text while we wait for the database to reply.
//   const [loading, setLoading] = useState(true);

//   // 'dashboardMsg' holds text for our red/green success and error banners.
//   const [dashboardMsg, setDashboardMsg] = useState('');

//   // ============================================================================
//   // FUNCTION 1: FETCH CLEARANCE STATUS (Reads student data from database)
//   // ============================================================================
//   const fetchClearanceStatus = async () => {
//     try {
//       setLoading(true);
//       setDashboardMsg('');

//       const response = await fetch(`${CLEARANCE_STATUS_URL}?studentId=${user.id}`);
//       const data = await response.json();

//       if (response.ok) {
//         // FIXED: We must target 'data.clearance' because that is how our backend sends it!
//         setClearanceData(data.clearance); 
//       } else {
//         setDashboardMsg("error: could not fetch clearance status");
//       }
//     } catch (error) {
//       console.error(error);
//       setDashboardMsg("network connection failed");
//     } finally {
//       setLoading(false);
//     }
//   };

  

//   // ============================================================================
//   // AUTO-TRIGGER: Runs automatically the moment the Dashboard appears
//   // ============================================================================
//   useEffect(() => {
//     if (isStudent) {
//       // If it's a student, automatically check their database status
//       fetchClearanceStatus(); 
//     } else {
//       // If it's an admin, automatically fetch students waiting for their approval
//       fetchPendingStudents(); 
//     }
//   }, [user.id]); // Re-run this check if a different user logs in

//   return (
//     <div style={{ ...cardStyle, maxWidth: '650px' }}>
//       <h2 style={titleStyle}>Welcome, {user.name}!</h2>
      
//       {/* Dynamic Profile Information Box */}
//       <div style={infoBoxStyle}>
//         <p style={infoTextStyle}><strong>Registration ID:</strong> {user.registeration_no}</p>
//         <p style={infoTextStyle}><strong>System Role:</strong> <span style={{ fontWeight: 'bold' }}>{user.role.toUpperCase()}</span></p>
//         <p style={infoTextStyle}><strong>Academic Dept:</strong> {user.department}</p>
//       </div>

//       {/* Renders the alert message banner if dashboardMsg has text */}
//       {dashboardMsg && <p style={msgStyle(dashboardMsg)}>{dashboardMsg}</p>}

//       {/* If loading is true, show text. Otherwise, show the actual dashboard UI. */}
//       {loading ? (
//         <p style={{ textAlign: 'center', color: 'black', fontWeight: 'bold' }}>Loading database records...</p>
//       ) : (
//         <>
//           {/* ============================================================================
//               VIEW A: STUDENT INTERFACE
//               ============================================================================ */}
//           {isStudent && (
//             <div style={{ marginTop: '20px' }}>
              
//               {/* SCENARIO 1: Student has NOT clicked Apply yet (clearanceData is null) */}
//               {!clearanceData ? (
//                 <div style={workspaceStyle}>
//                   <p style={{ color: 'black', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px', textAlign: 'center' }}>
//                     ⚠️ Your clearance process has not been initiated yet.
//                   </p>
//                   <p style={{ color: 'black', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
//                     Clicking the button below will submit an automatic clearance request to all 7 departments simultaneously.
//                   </p>
//                   <button onClick={handleInitiateClearance} style={btnStyle}>
//                     Apply for Clearance
//                   </button>
//                 </div>
//               ) : (
                
//                 /* SCENARIO 2: Student HAS applied (Show the 7-department checklist) */
//                 <div style={workspaceStyle}>
//                   <h3 style={{ color: 'black', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px', textAlign: 'center' }}>
//                     My Clearance Checklist
//                   </h3>
                  
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                     {/* 'Object.keys' grabs the department names (finance, lab, etc.) from our database object, allowing us to loop through them automatically. */}
//                     {Object.keys(clearanceData.statuses).map((deptKey) => {
//                       const dept = clearanceData.statuses[deptKey];
//                       return (
//                         <div key={deptKey} style={checklistLineStyle}>
//                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <span style={{ fontWeight: 'bold', color: 'black' }}>
//                               {deptKey.toUpperCase()}
//                             </span>
                            
//                             {/* Render different text/colors based on the current status */}
//                             <span style={statusBadgeStyle(dept.status)}>
//                               {dept.status === 'Approved' && '✅ Approved'}
//                               {dept.status === 'Pending' && '⏳ Pending Approval'}
//                               {dept.status === 'Rejected' && '❌ Rejected'}
//                               {dept.status === 'Not Sent' && '⚪ Not Initiated'}
//                             </span>
//                           </div>
                          
//                           {/* If rejected, show the reason written by the admin */}
//                           {dept.status === 'Rejected' && dept.reason && (
//                             <div style={rejectionReasonStyle}>
//                               <strong>Reason:</strong> {dept.reason}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ============================================================================
//               VIEW B: DEPARTMENT ADMIN INTERFACE (Finance, Library, Cafeteria, etc)
//               ============================================================================ */}
//           {!isStudent && (
//             <div style={workspaceStyle}>
//               <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center' }}>
//                 Department Admin Desk ({user.role.toUpperCase()})
//               </h4>
//               <p style={{ color: 'black', fontSize: '0.95rem', textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>
//                 Students awaiting your approval:
//               </p>
              
//               {/* If the pending list is empty, show a nice message. Otherwise, map through the students. */}
//               {pendingStudents.length === 0 ? (
//                 <p style={{ textAlign: 'center', color: 'black', fontStyle: 'italic', backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black' }}>
//                   No pending requests right now. Great job!
//                 </p>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                   {pendingStudents.map((request) => (
//                     <div key={request._id} style={checklistLineStyle}>
//                       <div style={{ marginBottom: '10px' }}>
//                         {/* We can access these details because we used .populate() in the backend! */}
//                         <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId.name}</p>
//                         <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId.registeration_no}</p>
//                         <p style={{ margin: '3px 0', color: 'black' }}><strong>Dept:</strong> {request.studentId.department}</p>
//                         <p style={{ margin: '3px 0', color: 'black' }}><strong>Phone:</strong> {request.studentId.phoneNumber}</p>
//                       </div>
//                       <div style={{ display: 'flex', gap: '10px' }}>
//                          {/* Temporary alerts until we build the actual API action route in the next step */}
//                          <button style={approveBtnStyle} onClick={() => alert("We will build the Approve action next!")}>Approve</button>
//                          <button style={rejectBtnStyle} onClick={() => alert("We will build the Reject action next!")}>Reject</button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </>
//       )}

//       {/* Shared Logout Button */}
//       <button onClick={handleLogout} style={logoutBtnStyle}>
//         Logout
//       </button>
//     </div>
//   );
// }

// // ============================================================================
// // STYLES (Custom Gray/Black Industrial Theme)
// // ============================================================================
// const cardStyle = { padding: '30px', borderRadius: '10px', backgroundColor: 'grey', boxShadow: '3px 3px 15px black', width: '100%', maxWidth: '450px' };
// const titleStyle = { textAlign: 'center', marginBottom: '30px', color: 'black', fontSize: '25px', fontWeight: 'bold' };

// const infoBoxStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#e0e0e0', borderRadius: '8px', borderLeft: '5px solid black', boxShadow: 'inset 1px 1px 5px rgba(0,0,0,0.1)' };
// const infoTextStyle = { margin: '5px 0', color: 'black' };

// const workspaceStyle = { padding: '20px', backgroundColor: 'darkgrey', borderRadius: '8px', border: '1px solid black' };
// const checklistLineStyle = { display: 'flex', flexDirection: 'column', padding: '12px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' };

// const rejectionReasonStyle = { marginTop: '8px', padding: '8px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', fontSize: '0.85rem', color: '#721c24' };

// const btnStyle = { padding: '12px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto', width: '60%' };
// const logoutBtnStyle = { padding: '12px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', width: '90%', display: 'block', marginLeft: 'auto', marginRight: 'auto' };

// const approveBtnStyle = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };
// const rejectBtnStyle = { padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };

// const msgStyle = (msg) => ({
//   textAlign: 'center', 
//   fontWeight: 'bold', 
//   color: msg.includes('error') ? '#dc3545' : '#28a745', 
//   backgroundColor: msg.includes('error') ? '#f8d7da' : '#d4edda', 
//   padding: '10px', 
//   borderRadius: '5px', 
//   border: msg.includes('error') ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
//   marginTop: '15px',
//   marginBottom: '15px'
// });

// const statusBadgeStyle = (status) => {
//   let color = 'black';
//   let fontStyle = 'normal';
//   if (status === 'Approved') color = '#155724';
//   if (status === 'Pending') {
//     color = '#856404';
//     fontStyle = 'italic';
//   }
//   if (status === 'Rejected') color = '#721c24';
  
//   return {
//     fontWeight: 'bold',
//     color: color,
//     fontStyle: fontStyle,
//     fontSize: '0.9rem'
//   };
// };










// frontend/src/screens/Dashboard.jsx

// 'useState' lets us store and update values on the screen dynamically.
// 'useEffect' lets us run a function automatically when the screen loads.
import { useState, useEffect } from 'react';

// Central API endpoints configured directly for the MERN execution server
const CLEARANCE_REQ_URL = 'http://localhost:5000/api/clearance/request';
const CLEARANCE_STATUS_URL = 'http://localhost:5000/api/clearance/my-status';
const PENDING_REQS_URL = 'http://localhost:5000/api/clearance/pending';
const CLEARANCE_ACTION_URL = 'http://localhost:5000/api/clearance/action';

function DashboardScreen({ user, handleLogout }) {
  // Evaluates to 'true' if the logged-in user is a student, 'false' if it's a department admin.
  const isStudent = user.role === 'student';

  // --- STATE VARIABLES ---
  // 'clearanceData' holds the student's 7-department checklist from the database.
  const [clearanceData, setClearanceData] = useState(null);

  // 'pendingStudents' holds the array of students waiting for this admin's approval
  const [pendingStudents, setPendingStudents] = useState([]);

  // 'loading' shows a "Loading..." text while we wait for the database to reply.
  const [loading, setLoading] = useState(true);

  // 'dashboardMsg' holds text for our red/green success and error banners.
  const [dashboardMsg, setDashboardMsg] = useState('');

  // --- REJECTION MODAL STATE ---
  // Tracks which request is currently being rejected
  const [activeRejectionRequest, setActiveRejectionRequest] = useState(null);
  // Holds the text reasoning input for rejection
  const [rejectionReason, setRejectionReason] = useState('');

  // ============================================================================
  // FUNCTION 1: FETCH CLEARANCE STATUS (Reads student data from database)
  // ============================================================================
  const fetchClearanceStatus = async () => {
    try {
      setLoading(true);
      setDashboardMsg('');

      const response = await fetch(`${CLEARANCE_STATUS_URL}?studentId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        // Safe check for the nested database clearance object
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

  // ============================================================================
  // FUNCTION 2: INITIATE CLEARANCE (Student applies)
  // ============================================================================
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
        setDashboardMsg("success: Clearance process initiated successfully!");
        setClearanceData(data.clearance); // Instantly update view with the checklist
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

  // ============================================================================
  // FUNCTION 3: FETCH PENDING STUDENTS (For Department Admins)
  // ============================================================================
  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      setDashboardMsg('');

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
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNCTION 4: SUBMIT ACTION (Approve / Reject Action Dispatcher)
  // ============================================================================
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
        setDashboardMsg(`success: Student clearance state set to ${action}!`);
        // Reset local modal state if rejection was processed
        setActiveRejectionRequest(null);
        setRejectionReason('');
        // Instantly reload list of pending students to reflect database change on dashboard
        fetchPendingStudents();
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

  // ============================================================================
  // AUTO-TRIGGER
  // ============================================================================
  useEffect(() => {
    if (isStudent) {
      fetchClearanceStatus(); 
    } else {
      fetchPendingStudents(); 
    }
  }, [user.id]); 

  return (
    <div style={{ ...cardStyle, maxWidth: '650px' }}>
      <h2 style={titleStyle}>Welcome, {user.name}!</h2>
      
      {/* Profile Details Header Panel */}
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
          {/* ============================================================================
              VIEW A: STUDENT INTERFACE
              ============================================================================ */}
          {isStudent && (
            <div style={{ marginTop: '20px' }}>
              {!clearanceData || !clearanceData.statuses ? (
                <div style={workspaceStyle}>
                  <p style={{ color: 'black', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px', textAlign: 'center' }}>
                    ⚠️ Your clearance process has not been initiated yet.
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
                              {dept.status === 'Not Sent' && 'Not Initiated'}
                            </span>
                          </div>
                          {dept.status === 'Rejected' && dept.reason && (
                            <div style={rejectionReasonStyle}>
                              <strong>Reason:</strong> {dept.reason}
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

          {/* ============================================================================
              VIEW B: DEPARTMENT ADMIN INTERFACE (Finance, Library, Cafeteria, etc)
              ============================================================================ */}
          {!isStudent && (
            <div style={workspaceStyle}>
              <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center' }}>
                Department Admin Desk ({user.role.toUpperCase()})
              </h4>
              <p style={{ color: 'black', fontSize: '0.95rem', textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>
                Students awaiting your approval:
              </p>
              
              {pendingStudents.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'black', fontStyle: 'italic', backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black' }}>
                  No pending requests right now. Great job!
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

                      {/* CONDITIONAL ACTION INTERFACE: Rejection reasoning modal block or action buttons */}
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
          )}
        </>
      )}

      {/* Shared Logout Button */}
      <button onClick={handleLogout} style={logoutBtnStyle}>
        Logout
      </button>
    </div>
  );
}

// ============================================================================
// STYLES (Custom Gray/Black Industrial Theme)
// ============================================================================
const cardStyle = { padding: '30px', borderRadius: '10px', backgroundColor: 'grey', boxShadow: '3px 3px 15px black', width: '100%', maxWidth: '450px' };
const titleStyle = { textAlign: 'center', marginBottom: '30px', color: 'black', fontSize: '25px', fontWeight: 'bold' };

const infoBoxStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#e0e0e0', borderRadius: '8px', borderLeft: '5px solid black', boxShadow: 'inset 1px 1px 5px rgba(0,0,0,0.1)' };
const infoTextStyle = { margin: '5px 0', color: 'black' };

const workspaceStyle = { padding: '20px', backgroundColor: 'darkgrey', borderRadius: '8px', border: '1px solid black' };
const checklistLineStyle = { display: 'flex', flexDirection: 'column', padding: '12px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' };

const rejectionReasonStyle = { marginTop: '8px', padding: '8px',   fontSize: '0.85rem', color: 'black' };
const rejectionModalStyle = { marginTop: '10px', marginLeft: '40px',padding: '12px', backgroundColor: '', borderRadius: '5px', border: '1px solid #ffeeba', display: 'flex', flexDirection: 'column', gap: '5px' };
const textAreaStyle = { width: '90%',minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid black', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', resize: 'vertical', marginTop: '5px' };

const btnStyle = { padding: '12px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto', width: '60%' };
const logoutBtnStyle = { padding: '12px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', width: '90%', display: 'block', marginLeft: 'auto', marginRight: 'auto' };

const approveBtnStyle = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };
const rejectBtnStyle = { padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };

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
  if (status === 'Approved') color = '#155724';
  if (status === 'Pending') {
    color = 'grey';
    fontStyle = 'italic';
  }
  if (status === 'Rejected') color = 'red';
  
  return {
    fontWeight: 'bold',
    color: color,
    fontStyle: fontStyle,
    fontSize: '0.9rem'
  };
};

export default DashboardScreen;