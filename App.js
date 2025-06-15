import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import ChooseMap from './pages/ChooseMap';
import Map from './pages/Map';
import Admin from './pages/Admin';
import User from './pages/User';
import Nav from './components/navbars/nav.module.jsx';
import AuthPopup from './components/Signin/SigninPopup.module.jsx';

function App() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra user trong localStorage khi load trang
    const storedUser = localStorage.getItem('NSD');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleRequestAuthForm = () => setShowAuthForm(true);
  const handleCloseAuthForm = () => setShowAuthForm(false);
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuthForm(false);
  };

  return (
    <Router>
      <div>
        <Nav user={user} setUser={setUser} onRequestAuthForm={handleRequestAuthForm} />
        {showAuthForm && (
          <AuthPopup onClose={handleCloseAuthForm} onLoginSuccess={handleLoginSuccess} />
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ChooseMap" element={<ChooseMap />} />
          <Route path="/Map" element={<Map />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
