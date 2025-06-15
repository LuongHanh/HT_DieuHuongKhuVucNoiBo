import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import Footer from '../components/footer/footer.module.jsx';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './Map.module.css';
import clsx from 'clsx';

// Cấu hình icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// Cấu hình các icon khác
const customSmallIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'), // hoặc đường dẫn tùy bạn
  iconSize: [20, 30], // nhỏ hơn icon mặc định
  iconAnchor: [10, 30],
  popupAnchor: [0, -30],
});
const createIcon = (iconUrl, iconSize = [20, 20], iconAnchor = [8, 16], popupAnchor = [0, -28]) =>
  new L.Icon({ iconUrl, iconSize, iconAnchor, popupAnchor });

const iconMap = {
  'Cổng': createIcon('/iconMap/cong.png'),
  'Ký túc xá': createIcon('/iconMap/ktx.png'),
  'Toà nhà học tập': createIcon('/iconMap/gd.png'),
  'Toà nhà hành chính': createIcon('/iconMap/ndh.png'),
  'Tòa nhà làm việc của CB-GV': createIcon('/iconMap/tn.png'),
  'Toà nhà': createIcon('/iconMap/tn.png'),
  'Thư viện': createIcon('/iconMap/tv.png'),
  'Văn phòng': createIcon('/iconMap/vp.png'),
  'Nhà xưởng': createIcon('/iconMap/nx.png'),
  'Khu dịch vụ': createIcon('/iconMap/kdv.png'),
  'Ao': createIcon('/iconMap/ao.png'),
  'Phòng bảo vệ': createIcon('/iconMap/pbv.png'),
  'Quảng trường': createIcon('/iconMap/qt.png'),
  'Biểu trượng': createIcon('/iconMap/bt.png'),
  'Biểu tượng': createIcon('/iconMap/bt.png'),
  'Đài phun nước': createIcon('/iconMap/dpn.png'),
  'Sân bóng': createIcon('/iconMap/sb.png'),
  'Sân Pickerball': createIcon('/iconMap/sp.png'),
  'Sân bóng rổ': createIcon('/iconMap/sbr.png'),
  'Sân vận động': createIcon('/iconMap/svd.png'),
  'Nhà để xe': createIcon('/iconMap/ndx.png'),
};

const getCustomIcon = (LoaiCT) => iconMap[LoaiCT] || customSmallIcon;

