import { useState, useEffect } from 'react';
import styles from './ChooseMap.module.css'; // Import CSS Module
import Footer from '../components/footer/footer.module.jsx'; // Import Footer component
import { useNavigate, useLocation } from 'react-router-dom';

// Mẫu dữ liệu bản đồ (có thể lấy từ API hoặc từ một tệp tin)
function ChooseMap() {
  const [selectedMap, setSelectedMap] = useState(1);
  const [maps, setMaps] = useState([]);
  const [dataKV, setDataKV] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredKV } = location.state || {}; //value là Có data hoặc undefined

  useEffect(() => {
      async function fetchStats() {
        try {
          const response = await fetch('http://localhost:3001/khuvuc');
          const data = await response.json();
          setDataKV(data);
        } catch (error) {
          console.error('Lỗi lấy dữ liệu thống kê:', error);
        }
      }
      fetchStats();
  }, []);

  // Nếu có dữ liệu khu vực được lọc, sử dụng dữ liệu đó
  useEffect(() => {
    try {
      if(filteredKV) {
        if(filteredKV.length === 0) {
          setMaps(dataKV)
          return;
        }
        setMaps(filteredKV);
      }
      else {
        setMaps(dataKV);
        console.warn('Không có dữ liệu khu vực được lọc, sử dụng dữ liệu gốc');
      }
    }
    catch (error) {
      console.error('Lỗi khi lấy dữ liệu khu vực:', error);
    }
  }, [filteredKV, dataKV]);

  const handleHoverMap = (map) => {
    setSelectedMap(map);
  };

  const handleSelectMap = (map) => {
    navigate('/Map', { state: { map } });
    localStorage.setItem('map', JSON.stringify(map)); // Lưu vào localStorage
  };

  return (
    <div className={styles.cover}>
      <div className={styles.container}>
        {/* Hiển thị các ô vuông chứa tên khu vực */}
        <div className={styles.gridContainer}>
          {maps.map((map) => (
            <button
              key={map.IdKV}
              className={styles.squareButton}
              onMouseOver ={() => handleHoverMap(map)}
              onClick = {() => handleSelectMap(map) }
            >
              {map.TenKV}
            </button>
          ))}
        </div>

        {/* Hiển thị thông tin bản đồ đã chọn */}
        {selectedMap && (
          <div className={styles.selectedMapInfo}>
            <h2 className={styles.textBando}>Bản đồ</h2>
            <h2 className={styles.tenkv}>{selectedMap.TenKV}</h2>
            <img src={selectedMap.HinhAnh} alt={selectedMap.TenKV} className={styles.mapImage} />
            <ul>
              <li className={styles.diachi}>Địa chỉ: {selectedMap.DiaChi}</li>
              <li className={styles.loaikv}>Loại khu vực: {selectedMap.LoaiKV}</li>
              <li className={styles.dientich}>
                Diện tích: {selectedMap.DienTich !== 1 ? `${selectedMap.DienTich} m²` : 'Không rõ'}
              </li>
            </ul>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}

export default ChooseMap;
