// import { useState, useEffect } from 'react';

// // API endpoints
// const CLEARANCE_REQ_URL = 'http://localhost:5000/api/clearance/request';
// const CLEARANCE_STATUS_URL = 'http://localhost:5000/api/clearance/my-status';
// const PENDING_REQS_URL = 'http://localhost:5000/api/clearance/pending';
// const CLEARANCE_ACTION_URL = 'http://localhost:5000/api/clearance/action';
// const CLEARANCE_RESUBMIT_URL = 'http://localhost:5000/api/clearance/resubmit';
// const REJECTED_REQS_URL = 'http://localhost:5000/api/clearance/rejected';
// const ELIGIBILITY_URL = 'http://localhost:5000/api/check-eligibility';
// const GET_FAILED_COURSES='http://localhost:5000/api/getFailedCourses';
// const ALL_DEPARTMENTS = ['finance', 'datacell', 'lab', 'cafeteria', 'library', 'photocopier', 'report'];
// function DashboardScreen({ user, handleLogout, handleHistory }) {
//   const isStudent = user.role === 'student';
//   const [clearanceData, setClearanceData] = useState(null);
//   // NEW: Eligibility States
//   const [eligibilityData, setEligibilityData] = useState(null);
//   const [checkingEligibility, setCheckingEligibility] = useState(false);

//   const [pendingStudents, setPendingStudents] = useState([]);
//   const [rejectedStudents, setRejectedStudents] = useState([]); 
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [failedCourses, setFailedCourses]=useState([]);
//   const [dashboardMsg, setDashboardMsg] = useState('');
//   const [activeRejectionRequest, setActiveRejectionRequest] = useState(null);
//   const [rejectionReason, setRejectionReason] = useState('');

//   // ============================================================================
//   // FETCH CLEARANCE STATUS & ELIGIBILITY
//   // ============================================================================
//   const fetchClearanceStatus = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(`${CLEARANCE_STATUS_URL}?studentId=${user.id}`);
//       const data = await response.json();

//       if (response.ok) {
//         setClearanceData(data.clearance); 

