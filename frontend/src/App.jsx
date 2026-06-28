// frontend/src/App.jsx
import { useState } from 'react';

import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import DashboardScreen from './screens/Dashboard';
import HistoryScreen from './screens/History';

function App() {
  const [screen, setScreen] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [message, setMessage] = useState(''); 

  const handleLogout = () => {
    setUser(null); 
    setMessage(''); 
    setScreen('login'); 
  };

  const handleHistory=()=>{
    setScreen('history');

  }

  return (
    <div style={containerStyle}>
      
      {screen === 'login' && (
        <LoginScreen setScreen={setScreen} setUser={setUser} setMessage={setMessage} message={message} />
      )}
      
      {screen === 'signup' && (
        <SignupScreen setScreen={setScreen} setMessage={setMessage} message={message} />
      )}
      
      {screen === 'dashboard' && user && (
        <DashboardScreen user={user} handleLogout={handleLogout} handleHistory={handleHistory} />
      )}

      {screen==='history'&&(
        <HistoryScreen user={user} setScreen={setScreen}/>
      )}
    </div>
  );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: 'darkgrey', padding: '20px' };

export default App;