function Map() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState(location.state?.selectedMap || null);
  const {TenCtFrom, TenCtTo, PathJson } = location.state || {}; //value là Có data hoặc undefined
  const {searchMap} = location.state || {}; //value là Có data hoặc undefined
  const pathInfo = PathJson ? JSON.parse(PathJson) : null;
  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'street

  const [dataCT, setDataCT] = useState([]);
  const [dataDD, setDataDD] = useState([]);
  const [doanDuong, setDoanDuong] = useState([]);
  const [diemGiaoThong, setDiemGiaoThong] = useState([]);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [vehicle, setVehicle] = useState('foot');
  const [routeInfo, setRouteInfo] = useState(null);

  const [suggestionsFrom, setSuggestionsFrom] = useState([]);
  const [suggestionsTo, setSuggestionsTo] = useState([]);
  const [fromCT, setFromCT] = useState(null);
  const [toCT, setToCT] = useState(null);
  const [dataGraph, setDataGraph] = useState([]);
  const [polylinePositions, setPolylinePositions] = useState({});

  const [isMoving, setIsMoving] = useState(false); // để bắt đầu/dừng mô phỏng
  const movingMarkerRef = useRef(null); // Tham chiếu đến marker động
  const movingIndexRef = useRef(0);
  const progressRef = useRef(0);
  const animationRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(polylinePositions[0]);
  const [isOpen, setIsOpen] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  const toggleSidebar = () => setIsOpen(!isOpen);
  // PolylinePositions đã được set từ trước (pathInfo)
  const startSimulation = () => {
    if (polylinePositions.length < 2) return;
    setIsMoving(true);
    movingIndexRef.current = 0;
    progressRef.current = 0;
    move();
  };

  const move = () => {
    const index = movingIndexRef.current;
    const progress = progressRef.current;

    if (index >= polylinePositions.length - 1) {
      setIsMoving(false);
      cancelAnimationFrame(animationRef.current);
      return;
    }
    if(!polylinePositions[index]) { //Chưa có lộ trình thì không mô phỏng
      alert('Chưa có lộ trình nào để mô phỏng!');
      return;
    }
    const start = polylinePositions[index];
    const end = polylinePositions[index + 1];

    const lat = start[0] + (end[0] - start[0]) * progress;
    const lng = start[1] + (end[1] - start[1]) * progress;
    setCurrentPosition([lat, lng]);

    // Tăng progress
    progressRef.current += 0.02; // Độ mượt
    if (progressRef.current >= 1) {
      movingIndexRef.current += 1;
      progressRef.current = 0;
    }
    animationRef.current = requestAnimationFrame(move);
  };

  const stopSimulation = () => {
    setIsMoving(false);
    cancelAnimationFrame(animationRef.current);
  };

  // Lấy bản đồ từ state nếu có, nếu không thì lấy từ localStorage  
  useEffect(() => {
    const handleLogPathFrom = () => {
      if(dataCT.length === 0) {
        console.warn('⚠ dataCT vẫn rỗng!');
      } else if (TenCtFrom && TenCtTo) {
        setFrom(TenCtFrom);
        setTo(TenCtTo);
        handleCompleteEnter(TenCtFrom, 0); // Cập nhật từ
        handleCompleteEnter(TenCtTo, 1); // Cập nhật đến
        
        setRouteInfo({
          description: `Từ "${TenCtFrom}" đến "${TenCtTo}"`,
          distance: `${pathInfo.distance} mét`,
          speed: `${pathInfo.speed} km/h`,
          duration: pathInfo.timeText
        });
        const getList = pathInfo.path
          .map(id => {
            const dd = diemGiaoThong.find(item => item.IdDiem === Number(id));
            return dd? [dd.ViDo, dd.KinhDo] : null;
          })
        .filter(Boolean); // loại bỏ null*/
        setPolylinePositions(getList)
        // Cập nhật state bằng cách navigate lại (nếu muốn reset)
        navigate('/Map', {
          replace: true,
          state: {
            IdFrom: undefined,
            IdTo: undefined,
          },
        });
        // Cập nhật state bằng cách navigate lại (nếu muốn reset)
      } else {
        console.warn('Không có bản đồ nào được chọn hoặc lưu trữ.');
      }
    }
    handleLogPathFrom()
  }, [TenCtFrom, TenCtTo, dataCT]);

  // Lấy bản đồ từ localStorage nếu chưa có
  useEffect(() => {
    if (searchMap) {
      setSelectedMap(searchMap);
      localStorage.setItem('map', JSON.stringify(searchMap)); // Lưu vào localStorage
      return;
    }

    if (!selectedMap) {
      const storedMap = localStorage.getItem('map');
      if (storedMap) {
        setSelectedMap(JSON.parse(storedMap));
      }
    }
  }, [selectedMap, searchMap]);

  useEffect(() => {
    if (!selectedMap?.IdKV) return;

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/getDataMap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IdKV: selectedMap.IdKV }),
        });

        if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu bản đồ');

        const data = await res.json();
        setDataCT(Array.isArray(data.congtrinh) ? data.congtrinh : []);
        setDataDD(Array.isArray(data.diadiem) ? data.diadiem : []);
        setDoanDuong(Array.isArray(data.doanduong) ? data.doanduong : []);
        setDiemGiaoThong(Array.isArray(data.diemgiaothong) ? data.diemgiaothong : []);
      } catch (err) {
        console.error('Lỗi tải bản đồ:', err);
      }
    };

    fetchData();
  }, [selectedMap]);

  const convertToGraph = () => {
    const graph = {};
    doanDuong.forEach(path => {
      const { DiemDau, DiemCuoi, DoDai, TrangThai, IsMain } = path;
  
      if (TrangThai !== "Không cấm") return; // Bỏ qua các đường bị cấm
      const from = String(DiemDau);
      const to = String(DiemCuoi);
      // Thêm chiều từ A đến B
      if (!graph[from]) graph[from] = [];
      graph[from].push({ to: to, cost: DoDai });

      // Thêm chiều từ B đến A (nếu là hai chiều)
      if (!graph[to]) graph[to] = [];
      graph[to].push({ to: from, cost: DoDai });
    });
    setDataGraph(graph) //đã ok chuẩn graph theo danh sách kề
  }

  useEffect(() => {
    if(doanDuong.length > 0) {
    convertToGraph();
  } else {
    console.warn("⚠ doanDuong vẫn rỗng!");
  }
  },[doanDuong])

  const findSuggestions = (keyword) => {
    if (!keyword || typeof keyword !== 'string') return dataCT;

    const key = keyword.toLowerCase().trim();

    return dataCT.filter(ct => {
      const ten = ct.TenCT;
      const mota = ct.MoTa;
      const tenOk = typeof ten === 'string' && ten.toLowerCase().includes(key);
      const motaOk = typeof mota === 'string' && mota.toLowerCase().includes(key);
      return tenOk || motaOk;
    });
  };


  const handleChangeFrom = (e) => {
    const val = e.target.value;
    setFrom(val);
    const suggestions = findSuggestions(val);
    setSuggestionsFrom(suggestions);
  };

  const handleCompleteEnter = (v, c) => {
    // Nếu người dùng nhập chính xác tên địa điểm, lấy Id
    //const suggestions = findSuggestions(v);
    const matched = dataCT.find(item => 
      typeof item.TenCT === 'string' && item.TenCT.toLowerCase() === v.toLowerCase(),
    );
    switch (c) {
      case 0: 
        if (matched) {
          setFromCT(matched); // Nếu bạn có state setIdFrom
        } else {
          setFromCT(null); // Không khớp
        }
        break;
      case 1: 
        if (matched) {
          setToCT(matched); // Nếu bạn có state setIdTo
        } else {
          setToCT(null); // Không khớp
        }
        break;
    }
  }

  const handleChangeTo = (e) => {
    const val = e.target.value;
    setTo(val);
    const suggestions = findSuggestions(val);
    setSuggestionsTo(suggestions);
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371e3; // Bán kính Trái Đất tính bằng mét

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Đơn vị: mét
  };

  const findNearestDiemGiaoThong = (congTrinh) => {
    let minDistance = Infinity;
    let nearestPoint = null;

    diemGiaoThong.forEach(diem => {
      const distance = haversineDistance(
        congTrinh.ViDo,
        congTrinh.KinhDo,
        diem.ViDo,
        diem.KinhDo
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = diem;
      }
    });

    return { diem: nearestPoint, distance: minDistance };
  };

  const handleFindRoute = () => {
    const fromValid = findSuggestions(from).length > 0;
    const toValid = findSuggestions(to).length > 0;

    if (fromValid && toValid) {
      if (!fromCT?.IdCT || !toCT?.IdCT) {
        console.warn('Địa điểm không hợp lệ hoặc chưa liên kết với công trình.');
        return;
      }
      const fromCTObj = dataCT.find(ct => ct.IdCT === fromCT.IdCT);
      const toCTObj = dataCT.find(ct => ct.IdCT === toCT.IdCT);

      const fromNearestDD = findNearestDiemGiaoThong(fromCTObj);
      const toNearestDD = findNearestDiemGiaoThong(toCTObj);

      const getPath = findPathBetweenCongTrinh(fromNearestDD.diem.IdDiem,toNearestDD.diem.IdDiem);
      const getList = getPath.path
        .map(id => {
          const dd = diemGiaoThong.find(item => item.IdDiem === Number(id));
          return dd? [dd.ViDo, dd.KinhDo] : null;
        })
      .filter(Boolean); // loại bỏ null*/

      getList.unshift([fromCTObj.ViDo, fromCTObj.KinhDo]); // Thêm điểm bắt đầu
      getList.push([toCTObj.ViDo, toCTObj.KinhDo]); // Thêm điểm kết thúc
      getPath.idCTfrom = fromCT.IdCT
      getPath.idCTto = toCT.IdCT
      setPolylinePositions(getList)
      setRouteInfo({
        description: `Từ "${from}" đến "${to}"`,
        distance: `${getPath.distance} mét`,
        speed: `${getPath.speed} km/h`,
        duration: getPath.timeText
      });
      handleUpdateLogPath(getPath); // cập nhật cuối cùng
    } else {
      setRouteInfo(null);
    }
  };

  // Hàm định dạng thành YYYY-MM-DD HH:MM:SS
  function formatDateTime(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return date.getFullYear() + '-' +
          pad(date.getMonth() + 1) + '-' +
          pad(date.getDate()) + ' ' +
          pad(date.getHours()) + ':' +
          pad(date.getMinutes()) + ':' +
          pad(date.getSeconds());
  }

  function dijkstra(start, end) {
    start = String(start);
    end = String(end);
    const distances = {};
    const prev = {};
    const pq = new Set();

    for (const node in dataGraph) {
      distances[node] = Infinity;
      prev[node] = null;
      pq.add(node);
    }

    distances[start] = 0;

    while (pq.size) {
      const current = [...pq].reduce((a, b) =>
        distances[a] < distances[b] ? a : b
      );
      pq.delete(current);

      // Nếu đã tới đích thì dừng
      if (current === end) break;

      if (!dataGraph[current]) continue;

      for (const neighbor of dataGraph[current]) {
        if (!(neighbor.to in distances)) {
          distances[neighbor.to] = Infinity;
          prev[neighbor.to] = null;
          pq.add(neighbor.to);
        }

        const alt = distances[current] + neighbor.cost;
        if (alt < distances[neighbor.to]) {
          distances[neighbor.to] = alt;
          prev[neighbor.to] = current;
        }
      }
    }

    // Truy ngược đường đi từ end về start
    const path = [];
    let u = end;
    while (u) {
      path.unshift(u);
      u = prev[u];
    }

    if (path[0] !== start) {
      // Không có đường đi
      return { path: [], cost: Infinity };
    }
    var speedKmh = 0;
    if(vehicle === 'foot') {
      speedKmh = 5;
    }
    else if(vehicle === 'bike') {
      speedKmh = 20;
    }
    else if(vehicle === 'car') {
      speedKmh = 40;
    }
    const totalDistance = distances[end]; // mét
    const speedMs = (speedKmh * 1000) / 3600; // m/s
    const timeSeconds = totalDistance / speedMs;

    // Định dạng giờ:phút:giây
    const hours = Math.floor(timeSeconds / 3600);
    const minutes = Math.floor((timeSeconds % 3600) / 60);
    const seconds = Math.floor(timeSeconds % 60);

    const timeText = `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    const now = new Date();
    const endTime = new Date(now.getTime() + timeSeconds * 1000);

    return {
      path,
      distance: totalDistance,
      speed: speedKmh,
      timeSeconds,
      timeText,
      timeStart: formatDateTime(now),
      timeEnd: formatDateTime(endTime)
    };
  }

  const handleUpdateLogPath = async (curPath) => {
    if (!curPath) {
      return console.warn('Chưa có path nào');
    }

    const curUser = localStorage.getItem('NSD');
    if (!curUser) {
      console.warn('Người dùng không đăng nhập!')
      return;
    }
    const parsedUser = JSON.parse(curUser);
    curPath.note = "path chứa các điểm giao thông gần nhất với công trình";
    try {
      const res = await fetch('http://localhost:3001/insertlogpath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          IdNSD: parsedUser.IdNSD,
          IdDiemBatDau: curPath.idCTfrom,
          IdDiemKetThuc: curPath.idCTto,
          TgBatDau: curPath.timeStart,
          TgKetThuc: curPath.timeEnd,
          PathJson: JSON.stringify(curPath)
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.info('insert logpath thành công!');
      } else {
        console.error(data.error || 'Lỗi insert logpath ');
      }
    } catch (error) {
      console.error('Lỗi kết nối đến server');
      console.error(error);
    }
  };

  function findPathBetweenCongTrinh(fromCT, toCT) {
    if (!fromCT || !toCT || fromCT === toCT) {
      return [fromCT]; // cùng công trình hoặc thiếu thông tin
    }
    const pathCur = dijkstra(fromCT, toCT);
    return pathCur
  }

  const toggleMapType = () => {
    setMapType((prev) => (prev === 'satellite' ? 'street' : 'satellite'));
  };

  if (!selectedMap) {
    return (
      <div className={clsx(styles.mapContainer, styles.noMap)}>
        <h1>Bạn chưa chọn bản đồ!</h1>
        <p>Vui lòng quay lại trang chọn bản đồ.</p>
      </div>
    );
  }

  return (
    <><div className={styles.mapContainer}>
      <div className={styles.mapContent}>
        {isOpen && (
        <div className={styles.sidebar}>
          <h2>{selectedMap.TenKV}</h2>
          {/* Ô nhập vị trí hiện tại */}
          <div className={styles['form-group f1']}>
            <label>Vị trí hiện tại:</label>
            <input
              type="text"
              placeholder="Nhập tên hoặc mô tả địa điểm"
              value={from} 
              onChange={handleChangeFrom} />
            {suggestionsFrom.length > 0 && (
              <ul className={clsx(styles.suggestions, styles.s1)}>
                {suggestionsFrom.map(item => (
                  <li  key={item.IdDD} onClick={() => {
                    setFrom(item.TenCT);
                    setSuggestionsFrom([]);
                    handleCompleteEnter(item.TenCT, 0)
                  } }>
                    {item.TenCT}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ô nhập điểm đến */}
          <div className={styles['form-group f2']}>
            <label>Điểm đến:</label>
            <input
              type="text"
              placeholder="Nhập điểm đến"
              value={to}
              onChange={handleChangeTo} />
            {suggestionsTo.length > 0 && (
              <ul className={clsx(styles.suggestions, styles.s2)}>
                {suggestionsTo.map(item => (
                  <li key={item.IdDD} onClick={() => {
                    setTo(item.TenCT);
                    setSuggestionsTo([]);
                    handleCompleteEnter(item.TenCT, 1)
                  } }>
                    {item.TenCT}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chọn phương tiện */}
          <div className={styles['form-group']}>
            <label>Phương tiện:</label>
            <select className={styles.phuongtien} value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              <option value="foot">Đi bộ</option>
              <option value="bike">Xe đạp</option>
              <option value="car">Ô tô</option>
            </select>
          </div>

          <button onClick={handleFindRoute}>Tìm đường</button>
          <div className={styles['btn-mophong']}>
            <button onClick={startSimulation}>Mô phỏng</button>
            <button onClick={stopSimulation}>Dừng</button>
          </div>
          {routeInfo && (
            <div className={styles.routeInfo}>
              <p><strong>Đường đi:</strong> {routeInfo.description}</p>
              <p><strong>Độ dài quãng đường:</strong> {routeInfo.distance}</p>
              <p><strong>Vận tốc trung bình:</strong> {routeInfo.speed}</p>
              <p><strong>Thời gian ước tính:</strong> {routeInfo.duration}</p>
            </div>
          )}
        </div>
        )}

        {/* Bản đồ */}
        <div className={styles.map}>
          <button onClick={toggleMapType} className={styles.toggleMapType}>Change Map</button>
          <button onClick={toggleSidebar} className={styles.toggleButton}>{isOpen ? <FaAngleLeft/> : <FaAngleRight/>}</button>
          <MapContainer
            key={selectedMap?.IdKV || searchMap?.IdKV} // Thêm key để tái khởi tạo bản đồ khi IdKV thay đổi
            center={[selectedMap.ViDo, selectedMap.KinhDo]}
            zoom={17}
            style={{ height: '650px', width: '150%' }}
          >
            {mapType === 'satellite' ? (
              <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye"
                />
              ) : (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
              )}

            {dataCT.map((item, index) => (
              <Marker
                key={item.IdCT}
                position={[item.ViDo, item.KinhDo]}
                icon={getCustomIcon(item.LoaiCT)} // rất quan trọng!
              >
                <Popup>{item.TenCT}</Popup>
              </Marker>
            ))}
              
            {polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                color="aqua"
                weight={5}
                opacity={1}
                dashArray="10,10"
              />
            )}

            {/* Render marker tại điểm bắt đầu và điểm kết thúc */}
            {polylinePositions.length > 0 && (
              <>
                {/* Marker vị trí bắt đầu */}
                <Marker position={polylinePositions[0]} icon={customSmallIcon}>
                  <Popup>Vị trí hiện tại của bạn</Popup>
                </Marker>

                {/* Marker đích đến (nếu có nhiều hơn 1 điểm) */}
                {polylinePositions.length > 1 && (
                  <Marker position={polylinePositions[polylinePositions.length - 1]} icon={customSmallIcon}>
                    <Popup>Đích đến</Popup>
                  </Marker>
                )}
              </>
            )}

          {/* Marker mô phỏng user di chuyển */}
          {isMoving && (
            <Marker
              position={currentPosition}
              icon={createIcon('/iconMap/matcuoi.png', [30, 30])} // icon mô phỏng di chuyển
              ref={movingMarkerRef}
            >
              <Popup>Tới liền...</Popup>
            </Marker>
          )}
          </MapContainer>
        </div>
      </div>
    </div><Footer /></>
  );
}

export default Map;
