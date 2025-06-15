import { useEffect, useState } from 'react';
import styles from './Admin.module.css';


function Admin() {
  const tinhNangChuaDuocPhatTrien = 'Tính năng này chưa được phát triển'
  const [stats, setStats] = useState({
    tinh: 0,
    khuvuc: 0,
    congtrinh: 0,
    diadiem: 0,
    user: 0,
    admin: 0,
    tongTruyCap: 0,
    truyCapMax: 0,
    truyCapHienTai: 0,
  });

  const [heThongInfo, setHeThongInfo] = useState({
    phatTrien: null,
    quanTri: null ,
    batDau: null,
  });

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupAction, setPopupAction] = useState(''); // 'them', 'sua', 'xoa', 'capnhat'

  const openPopup = (action) => {
    setPopupAction(action);
    setPopupOpen(true);
  }
  
  const handleLogout = () => {
    localStorage.removeItem('NSD');
    window.location.href = '/'; // hoặc '/' tùy định tuyến của bạn
  };


  // Giả lập fetch dữ liệu từ database
  useEffect(() => {
    // Giả lập dữ liệu
    const curQtv = localStorage.getItem('NSD')
    const curQtvName = JSON.parse(curQtv).TenNSD
    const infoHeThong = {
      phatTrien: 'Lường Văn Hạnh',
      quanTri: curQtvName ,
      batDau: '___',
    }
    setHeThongInfo(infoHeThong);

    const thongKe = localStorage.getItem('Thongke');
    if (!thongKe) {
      console.warn('Không có dữ liệu thống kê nào');
      return;
    }
    const data = JSON.parse(thongKe);
    const thongKeDuLieu = {
      tinh: data.soLuongTinh,
      khuvuc: data.soLuongKhuVuc,
      congtrinh: data.soLuongCongTrinh,
      diadiem: data.soLuongDiaDiem,
      user: data.soLuongUser,
      admin: data.soLuongAdmin,
      tongTruyCap: '___',
      truyCapMax: '___',
      truyCapHienTai: '___',
    };
    setStats(thongKeDuLieu);
  }, []);

  return (
    <div className={styles.adminPage}>
      <h2>Trang Quản Trị Hệ Thống</h2>
      <div className={styles.mainContainer}>
        {/* KHỐI BÊN TRÁI */}
        <div className={styles.leftPanel}>
          {/* CRUD */}
          <section className={styles.section}>
            <h3>Quản lý dữ liệu hệ thống</h3>
            <p>Chỉ quản trị viên mới có tính năng này!</p>
            <div className= {styles.blockBTN}>
              <button className={styles.crudBtn} onClick={() => openPopup('thêm')}>➕ Thêm dữ liệu</button>
              <button className={styles.crudBtn} onClick={() => openPopup('sửa')}>📝 Sửa dữ liệu</button>
              <button className={styles.crudBtn} onClick={() => openPopup('xoá')}>🗑️ Xoá dữ liệu</button>
              <button className={styles.crudBtn} onClick={() => openPopup('cập nhật')}>🔄 Cập nhật dữ liệu</button>
            </div>
          </section>

          {/* THÔNG TIN HỆ THỐNG */}
          <section className={styles.section}>
            <h3>Thông tin hệ thống</h3>
            <ul>
              <li><strong>Người phát triển:</strong> {heThongInfo.phatTrien}</li>
              <li><strong>Người quản trị:</strong> {heThongInfo.quanTri}</li>
              <li><strong>Hệ thống hoạt động từ:</strong> {heThongInfo.batDau}</li>
            </ul>
          </section>

          {/* ĐĂNG XUẤT */}
          <section className={styles.section}>
            <button onClick={handleLogout} className={styles.logoutBtn}>🚪 Đăng xuất</button>
          </section>
        </div>

        {/* KHỐI BÊN PHẢI */}
        <div className={styles.rightPanel}>
          {/* THỐNG KÊ */}
          <section className={styles.section}>
            <h3>Thống kê dữ liệu tổng quan</h3>
            <div className={styles.grid}>
              <div className={styles.card}>Tỉnh: <strong>{stats.tinh}</strong></div>
              <div className={styles.card}>Khu vực: <strong>{stats.khuvuc}</strong></div>
              <div className={styles.card}>Công trình: <strong>{stats.congtrinh}</strong></div>
              <div className={styles.card}>Địa điểm: <strong>{stats.diadiem}</strong></div>
              <div className={styles.card}>Người dùng: <strong>{stats.user}</strong></div>
              <div className={styles.card}>Admin: <strong>{stats.admin}</strong></div>
            </div>
          </section>

          {/* TRUY CẬP */}
          <section className={styles.section}>
            <h3>Thống kê truy cập</h3>
            <div className={styles.grid}>
              <div className={styles.card}>Tổng lượt truy cập: <strong>{stats.tongTruyCap}</strong></div>
              <div className={styles.card}>Số người online tối đa: <strong>{stats.truyCapMax}</strong></div>
              <div className={styles.card}>Số người đang online: <strong>{stats.truyCapHienTai}</strong></div>
            </div>
          </section>
          <section className={styles.section}>
            <h3>Lịch sử thao tác với dữ liệu gần nhất</h3>
              <p>{tinhNangChuaDuocPhatTrien}</p>
          </section>
        </div>
      </div>

      {/* POPUP */}
      {popupOpen && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <h3>{popupAction.toUpperCase()} Dữ liệu</h3>
            <p>{tinhNangChuaDuocPhatTrien}</p>
            <div className={styles.popupButtons}>
              <button onClick={() => setPopupOpen(false)}>❌ Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
