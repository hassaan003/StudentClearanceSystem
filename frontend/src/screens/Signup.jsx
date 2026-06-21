import { useState } from 'react';
import { SIGNUP_URL } from '../endPoints';
//this sub compoonent that recieves props(variables and fuctions) from App.jsx.
//setScreen, setMessage are passed down, so this screen can redirect to the user.
function SignupScreen({ setScreen, setMessage, message }) {
  //useState() creates state variables.
  //setName is only function that is allowed to change the value of name.
  const [name, setName] = useState('');
  const [registerationNo, setRegisterationNo] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');

  //async tells react that this function is doing backround work and might take time.
  const handleSignup = async (e) => {
    e.preventDefault();     //e.prevetDefault() stops webpage from automatically reloading when form is submitted.

    setMessage('');  //clears all fields once form is submitted.

    //it creates a data object formatted exactly as our backend schema expects.
    const formData = {
      name: name,
      registeration_no: registerationNo,
      password: password,
      phoneNumber: phoneNumber,
      department: department
    };

    try {
      const response = await fetch(SIGNUP_URL, { //fetch sends network request, await pauses this function until the server responds.
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // tells server we are sending data in json.
        },
        body: JSON.stringify(formData) // converts js object into simple text string.
      });

      //converts response from backend to readable js object.
      const data = await response.json();

      if (response.ok) {
        // Sets the success message and redirects to login instantly
        setMessage(`success ${data.message || 'User registered successfully!'} please login`);
        setScreen('login');
      } else {
        setMessage('error ' + (data.message || 'Registration failed'));
      }

    }
    catch (error) {
      console.error(error);
      setMessage('cannot connect to server');
    }
  };
  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>Student Registration</h2>
      {message && <p style={msgStyle(message)}>{message}</p>}


      {/* 'onSubmit' triggers the registration handler when the form button is clicked */}
      <form onSubmit={handleSignup} style={formStyle}>
        <label style={labelStyle}>Full Name:</label>
        {/* 'onChange' detects typing. 'e.target.value' grabs the letter typed and saves it to state */}
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>Registration No</label>
        <input type="text" value={registerationNo} onChange={(e) => setRegisterationNo(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>Phone Number</label>
        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>Department</label>
        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle} />

        <button type="submit" style={btnStyle}>Register</button>
      </form>

      <p style={{ color: 'black', textAlign: 'center', marginTop: '15px' }}>
        Already have an account?{' '}
        {/* Clicking this text switches the active view back to login */}
        <span style={linkStyle} onClick={() => { setScreen('login'); setMessage(''); }}>Log In</span>
      </p>
    </div>
  );

}
const labelStyle = { color: 'black' };
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', padding: '20px' };
const cardStyle = { padding: '30px', borderRadius: '10px', backgroundColor: 'grey', boxShadow: '3px 3px 15px black', width: '100%', maxWidth: '450px' };
const titleStyle = { textAlign: 'center', marginBottom: '30px', color: 'black', fontSize: '25px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '10px', color: 'black', backgroundColor: 'darkgrey', borderRadius: '5px', border: '1px solid black', fontSize: '1rem' };
const btnStyle = { padding: '12px', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', margin: '20px', marginLeft: '100px', marginRight: '100px' };
const linkStyle = { color: 'lightgrey', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' };
const msgStyle = (msg) => ({ 
  textAlign: 'center', 
  fontWeight: 'bold', 
  color: msg.includes('error') ? '#dc3545' : '#28a745', 
  backgroundColor: msg.includes('error') ? '#f8d7da' : '#d4edda', 
  padding: '10px', 
  borderRadius: '5px', 
  border: msg.includes('error') ? '1px solid #f5c6cb' : '1px solid #c3e6cb' 
});

export default SignupScreen;