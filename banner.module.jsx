// src/components/banner/Banner.jsx
import React from 'react';
import styles from './banner.module.css';

const Banner = () => {
  return (
    <div className={styles.banner}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <h1>Hệ thống điều hướng khu vực</h1>
        <p>Giúp bạn tìm kiếm và di chuyển nhanh chóng trong các khu vực nội bộ</p>
      </div>
    </div>
  );
};

export default Banner;
