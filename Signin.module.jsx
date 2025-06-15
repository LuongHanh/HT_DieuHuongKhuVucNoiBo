import { useState } from 'react';
import styles from './Signin.module.css'; // CSS Module riêng cho form

function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // true: Đăng nhập, false: Đăng ký
  const [ten, setTen] = useState('');
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMK, setXacNhanMK] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi trước khi submit

    try {
      const response = await fetch('http://localhost:3001/nguoisudung');
      const users = await response.json();

      if (isLogin) {
        // Xử lý đăng nhập
        const foundUser = users.find((user) => user.TenDN === tenDangNhap);
        if (!foundUser) {
          setError('Sai tên đăng nhập');
          return;
        }
        if (foundUser.MatKhau !== matKhau) {
          setError('Sai mật khẩu!');
          return;
        }

        foundUser.isLoggedIn = true;
        localStorage.setItem('NSD', JSON.stringify(foundUser));
        onLoginSuccess(foundUser); // Thực hiện sau khi đăng nhập thành công
      } else {
        // Xử lý đăng ký
        const userExists = users.some((user) => user.TenDN === tenDangNhap);
        if (userExists) {
          setError('Tên đăng nhập đã tồn tại!');
          return;
        }
        if (matKhau !== xacNhanMK) {
          setError('Mật khẩu xác nhận không khớp!');
          return;
        }

        const newUser = {
          TenNSD: ten,
          TenDN: tenDangNhap,
          MatKhau: matKhau,
          VaiTro: 'user',
          DoiTuong: null
        };

        // Gửi yêu cầu đăng ký người dùng mới
        const registerResponse = await fetch('http://localhost:3001/insertnguoisudung', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(newUser)
        });
        console.log('Đăng ký người dùng mới:', newUser)

        if (!registerResponse.ok) {
          setError('Lỗi khi tạo tài khoản, vui lòng thử lại.');
          console.error('Lỗi khi tạo tài khoản:', registerResponse.statusText);
          return;
        }

        const registeredUser = await registerResponse.json();
        console.log('Đăng ký người dùng mới:', registeredUser);

        // Lưu vào localStorage và gọi onLoginSuccess
        localStorage.setItem('NSD', JSON.stringify(registeredUser));
        onLoginSuccess(registeredUser);
      }
    } catch (error) {
      console.error('Lỗi hệ thống:', error);
      setError('Lỗi hệ thống, vui lòng thử lại sau.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Họ và tên"
            value={ten}
            onChange={(e) => setTen(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={tenDangNhap}
          onChange={(e) => setTenDangNhap(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={xacNhanMK}
            onChange={(e) => setXacNhanMK(e.target.value)}
            required
          />
        )}
        <button type="submit">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
        {error && <p className={styles.errorText}>{error}</p>}
      </form>

      <p className={styles.toggleText}>
        {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
        <span
          onClick={() => {
            setIsLogin(!isLogin);
            setError(''); // Reset lỗi khi chuyển qua form khác
          }}
        >
          {isLogin ? 'Đăng ký' : 'Đăng nhập'}
        </span>
      </p>
    </div>
  );
}

export default AuthForm;
