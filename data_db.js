// services/dataService.js
import { queryDB } from './db.js';

export const getKhuvuc = async () => {
  try {
    const datakhuvuc = await queryDB('SELECT * FROM Khuvuc');
    return datakhuvuc.map(function (khuvuc, index) {
      if (!khuvuc || !khuvuc.diachi) {
        return { ...khuvuc, tinh: '' }; // hoặc tinh: null
      }
      const addressParts = khuvuc.diachi.split(',');
      const tinh = addressParts[addressParts.length - 1].trim();
      return { ...khuvuc, tinh };
    });
  } catch (error) {
    console.error("Error fetching Khuvuc data:", error);
    throw error;
  }
};
// Các hàm khác...

export const getCongtrinh = () => queryDB('SELECT * FROM CongTrinh');
export const getDiaDiem = () => queryDB('SELECT * FROM Diadiem');
export const getDiemGiaoThong = () => queryDB('SELECT * FROM DiemGiaoThong');
export const getDoanDuong = () => queryDB('SELECT * FROM DoanDuong');
export const getLogPath = () => queryDB('SELECT * FROM LogPath');
export const getLogPassword = () => queryDB('SELECT * FROM LogPassword');
export const getNguoiSuDung = async () => {
  try {
    const dataNSD = await queryDB('SELECT * FROM NguoiSuDung');
    return dataNSD.map(function (nsd, index) {
      console.log(nsd);
      return nsd;
    });
  } catch (error) {
    console.error("Error fetching Khuvuc nsd:", error);
    throw error;
  }
}
