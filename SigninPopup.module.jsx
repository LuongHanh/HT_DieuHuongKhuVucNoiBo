import React from 'react';
import AuthForm from './Signin.module.jsx';
import styles from './SigninPopup.module.css'; // Import CSS module

function AuthPopup({ onClose, onLoginSuccess }) {
  const handleLogin = (user) => {
    onLoginSuccess(user);
    onClose(); // Đóng popup sau khi đăng nhập thành công
  };

  return (
    <div className={styles.authFormOverlay} onClick={onClose}>
      <div className={styles.authFormContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.authWrapper}>
          <button className={styles.closeButton} onClick={onClose}>X</button>
          <AuthForm onLoginSuccess={handleLogin} />
        </div>
      </div>
    </div>
  );
}

export default AuthPopup;
