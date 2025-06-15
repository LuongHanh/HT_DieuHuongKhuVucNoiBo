import { useState, useEffect } from 'react';
import styles from './User.module.css';
import Footer from '../components/footer/footer.module';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

function User() {
  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [latestJourney, setLatestJourney] = useState(null);
  const [historyJourneys, setHistoryJourneys] = useState({});
  const [latestPasswordChange, setLatestPasswordChange] = useState(null);
  const [latestPath, setLatestPath] = useState(null);
  const [logs, setLogs] = useState(null);
  const navigate = useNavigate();

  const goToMap = (c,journey=null, index =null) => {
    switch (c) {
      case 1:
        navigate('/Map',{ state: { TenCtFrom: latestPath.TenDiemBatDau, TenCtTo: latestPath.TenDiemKetThuc, PathJson: latestPath.PathJson} });
        break;
      case 2:
        if (journey) {
          navigate('/Map', { state: { TenCtFrom: journey.tenLoTrinh.split('"')[1], TenCtTo: journey.tenLoTrinh.split('"')[3] , PathJson: logs[index].PathJson}});
        } else {
          alert("Không tìm thấy thông tin lộ trình");
        }
        break;
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('NSD'));
    if (storedUser) {
      setUser(storedUser);
      getLogPassword(storedUser);
      getLogPath(storedUser);
    }
  }, []); // Chỉ lấy dữ liệu khi có user đăng nhập

  useEffect(() => {
    if (user && latestPath && logs) {
      console.log('thoiGian:', latestPath.TgBatDau);
      setLatestJourney({
        tenKhuVuc: latestPath.TenKV,
        tenLoTrinh: `Từ "${latestPath.TenDiemBatDau}" đến "${latestPath.TenDiemKetThuc}"`,
        thoiGian: latestPath.TgBatDau,
      });
      const top10Journeys = {};
      
      for (let i = 0; i < 10; i++) {
        const log = logs[i];
        // Nếu khu vực chưa có trong object thì tạo mới
        if (!top10Journeys[log.TenKV]) {
          top10Journeys[log.TenKV] = [];
        }
        // Thêm lộ trình vào khu vực tương ứng
        top10Journeys[log.TenKV].push({
          tenLoTrinh: `Từ "${log.TenDiemBatDau}" đến "${log.TenDiemKetThuc}"`,
          thoiGian: log.TgBatDau || null, // Sử dụng thời gian nếu có
        });
      }
      setHistoryJourneys(top10Journeys);
    }
  }, [user, latestPath, logs]);

  const formatDate = (dateString) => {
    if (!dateString) return '---'; // Trả về dấu gạch ngang nếu không có dữ liệu
    const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth() + 1; // tháng bắt đầu từ 0
    const year = date.getFullYear();
    const weekday = weekdays[date.getDay()];

    return `${weekday}, ngày ${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
  };

  const getLogPassword = async (Curser) => {
    try {
      const res = await fetch(`http://localhost:3001/getlogpassword?IdNSD=${Curser.IdNSD}`);
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setLatestPasswordChange(data.latestTime); // Cập nhật state lưu thời gian
      } else {
        alert(data.error || 'Lỗi lấy thời gian đổi mật khẩu');
      }
    } catch (error) {
      console.error('Lỗi fetch:', error);
      console.error('Không thể kết nối tới server');
    }
  };

  const getLogPath = async (Curser) => {
    try {
      const res = await fetch(`http://localhost:3001/getlogpath?IdNSD=${Curser.IdNSD}`);
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        if (data.latestPath !== null) {
          setLatestPath(data.latestPath);
          setLogs(data.logs);  
        } else {
          console.warn('Không có dữ liệu logpath');
        }
      } else {
        alert(data.error || 'Lỗi Lấy IdLog lớn nhất');
      }
    } catch (error) {
      console.error('Lỗi fetch:', error);
      console.error('Không thể kết nối tới server');
    }
  };
  
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return alert('Vui lòng điền đầy đủ thông tin');
    }

    if (newPassword !== confirmPassword) {
      return alert('Xác nhận mật khẩu không khớp');
    }

    try {
      const res = await fetch('http://localhost:3001/changepassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          IdNSD: user.IdNSD,
          OldMK: oldPassword,
          NewMK: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Lỗi đổi mật khẩu');
      }
    } catch (error) {
      console.error('Lỗi kết nối đến server');
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('NSD');
    window.location.href = '/';
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <>
      <div className={styles.userPage}>
        <h2>Trang thông tin người dùng</h2>

        <div className={styles.container}>
          {/* LEFT SIDE - Thông tin người dùng */}
          <div className={styles.leftPanel}>
            <div className={styles.section}>
              <strong>Tên người dùng:</strong> 
              {user.TenNSD}
            </div>

            <div className={styles.section}>
              <h3>Đổi mật khẩu</h3>
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={() => {handleChangePassword(); getLogPassword()}}>Đổi mật khẩu</button>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn}>
              🚪 Đăng xuất
            </button>
          </div>

          {/* RIGHT SIDE - Hành trình */}
          <div className={styles.rightPanel}>
            <div className={styles.section}>
              <h3>Lịch sử đổi mật khẩu gần nhất</h3>
              <div>
                <p><strong>Bạn đã đổi mật khẩu gần nhất vào: </strong> {latestPasswordChange ? formatDate(latestPasswordChange) : 'Chưa đổi mật khẩu lần nào'}</p>
              </div>
            </div>
            <div className={clsx(styles.section,styles.latestJourney)}>
              <h3>Hành trình mới nhất</h3>
              {latestJourney ? (
                <div>
                  <p><strong>Tên khu vực:</strong> {latestJourney.tenKhuVuc}</p>
                  <p className={styles.nameJourney} onClick={() => goToMap(1)}><strong>Tên lộ trình:</strong> {latestJourney.tenLoTrinh}</p>
                  <p><strong>Thời gian:</strong> {formatDate(latestJourney.thoiGian)}</p>
                </div>
              ) : (
                <p>Chưa có hành trình nào</p>
              )}
            </div>

            <div className={clsx(styles.section,styles.top10Journeys)}>
              <h3>Lịch sử 10 hành trình gần nhất</h3>
              {Object.entries(historyJourneys).length > 0 ? (
                  <ul>
                    {Object.entries(historyJourneys).map(([key, journeys]) => (
                      <li key={key}>
                        <strong>{key}</strong>
                        <ul>
                          {journeys.map((journey, index) => (
                            <li key={index} className={styles.nameJourney} onClick={() => goToMap(2,journey, index)}>
                              {journey.tenLoTrinh} - <i>{formatDate(journey.thoiGian)}</i>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Chưa có lịch sử hành trình</p>
                )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default User;
