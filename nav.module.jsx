import styles from './nav.module.css';
import SearchBar from '../search.module';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa";

function Nav({ onRequestAuthForm, user, setUser }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (onRequestAuthForm) {
      onRequestAuthForm();
    }
  };

  const goToProfile = () => {
    if (!user) return;
    if (user.VaiTro === "Admin") {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  useEffect(() => {
    if (user && user.isLoggedIn) {
      setIsLoggedIn(true);
      console.log('Đã nhận user:', user);
      console.log('VaiTro:', user.VaiTro);
    }
  }, [user]);

  return (
    <div id={styles.nav}>  
      <div className={styles.info}>
        <div className={`${styles.navItem} ${styles.icon}`}>
          <img src="/iconMap/favicon.png" alt="" />
        </div>
        <div className={`${styles.navItem} ${styles.title}`}>
          <p>Hệ thống điều hướng khu vực</p>
        </div>
      </div>

      <SearchBar placeholder="Tìm kiếm..." />

      <div className={styles.navItems}>
        <div className={styles.navItem}>
          <NavLink to="/">Trang chủ</NavLink>
        </div>
        <div className={styles.navItem}>
          <NavLink to="/ChooseMap">Chọn bản đồ</NavLink>
        </div>
        <div className={styles.navItem}>
          <NavLink to="/Map">Bản đồ</NavLink>
        </div>

        <div className={styles.navItem}>
          {isLoggedIn ? (
            <div className={styles.userInfo} onClick={goToProfile} >
              {user.VaiTro === "Admin" ? <FaUserShield /> : <FaUser />}
              <span>{user.TenNSD}</span>
            </div>
          ) : (
            <button onClick={handleLoginClick}>Đăng nhập</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Nav;