//         // If they haven't applied yet, check their eligibility from the database!
//         if (!data.clearance) {
//             checkEligibility();
//         }
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkEligibility = async () => {
//     try {
//         setCheckingEligibility(true);
//         const response = await fetch(`${ELIGIBILITY_URL}?registeration_no=${user.registeration_no}`);
//         const data = await response.json();
//         setEligibilityData(data);
//     } catch (error) {
//         console.error(error);
//     } finally {
//         setCheckingEligibility(false);
//     }
//   };

//   const handleInitiateClearance = async () => {
//     try {
//       setLoading(true);
//       setDashboardMsg('');

//       const response = await fetch(CLEARANCE_REQ_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ studentId: user.id })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setDashboardMsg("success: Clearance process initiated successfully!");
//         setClearanceData(data.clearance); 
//       } else {
//         setDashboardMsg(`error: ${data.message || "Failed to initiate clearance."}`);
//       }
//     } catch (err) {
//       console.error(err);
//       setDashboardMsg("error: Network connection failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResubmit = async (departmentRole) => {
//     try {
//       setLoading(true);
//       setDashboardMsg('');

//       const response = await fetch(CLEARANCE_RESUBMIT_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           studentId: user.id,
//           departmentRole: departmentRole
//         })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setDashboardMsg(`success: Clearance request resubmitted to ${departmentRole.toUpperCase()}!`);
//         setClearanceData(data.clearance);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPendingStudents = async () => {
//     try {
//       const response = await fetch(`${PENDING_REQS_URL}?departmentRole=${user.role}`);
//       const data = await response.json();
//       if (response.ok) setPendingStudents(data.requests); 
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchRejectedStudents = async () => {
//     try {
//       const response = await fetch(`${REJECTED_REQS_URL}?departmentRole=${user.role}`);
//       const data = await response.json();
//       if (response.ok) setRejectedStudents(data.requests); 
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const refreshAdminViews = async () => {
//     setLoading(true);
//     await Promise.all([fetchPendingStudents(), fetchRejectedStudents()]);
//     setLoading(false);
//   };

//   const fetchFailedCourses=async()=>{
//     try{
//       const response=await fetch(`${GET_FAILED_COURSES}?REG_NO=${user.registeration_no}`);
//       const data=await response.json();
//       if(response.ok) setFailedCourses(data.failedCourses);
//     }
//     catch(error){
//       console.error(error);
//     }
//   }

//   const handleClearanceAction = async (requestId, action, reasonText = '') => {
//     try {
//       setLoading(true);
//       const response = await fetch(CLEARANCE_ACTION_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ requestId, departmentRole: user.role, action, reason: reasonText })
//       });
//       if (response.ok) {
//         setActiveRejectionRequest(null);
//         setRejectionReason('');
//         await refreshAdminViews(); 
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isStudent) {
//       fetchClearanceStatus(); 
//       fetchFailedCourses();
//     } else {
//       refreshAdminViews(); 
//     }
//   }, [user.id]);
//   const filteredRejected = rejectedStudents.filter((request) => {
//     const rollNo = request.studentId?.registeration_no || '';
//     return rollNo.toLowerCase().includes(searchQuery.toLowerCase());
//   });
//   return (
//     <div style={{ ...cardStyle, maxWidth: '650px' }}>
//       <h2 style={titleStyle}>Welcome, {user.name}!</h2> 
//       <div style={infoBoxStyle}>
//         <p style={infoTextStyle}><strong>Registration ID:</strong> {user.registeration_no}</p>
//         <p style={infoTextStyle}><strong>System Role:</strong> <span style={{ fontWeight: 'bold' }}>{user.role.toUpperCase()}</span></p>
//         <p style={infoTextStyle}><strong>Academic Dept:</strong> {user.department}</p>
//       </div>

//       {dashboardMsg && <p style={msgStyle(dashboardMsg)}>{dashboardMsg}</p>}

//       {loading ? (
//         <p style={{ textAlign: 'center', color: 'black', fontWeight: 'bold' }}>Loading database records...</p>
//       ) : (
//         <>

//           {isStudent && (
//             <div style={{ marginTop: '20px' }}>

//               {!clearanceData || !clearanceData.statuses ? (
//                 <div style={workspaceStyle}>

//                   <div style={eligibilityBoxStyle}>
//                     <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #000000', paddingBottom: '8px' }}>
//                         Clearance Eligibility Status
//                     </h4>
//                     {checkingEligibility || !eligibilityData ? (
//                         <p style={{ fontStyle: 'italic', margin: 0 }}>Checking academic records...</p>
//                     ) : (
//                         <div>
//                             <div style={eligibilityRowStyle}>
//                                 <span><strong>CGPA (Min 2.5):</strong> {eligibilityData.cgpa}</span>
//                                 <span>{eligibilityData.cgpa >= 2.5 ? 'Pass' : 'Fail'}</span>
//                             </div>
//                             <div style={eligibilityRowStyle}>
//                                 <span><strong>Failed Courses:</strong> {eligibilityData.failedCourses}</span>
//                                 <span>{eligibilityData.failedCourses === 0 ? 'Pass' : 'Fail'}</span>
//                             </div>

//                             {!eligibilityData.isEligible && (
//                                 <>
//                                     <p style={{ color: '#000000', backgroundColor: '#a6a5a5', padding: '10px', borderRadius: '5px', marginTop: '15px', fontSize: '0.9rem', border: '1px solid #f5c6cb' }}>
//                                         You do not meet the academic requirements to apply for clearance. Please contact the Datacell or Examination office.
//                                     </p>
//                                     {failedCourses.map((request)=>(
//                                         <div key={request.Course_no} style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' }}>
//                                             <p>name:{request.Course_no}</p>
//                                         </div>
//                                     ))}
//                                 </>
//                             )}
//                         </div>
//                     )}
//                   </div>
//                   <h3 style={{ color: 'black', marginTop: '25px', marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px', textAlign: 'center' }}>
//                     My Clearance Checklist
//                   </h3>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
//                     {ALL_DEPARTMENTS.map((deptKey) => (
//                       <div key={deptKey} style={checklistLineStyle}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                           <span style={{ fontWeight: 'bold', color: 'black' }}>
//                             {deptKey.toUpperCase()}
//                           </span>
//                           <span style={statusBadgeStyle('Not Sent')}>
//                             Not Initiated
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <button 
//                     onClick={handleInitiateClearance} 
//                     style={eligibilityData?.isEligible ? btnStyle : disabledBtnStyle}
//                     disabled={!eligibilityData?.isEligible}
//                   >
//                     {eligibilityData?.isEligible ? "Apply for Clearance" : "Ineligible to Apply"}
//                   </button>
//                 </div>
//               ) : (

//                 <div style={workspaceStyle}>
//                   <h3 style={{ color: 'black', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px', textAlign: 'center' }}>
//                     My Clearance Checklist
//                   </h3>

//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                     {Object.keys(clearanceData.statuses).map((deptKey) => {
//                       const dept = clearanceData.statuses[deptKey];
//                       return (
//                         <div key={deptKey} style={checklistLineStyle}>
//                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <span style={{ fontWeight: 'bold', color: 'black' }}>
//                               {deptKey.toUpperCase()}
//                             </span>
//                             <span style={statusBadgeStyle(dept.status)}>
//                               {dept.status === 'Approved' && 'Approved'}
//                               {dept.status === 'Pending' && 'Pending Approval'}
//                               {dept.status === 'Rejected' && 'Rejected'}
//                               {dept.status === 'Resubmitted' && 'Resubmitted'}
//                               {dept.status === 'Not Sent' && 'Not Initiated'}
//                             </span>
//                           </div>

//                           {dept.status === 'Rejected' && (
//                             <div style={{ marginTop: '10px' }}>
//                               {dept.reason && (
//                                 <div style={rejectionReasonStyle}>
//                                   <strong>Reason:</strong> {dept.reason}
//                                 </div>
//                               )}
//                               <button
//                                 onClick={() => handleResubmit(deptKey)}
//                                 style={resubmitBtnStyle}
//                               >
//                                 Resubmit to {deptKey.toUpperCase()}
//                               </button>
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
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>

//               <div style={workspaceStyle}>
//                 <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '10px' }}>
//                  Pending Requests ({user.role.toUpperCase()})
//                 </h4>

//                 {pendingStudents.length === 0 ? (
//                   <p style={{ textAlign: 'center', color: 'black', backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black' }}>
//                     No pending clearance requests.
//                   </p>
//                 ) : (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                     {pendingStudents.map((request) => (
//                       <div key={request._id} style={checklistLineStyle}>
//                         <div style={{ marginBottom: '10px' }}>
//                           <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId?.name}</p>
//                           <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId?.registeration_no}</p>
//                           <p style={{ margin: '3px 0', color: 'black' }}><strong>Dept:</strong> {request.studentId?.department}</p>
//                         </div>

//                         {activeRejectionRequest === request._id ? (
//                           <div style={rejectionModalStyle}>
//                             <label style={{ color: 'black', fontWeight: 'bold', fontSize: '0.85rem' }}>Write Rejection Reason:</label>
//                             <textarea
//                               value={rejectionReason}
//                               onChange={(e) => setRejectionReason(e.target.value)}
//                               required
//                               style={textAreaStyle}
//                             />
//                             <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
//                               <button
//                                 style={{ ...btnStyle, backgroundColor: '#822d36', flex: 1, margin: 0, padding: '8px' }}
//                                 onClick={() => handleClearanceAction(request._id, 'Rejected', rejectionReason)}
//                               >
//                                 Submit
//                               </button>
//                               <button
//                                 style={{ ...btnStyle, color: 'black', backgroundColor: 'darkgrey', flex: 1, margin: 0, padding: '8px' }}
//                                 onClick={() => { setActiveRejectionRequest(null); setRejectionReason(''); }}
//                               >
//                                 Cancel
//                               </button>
//                             </div>
//                           </div>
//                         ) : (
//                           <div style={{ display: 'flex', gap: '10px' }}>
//                             <button style={approveBtnStyle} onClick={() => handleClearanceAction(request._id, 'Approved')}>Approve</button>
//                             <button style={rejectBtnStyle} onClick={() => setActiveRejectionRequest(request._id)}>Reject</button>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div style={workspaceStyle}>
//                 <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '10px' }}>
//                    Rejected Requests ({user.role.toUpperCase()})
//                 </h4>

//                 <div style={searchContainerStyle}>
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search by roll number..."
//                     style={searchInputStyle}
//                   />
//                 </div>

//                 {filteredRejected.length === 0 ? (
//                   <p style={{ textAlign: 'center', color: 'black', fontStyle: 'italic', backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black' }}>
//                     No items in rejection queue.
//                   </p>
//                 ) : (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                     {filteredRejected.map((request) => (
//                       <div key={request._id} style={checklistLineStyle}>
//                         <div style={{ marginBottom: '10px' }}>
//                           <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId?.name}</p>
//                           <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId?.registeration_no}</p>
//                           <p style={{ margin: '8px 0 3px 0', color: 'black' }}>
//                             <strong>Current Status:</strong>{' '}
//                             <span style={statusBadgeStyle(request.statuses[user.role].status)}>
//                               {request.statuses[user.role].status === 'Rejected' ? 'Rejected' : 'Resubmitted'}
//                             </span>
//                           </p>
//                           {request.statuses[user.role].reason && (
//                             <div style={rejectionReasonStyle}>
//                               <strong>Rejection Reason:</strong> {request.statuses[user.role].reason}
//                             </div>
//                           )}
//                         </div>

//                         {activeRejectionRequest === request._id ? (
//                           <div style={rejectionModalStyle}>
//                             <label style={{ color: 'black', fontWeight: 'bold', fontSize: '0.85rem' }}>Write New Rejection Reason:</label>
//                             <textarea
//                               value={rejectionReason}
//                               onChange={(e) => setRejectionReason(e.target.value)}
//                               required
//                               style={textAreaStyle}
//                             />
//                             <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
//                               <button
//                                 style={{ ...btnStyle, backgroundColor: '#8b313a', flex: 1, margin: 0, padding: '8px' }}
//                                 onClick={() => handleClearanceAction(request._id, 'Rejected', rejectionReason)}
//                               >
//                                 Submit Rejection
//                               </button>
//                               <button
//                                 style={{ ...btnStyle, backgroundColor: '#6c757d', flex: 1, margin: 0, padding: '8px' }}
//                                 onClick={() => { setActiveRejectionRequest(null); setRejectionReason(''); }}
//                               >
//                                 Cancel
//                               </button>
//                             </div>
//                           </div>
//                         ) : (
//                           <div style={{ display: 'flex', gap: '10px' }}>
//                             <button style={approveBtnStyle} onClick={() => handleClearanceAction(request._id, 'Approved')}>Approve</button>
//                             <button style={rejectBtnStyle} onClick={() => setActiveRejectionRequest(request._id)}>Reject</button>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//             </div>
//           )}
//         </>
//       )}

//       <div style={{ display: 'flex', gap: '10px', marginTop: '25px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
//         <button onClick={handleLogout} style={{ ...logoutBtnStyle, backgroundColor: 'lightgrey', color: 'black', flex: 1, marginTop: '0' }}>
//           Logout
//         </button>
//         {/* {!isStudent && (
//           <button onClick={handleHistory} style={{ ...logoutBtnStyle, flex: 1, marginTop: '0', backgroundColor: '#35383b' }}>
//             History
//           </button>
//         )} */}
//       </div>
//     </div>
//   );
// }

// // ============================================================================
// // STYLES 
// // ============================================================================
// const cardStyle = { padding: '30px', borderRadius: '10px', backgroundColor: 'grey', boxShadow: '3px 3px 15px black', width: '100%', maxWidth: '450px' };
// const titleStyle = { textAlign: 'center', marginBottom: '30px', color: 'black', fontSize: '25px', fontWeight: 'bold' };

// const infoBoxStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#e0e0e0', borderRadius: '8px', borderLeft: '5px solid black', boxShadow: 'inset 1px 1px 5px rgba(0,0,0,0.1)' };
// const infoTextStyle = { margin: '5px 0', color: 'black' };

// const workspaceStyle = { padding: '20px', backgroundColor: 'darkgrey', borderRadius: '8px', border: '1px solid black' };
// const checklistLineStyle = { display: 'flex', flexDirection: 'column', padding: '12px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' };

// const eligibilityBoxStyle = { backgroundColor: '#dedede', color: 'black', padding: '15px'};
// const eligibilityRowStyle = { display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '0.95rem' };

// const rejectionReasonStyle = { marginTop: '8px', padding: '8px', fontSize: '0.85rem', color: '#000000', marginBottom: '10px' };
// const rejectionModalStyle = { marginTop: '10px', padding: '12px', backgroundColor: '#c2c2c2', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '5px' };
// const textAreaStyle = { width: '90%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid black', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', resize: 'vertical', marginTop: '5px' };

// const btnStyle = { padding: '12px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto', width: '60%' };
// const disabledBtnStyle = { ...btnStyle, backgroundColor: '#555', cursor: 'not-allowed', color: '#aaa' };
// const logoutBtnStyle = { padding: '12px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', width: '90%', display: 'block', marginLeft: 'auto', marginRight: 'auto' };

// const approveBtnStyle = { padding: '8px 15px', backgroundColor: '#2b6438', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };
// const rejectBtnStyle = { padding: '8px 15px', backgroundColor: '#892d36', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };
// const resubmitBtnStyle = { padding: '6px 12px', backgroundColor: 'black', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'block', width: '100%' };

// const searchContainerStyle = { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' };
// const searchInputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid black', backgroundColor: 'white', color: 'black', fontSize: '0.9rem' };

// const msgStyle = (msg) => ({
//   textAlign: 'center', 
//   fontWeight: 'bold', 
//   color: msg.includes('error') ? '#782b32' : '#28a745', 
//   backgroundColor: msg.includes('error') ? '#efefef' : '#ebebeb', 
//   padding: '10px', 
//   borderRadius: '5px', 
//   border: msg.includes('error') ? '1px solid #fefefe' : '1px solid #a2a2a2',
//   marginTop: '15px',
//   marginBottom: '15px'
// });

// const statusBadgeStyle = (status) => {
//   let color = 'black';
//   let fontStyle = 'normal';
//   if (status === 'Approved') color = '#155724';
//   if (status === 'Pending') color = '#856404';
//   if (status === 'Rejected') color = '#721c24';
//   if (status === 'Resubmitted') color = '#1a3653';
//   return { fontWeight: 'bold', color, fontStyle, fontSize: '0.9rem' };
// };

// export default DashboardScreen;


import { useState, useEffect } from 'react';

const CLEARANCE_REQ_URL = 'http://localhost:5000/api/clearance/request';
const CLEARANCE_STATUS_URL = 'http://localhost:5000/api/clearance/my-status';
const PENDING_REQS_URL = 'http://localhost:5000/api/clearance/pending';
const CLEARANCE_ACTION_URL = 'http://localhost:5000/api/clearance/action';
const CLEARANCE_RESUBMIT_URL = 'http://localhost:5000/api/clearance/resubmit';
const REJECTED_REQS_URL = 'http://localhost:5000/api/clearance/rejected';
const ELIGIBILITY_URL = 'http://localhost:5000/api/check-eligibility';
const GET_FAILED_COURSES = 'http://localhost:5000/api/getFailedCourses';

const ALL_DEPARTMENTS = ['finance', 'datacell', 'lab', 'cafeteria', 'library', 'photocopier', 'report'];

function DashboardScreen({ user, handleLogout, handleHistory }) {
  const isStudent = user.role === 'student';

  const [clearanceData, setClearanceData] = useState(null);

  // Eligibility States
  const [eligibilityData, setEligibilityData] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Admin and Queue list state
  const [pendingStudents, setPendingStudents] = useState([]);
  const [rejectedStudents, setRejectedStudents] = useState([]);

  // Tab indicator state: 'pending' or 'rejected'
  const [activeTab, setActiveTab] = useState('pending');

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [failedCourses, setFailedCourses] = useState([]);
  const [dashboardMsg, setDashboardMsg] = useState('');
  const [activeRejectionRequest, setActiveRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchClearanceStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CLEARANCE_STATUS_URL}?studentId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setClearanceData(data.clearance);

        if (!data.clearance) {
          checkEligibility();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const response = await fetch(`${ELIGIBILITY_URL}?registeration_no=${user.registeration_no}`);
      const data = await response.json();
      setEligibilityData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingEligibility(false);
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
        setDashboardMsg("success: Clearance process initiated successfully!");
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
        setDashboardMsg(`success: Clearance request resubmitted to ${departmentRole.toUpperCase()}!`);
        setClearanceData(data.clearance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingStudents = async () => {
    try {
      const response = await fetch(`${PENDING_REQS_URL}?departmentRole=${user.role}`);
      const data = await response.json();
      if (response.ok) setPendingStudents(data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRejectedStudents = async () => {
    try {
      const response = await fetch(`${REJECTED_REQS_URL}?departmentRole=${user.role}`);
      const data = await response.json();
      if (response.ok) setRejectedStudents(data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAdminViews = async () => {
    setLoading(true);
    await Promise.all([fetchPendingStudents(), fetchRejectedStudents()]);
    setLoading(false);
  };

  const fetchFailedCourses = async () => {
    try {
      const response = await fetch(`${GET_FAILED_COURSES}?registeration_no=${user.registeration_no}`);
      const data = await response.json();
      if (response.ok && data.failedCourses) {
        setFailedCourses(data.failedCourses);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleClearanceAction = async (requestId, action, reasonText = '') => {
    try {
      setLoading(true);
      const response = await fetch(CLEARANCE_ACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, departmentRole: user.role, action, reason: reasonText })
      });
      if (response.ok) {
        setActiveRejectionRequest(null);
        setRejectionReason('');
        await refreshAdminViews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudent) {
      fetchClearanceStatus();
      fetchFailedCourses();
    } else {
      refreshAdminViews();
    }
  }, [user.id]);

  const filteredRejected = rejectedStudents.filter((request) => {
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
          {/* ============================================================================
              VIEW A: STUDENT INTERFACE
              ============================================================================ */}
          {isStudent && (
            <div style={{ marginTop: '20px' }}>

              {!clearanceData || !clearanceData.statuses ? (
                <div style={workspaceStyle}>

                  <div style={eligibilityBoxStyle}>
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #000000', paddingBottom: '8px' }}>
                      Clearance Eligibility Status
                    </h4>
                    {checkingEligibility || !eligibilityData ? (
                      <p style={{ fontStyle: 'italic', margin: 0 }}>Checking academic records...</p>
                    ) : (
                      <div>
                        <div style={eligibilityRowStyle}>
                          <span><strong>CGPA (Min 2.5):</strong> {eligibilityData.cgpa}</span>
                          <span>{eligibilityData.cgpa >= 2.5 ? 'Pass' : 'Fail'}</span>
                        </div>
                        <div style={eligibilityRowStyle}>
                          <span><strong>Failed Courses:</strong> {eligibilityData.failedCourses}</span>
                          <span>{eligibilityData.failedCourses === 0 ? 'Pass' : 'Fail'}</span>
                        </div>

                        {!eligibilityData.isEligible && (
                          <>
                            <p style={{ color: '#000000', backgroundColor: '#a6a5a5', padding: '10px', borderRadius: '5px', marginTop: '15px', fontSize: '0.9rem', border: '1px solid #f5c6cb' }}>
                              You do not meet the academic requirements to apply for clearance. Please contact the Datacell or Examination office.
                            </p>
                            {failedCourses.map((request) => (
                              <div key={request.Course_no} style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' }}>
                                <p style={{ margin: 0, color: 'black' }}><strong>Course:</strong> {request.Course_no}</p>
                                {request.grade && <p style={{ margin: '3px 0 0 0', color: 'black' }}><strong>Grade:</strong> {request.grade}</p>}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <h3 style={{ color: 'black', marginTop: '25px', marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px', textAlign: 'center' }}>
                    My Clearance Checklist
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                    {ALL_DEPARTMENTS.map((deptKey) => (
                      <div key={deptKey} style={checklistLineStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: 'black' }}>
                            {deptKey.toUpperCase()}
                          </span>
                          <span style={statusBadgeStyle('Not Sent')}>
                            Not Initiated
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleInitiateClearance}
                    style={eligibilityData?.isEligible ? btnStyle : disabledBtnStyle}
                    disabled={!eligibilityData?.isEligible}
                  >
                    {eligibilityData?.isEligible ? "Apply for Clearance" : "Ineligible to Apply"}
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
                                Resubmit to {deptKey.toUpperCase()}
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

          {/* ============================================================================
              VIEW B: DEPARTMENT ADMIN INTERFACE (Organized inside Tabs)
              ============================================================================ */}
          {!isStudent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

              {/* Tabs Navigation Header */}
              <div style={tabsHeaderStyle}>
                <button
                  onClick={() => setActiveTab('pending')}
                  style={activeTab === 'pending' ? activeTabStyle : inactiveTabStyle}
                >
                  Pending ({pendingStudents.length})
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  style={activeTab === 'rejected' ? activeTabStyle : inactiveTabStyle}
                >
                  Rejected ({filteredRejected.length})
                </button>
              </div>

              {/* Dynamic Workspace based on Active Tab */}
              <div style={workspaceStyle}>

                {/* TAB 1: PENDING REQUESTS PANEL (Shows BOTH Pending and Resubmitted) */}
                {activeTab === 'pending' && (
                  <div>
                    <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '10px' }}>
                      Pending Requests ({user.role.toUpperCase()})
                    </h4>

                    {pendingStudents.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'black', backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black', marginTop: '15px' }}>
                        No pending clearance requests.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        {pendingStudents.map((request) => (
                          <div key={request._id} style={checklistLineStyle}>
                            <div style={{ marginBottom: '10px' }}>
                              <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId?.name}</p>
                              <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId?.registeration_no}</p>
                              <p style={{ margin: '3px 0', color: 'black' }}><strong>Dept:</strong> {request.studentId?.department}</p>

                              <p style={{ margin: '8px 0 3px 0', color: 'black' }}>
                                <strong>Status:</strong>{' '}
                                <span style={statusBadgeStyle(request.statuses[user.role].status)}>
                                  {request.statuses[user.role].status === 'Resubmitted' ? 'Resubmitted' : 'Pending'}
                                </span>
                              </p>
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
                                    style={{ ...btnStyle, color: 'black', backgroundColor: 'darkgrey', flex: 1, margin: 0, padding: '8px' }}
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

                {/* TAB 2: REJECTED QUEUE PANEL */}
                {activeTab === 'rejected' && (
                  <div>
                    <h4 style={{ color: 'black', marginTop: 0, fontSize: '18px', textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '10px' }}>
                      Rejected Requests ({user.role.toUpperCase()})
                    </h4>

                    <div style={{ ...searchContainerStyle, marginTop: '15px' }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by roll number..."
                        style={searchInputStyle}
                      />
                    </div>

                    {filteredRejected.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'black', fontStyle: 'italic', backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '5px', border: '1px solid black' }}>
                        No items in rejection queue.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {filteredRejected.map((request) => (
                          <div key={request._id} style={checklistLineStyle}>
                            <div style={{ marginBottom: '10px' }}>
                              <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId?.name}</p>
                              <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId?.registeration_no}</p>
                              <p style={{ margin: '8px 0 3px 0', color: 'black' }}>
                                <strong>Current Status:</strong>{' '}
                                <span style={statusBadgeStyle('Rejected')}>
                                  Rejected
                                </span>
                              </p>
                              {request.statuses[user.role].reason && (
                                <div style={rejectionReasonStyle}>
                                  <strong>Rejection Reason:</strong> {request.statuses[user.role].reason}
                                </div>
                              )}
                            </div>

                            {activeRejectionRequest === request._id ? (
                              <div style={rejectionModalStyle}>
                                <label style={{ color: 'black', fontWeight: 'bold', fontSize: '0.85rem' }}>Write New Rejection Reason:</label>
                                <textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  required
                                  style={textAreaStyle}
                                />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                  <button
                                    style={{ ...btnStyle, backgroundColor: '#8b313a', flex: 1, margin: 0, padding: '8px' }}
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

              </div>
            </div>
          )}
        </>
      )}

      {/* Shared Footer Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '25px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
        <button onClick={handleLogout} style={{ ...logoutBtnStyle, backgroundColor: 'lightgrey', color: 'black', flex: 1, marginTop: '0' }}>
          Logout
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STYLES 
// ============================================================================
const cardStyle = { padding: '30px', borderRadius: '10px', backgroundColor: 'grey', boxShadow: '3px 3px 15px black', width: '100%', maxWidth: '450px' };
const titleStyle = { textAlign: 'center', marginBottom: '30px', color: 'black', fontSize: '25px', fontWeight: 'bold' };

const infoBoxStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#e0e0e0', borderRadius: '8px', borderLeft: '5px solid black', boxShadow: 'inset 1px 1px 5px rgba(0,0,0,0.1)' };
const infoTextStyle = { margin: '5px 0', color: 'black' };

const workspaceStyle = { padding: '20px', backgroundColor: 'darkgrey', borderRadius: '8px', border: '1px solid black' };
const checklistLineStyle = { display: 'flex', flexDirection: 'column', padding: '12px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' };

const eligibilityBoxStyle = { backgroundColor: '#dedede', color: 'black', padding: '15px' };
const eligibilityRowStyle = { display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '0.95rem' };

const tabsHeaderStyle = { display: 'flex', gap: '10px', width: '100%' };
const baseTabStyle = { flex: 1, padding: '12px', border: '1px solid black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease-in-out' };
const activeTabStyle = { ...baseTabStyle, backgroundColor: 'black', color: 'white' };
const inactiveTabStyle = { ...baseTabStyle, backgroundColor: '#c0c0c0', color: 'black' };

const rejectionReasonStyle = { marginTop: '8px', padding: '8px', fontSize: '0.85rem', color: '#000000', marginBottom: '10px' };
const rejectionModalStyle = { marginTop: '10px', padding: '12px', backgroundColor: '#c2c2c2', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '5px' };
const textAreaStyle = { width: '90%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid black', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', resize: 'vertical', marginTop: '5px' };

const btnStyle = { padding: '12px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto', width: '60%' };
const disabledBtnStyle = { ...btnStyle, backgroundColor: '#555', cursor: 'not-allowed', color: '#aaa' };
const logoutBtnStyle = { padding: '12px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', width: '90%', display: 'block', marginLeft: 'auto', marginRight: 'auto' };

const approveBtnStyle = { padding: '8px 15px', backgroundColor: '#2b6438', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };
const rejectBtnStyle = { padding: '8px 15px', backgroundColor: '#892d36', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', flex: 1 };
const resubmitBtnStyle = { padding: '6px 12px', backgroundColor: 'black', color: 'white', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'block', width: '100%' };

const searchContainerStyle = { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' };
const searchInputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid black', backgroundColor: 'white', color: 'black', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };

const msgStyle = (msg) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  color: msg.includes('error') ? '#782b32' : '#28a745',
  backgroundColor: msg.includes('error') ? '#efefef' : '#ebebeb',
  padding: '10px',
  borderRadius: '5px',
  border: msg.includes('error') ? '1px solid #fefefe' : '1px solid #a2a2a2',
  marginTop: '15px',
  marginBottom: '15px'
});

const statusBadgeStyle = (status) => {
  let color = 'black';
  let fontStyle = 'normal';
  if (status === 'Approved') color = '#155724';
  if (status === 'Pending') color = '#856404';
  if (status === 'Rejected') color = '#721c24';
  if (status === 'Resubmitted') color = '#1a3653';
  return { fontWeight: 'bold', color, fontStyle, fontSize: '0.9rem' };
};

export default DashboardScreen;