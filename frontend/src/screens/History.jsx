import { useEffect } from "react";
import { useState } from "react";
import { APPROVED_REQS_URL } from "../endPoints";

function HistoryScreen({user,setScreen}){
      const [approvedStudents, setApprovedStudents] = useState([]);
      const [loading,setLoading]=useState(true);
    

    const fetchApprovedRequests=async()=>{
        try{
            setLoading(true);
            const response=await fetch(`${APPROVED_REQS_URL}?departmentRole=${user.role}`);
            const data=await response.json();
            if(response.ok){
                setApprovedStudents(data.requests);

            }
        }
        catch(error){
            console.error(error);
        }
        finally{
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchApprovedRequests();
    },[user.id]);

    return(
        <div style={mainStyle}>
            <h2>history</h2>
            <div style={{display:'flex', flexDirection:'column',gap:'15px'}}>
                {approvedStudents.map((request)=>(
                    <div key={request._id} style={checklistLineStyle}>
                        <div style={{marginBottom:'10px'}}>
                            <p style={{ margin: '3px 0', color: 'black' }}><strong>Name:</strong> {request.studentId?.name}</p>
                            <p style={{ margin: '3px 0', color: 'black' }}><strong>Roll No:</strong> {request.studentId?.registeration_no}</p>
                        </div>
                    </div>        
                ))}
            </div>

        </div>
    )


}

const checklistLineStyle = { display: 'flex', flexDirection: 'column', padding: '12px', backgroundColor: '#e0e0e0', borderRadius: '5px', border: '1px solid black' };

const mainStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: 'darkgrey', padding: '20px' };

export default HistoryScreen;
