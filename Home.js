import { useEffect, useState } from 'react';
import Banner from '../components/banner.module.jsx';
import styles from './Home.module.css'; // Import styles từ CSS module
import { FaSearch, FaRoute, FaMapMarkedAlt } from 'react-icons/fa'; // Import icon
import Footer from '../components/footer/footer.module.jsx';

function Home() {
  const [stats, setStats] = useState({ soLuongTinh: 0, soLuongKhuVuc: 0, soLuongDiaDiem: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('http://localhost:3001/stats');
        const data = await response.json();
        setStats(data);
        localStorage.setItem('Thongke', JSON.stringify(data)); // Lưu vào localStorage
      } catch (error) {
        console.error('Lỗi lấy dữ liệu thống kê:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <>
      {/* Nội dung Trang chủ */}
      <div className={styles['home-container']}>
        <Banner />
        <h3 className={styles['textinfo']}>Hiện tại hệ thống có</h3>
        <div className={styles['stats-container']}>
          <div className={styles['stat-item']}>
            <h4>Tỉnh</h4>
            <p>{stats.soLuongTinh}</p>
          </div>
          <div className={styles['divider']}></div>
          <div className={styles['stat-item']}>
            <h4>Khu vực</h4>
            <p>{stats.soLuongKhuVuc}</p>
          </div>
          <div className={styles['divider']}></div>
          <div className={styles['stat-item']}>
            <h4>Địa điểm</h4>
            <p>{stats.soLuongDiaDiem}</p>
          </div>
        </div>
      </div>

      <section className={styles.features}>
        <h2 className={styles.title}>Tính năng nổi bật</h2>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <FaSearch className={styles.icon} />
            <h3>Tìm kiếm địa điểm</h3>
            <p>Tra cứu nhanh các công trình, khu vực bạn cần tìm.</p>
          </div>
          <div className={styles.featureItem}>
            <FaRoute className={styles.icon} />
            <h3>Xem đường đi nhanh nhất</h3>
            <p>Xác định lộ trình ngắn nhất tới địa điểm mong muốn chỉ trong vài giây.</p>
          </div>
          <div className={styles.featureItem}>
            <FaMapMarkedAlt className={styles.icon} />
            <h3>Gợi ý địa điểm</h3>
            <p>Đề xuất các địa điểm, tiện ích, dịch vụ trong khu vực.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
