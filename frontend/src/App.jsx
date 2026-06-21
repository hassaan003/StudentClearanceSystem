// frontend/src/App.jsx
import { useState } from 'react';

// 'import ... from "./screens/..."' tells React to pull the screen workers we created into this file.
import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import DashboardScreen from './screens/Dashboard';

function App() {
  // 'screen' state handles routing ('login', 'signup', 'dashboard')
  const [screen, setScreen] = useState('login'); 
  // 'user' state handles global context data of who is actively operating the software
  const [user, setUser] = useState(null); 
  // 'message' state handles simple text notifications across the panels
  const [message, setMessage] = useState(''); 

  const handleLogout = () => {
    setUser(null); // Empties out the user state object completely
    setMessage(''); // Erases status text string
    setScreen('login'); // Boots user interface redirection to the login view window
  };

  return (
    <div style={containerStyle}>
      {/* Short-circuit evaluation logic strings -> if screen condition matches, render that screen file */}
      
      {screen === 'login' && (
        // Passing states down to LoginScreen as properties (Props)
        <LoginScreen setScreen={setScreen} setUser={setUser} setMessage={setMessage} message={message} />
      )}
      
      {screen === 'signup' && (
        <SignupScreen setScreen={setScreen} setMessage={setMessage} message={message} />
      )}
      
      {screen === 'dashboard' && user && (
        <DashboardScreen user={user} handleLogout={handleLogout} />
      )}
    </div>
  );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: 'darkgrey', padding: '20px' };

export default App;