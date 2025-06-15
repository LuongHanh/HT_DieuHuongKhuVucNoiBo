import React, { useState, useEffect } from 'react';
import styles from './search.module.css';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const [dataKV, setDataKV] = useState([]);
  const [kvChoosed, setKvChoosed] = useState(null);
  const [filteredKhuvuc, setFilteredKhuvuc] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/khuvuc');
        const data = await response.json();
        setDataKV(data);
        setFilteredKhuvuc([]); // Khởi tạo filtered = []
      } catch (err) {
        console.error('Lỗi tải khu vực:', err);
      }
    };
    fetchData();
  }, []);

  const handleClickOutside = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      setFilteredKhuvuc([]); // Xóa kết quả tìm kiếm khi click ra ngoài
      setSearchText(''); // Xóa ô input khi click ra ngoài
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fillterKhuvuc = () => {
    setFilteredKhuvuc([]);
    if (searchText.trim() !== '' && searchText.length > 0) {
      const filtered = dataKV.filter(item =>
        item.TenKV.toLowerCase().includes(searchText.toLowerCase()) //||
        //item.Mota.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredKhuvuc(filtered);
    }
  }

  const handleSearch = () => {
    navigate('/ChooseMap', { state: { filteredKV: filteredKhuvuc } }); // Chuyển hướng với khu vực đã chọn
  };
  /*useEffect(() => {
    navigate('/ChooseMap', { state: { filteredKV: filteredKhuvuc , dataKV: dataKV } }); // Chuyển hướng với khu vực đã chọn
  }, [filteredKhuvuc, dataKV]);*/

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handelFocusInput = () => {
    setSearchText(''); // Xóa ô input khi focus
    setFilteredKhuvuc([]); // Xóa kết quả tìm kiếm khi ô input được focus
  }

  const handleChangeInput = (e) => {
    const val = e.target.value;
    setSearchText(val);
    fillterKhuvuc();
  };

  const handleCompleteEnter = (v) => {
    const matched = dataKV.find(item => 
      typeof item.TenKV === 'string' && item.TenKV.toLowerCase() === v.toLowerCase(),
    );
    if (matched) {
      console.log('Kv đã chọn:', matched);
      setKvChoosed(matched); // Nếu bạn có state setIdFrom
    } else {
      setKvChoosed(null); // Không khớp
    }
  }

  useEffect(() => {
    if (kvChoosed) {
      navigate('/Map', { state: { searchMap: kvChoosed} });
      localStorage.setItem('searchMap', JSON.stringify(kvChoosed)); // Lưu vào localStorage
    }
  }, [kvChoosed]);

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Tìm kiếm theo tên..."
        className={styles.searchInput}
        value={searchText}
        onFocus={handelFocusInput} // chỗ này đang có lỗi, cần sửa lại - chưa đọc input
        onChange={handleChangeInput}
      />
      <button className={styles.searchButton} onClick={handleSearch}>
        <FaSearch />
      </button>

      {/* Kết quả tìm kiếm */}
      {filteredKhuvuc.length > 0 && (
        <ul className={styles.resultList}>
          {filteredKhuvuc.map(item => (
            <li key={item.IdKV} className={styles.resultItem} onClick={() => {handleCompleteEnter(item.TenKV)}}>
              <strong>{item.TenKV}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
