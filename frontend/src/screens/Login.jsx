// frontend/src/screens/Login.jsx
import { useState } from 'react';
import { SIGNIN_URL } from '../endPoints';
import { useEffect } from 'react';

function LoginScreen({ setScreen, setUser, setMessage, message }) {
  const [loginRegNo, setLoginRegNo] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(''); 
      }, 2000);

      return () => clearTimeout(timer); 
    }
  }, [message, setMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(SIGNIN_URL, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registeration_no: loginRegNo, password: loginPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setScreen('dashboard'); 
      } else {
        setMessage(` Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server.");
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>University Clearance System</h2>

      {message && <p style={msgStyle(message)}>{message}</p>}

      <form onSubmit={handleLogin} style={formStyle}>
        <label style={{ color: 'black' }}>Registration Number</label>
        <input type="text" value={loginRegNo} onChange={(e) => setLoginRegNo(e.target.value)} style={inputStyle} />

        <label style={{ color: 'black' }}>Password:</label>
        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={inputStyle} />


      </form>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'row', marginTop: '27px', marginBottom: '28px', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
        <button type="submit" style={{ padding: '10px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: 'black', color: 'lightgrey', border: '1px solid black', borderRadius: '6px', cursor: 'pointer' }}>Login</button>


        <button onClick={() => { setScreen('signup'); setMessage(''); }} style={{ padding: '9px', backgroundColor: 'grey', color: 'black', border: '1px solid black', borderRadius: '6px', cursor: 'pointer', }}>Sign Up</button>
        
      </form>


    </div>
  );
}

const cardStyle = { padding: '30px', borderRadius: '10px', backgroundColor: 'grey', boxShadow: '3px 3px 15px black', width: '100%', maxWidth: '450px' };
const titleStyle = { textAlign: 'center', marginBottom: '50px', color: 'black', fontSize: '25px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid black', backgroundColor: 'darkgrey', color: 'black', fontSize: '1rem', marginBottom: '20px' };
const btnStyle = { padding: '12px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const linkStyle = { color: 'white', cursor: 'pointer', textDecoration: 'underline' };
const msgStyle = (msg) => ({ textAlign: 'center', fontWeight: 'bold', color: msg.includes('❌') ? '#dc3545' : '#28a745', backgroundColor: msg.includes('❌') ? '#f8d7da' : '#d4edda', padding: '10px', borderRadius: '5px', border: msg.includes('❌') ? '1px solid #f5c6cb' : '1px solid #c3e6cb' });

export default LoginScreen;