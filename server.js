import express from 'express'
import cors from 'cors'   
import sql from 'mssql';  // đúng cách nếu bạn dùng ESM (type: "module" trong package.json)
import { getPool, queryDB } from './db.js';


import { getKhuvuc } from './data_db.js' 
import { getCongtrinh } from './data_db.js' 
import { getDiaDiem } from './data_db.js' 
import { getDiemGiaoThong } from './data_db.js' 
import { getDoanDuong } from './data_db.js' 
import { getLogPath } from './data_db.js' 
import { getNguoiSuDung } from './data_db.js' 
import { getLogPassword } from './data_db.js' 

const app = express();
const PORT = 3001

app.use(cors());              // ✅ Cho phép frontend gọi API
app.use(express.json());      // ✅ Giúp đọc req.body

// API: Khu vực
app.get('/khuvuc', async (req, res) => {
  try {
    const data = await getKhuvuc()
    res.json(data)
  } catch (error) {s
    if(data === undefined) {
      res.status(500).send('Lỗi undefined')
    }
    else {
      res.status(500).send('Lỗi lấy dữ liệu khu vực')
    }
  }
})

// API: Công trình
app.get('/congtrinh', async (req, res) => {
  try {
    const data = await getCongtrinh()
    res.json(data)
  } catch (error) {
    res.status(500).send('Lỗi lấy dữ liệu công trình')
  }
})

// API: Địa điểm
app.get('/diadiem', async (req, res) => {
  try {
    const data = await getDiaDiem()
    res.json(data)
  } catch (error) {
    res.status(500).send('Lỗi lấy dữ liệu địa điểm')
  }
})

// API: DistanceCT
app.get('/diemgiaothong', async (req, res) => {
  try {
    const data = await getDiemGiaoThong()
    res.json(data)
  } catch (error) {
    res.status(500).send('Lỗi lấy dữ liệu diemgiaothong')
  }
})

// API: DistanceDD
app.get('/doanduong', async (req, res) => {
  try {
    const data = await getDoanDuong()
    res.json(data)
  } catch (error) {
    res.status(500).send('Lỗi lấy dữ liệu doanduong')
  }
})

// API: LogPath
app.get('/logpath', async (req, res) => {
  try {
    const data = await getLogPath()
    res.json(data)
  } catch (error) {
    res.status(500).send('Lỗi lấy dữ liệu LogPath')
  }
})

app.get('/logpassword', async (req, res) => {
  try {
    const data = await getLogPassword()
    res.json(data)
  } catch (error) {
    res.status(500).send('Lỗi lấy dữ liệu LogPassword')
  }
})


// API: Người sử dụng
app.get('/nguoisudung', async (req, res) => {
  try {
    const data = await getNguoiSuDung()
    res.json(data)
  } catch (error) {
    res.status(500).send('Lỗi lấy dữ liệu người dùng')
  }
})

// API: LogPassword Lấy thời gian đổi mật khẩu gần nhất
app.get('/getlogpassword', async (req, res) => {
  const { IdNSD } = req.query;
 
  try {
    if (!IdNSD) {
      return res.status(400).json({ error: 'Thiếu IdNSD!' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('IdNSD', sql.Int, IdNSD)
      .query(`
        SELECT TOP 1 TimeUpdated
        FROM logpassword
        WHERE IdNSD = @IdNSD
        ORDER BY TimeUpdated DESC
      `);

    const latestTime = result.recordset[0]?.TimeUpdated || null;
    console.log('Kết quả truy vấn:', result);
    console.log('Thời gian đổi mật khẩu mới nhất:', latestTime);

    res.status(200).json({ latestTime });
  } catch (err) {
    console.error('Lỗi khi lấy log mật khẩu:', err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

app.get('/getlogpath', async (req, res) => {
  const { IdNSD } = req.query;
 
  try {
    if (!IdNSD) {
      return res.status(400).json({ error: 'Thiếu IdNSD!' });
    }

    const pool = await getPool();

    const fullLog = await pool.request()
      .input('IdNSD', sql.Int, IdNSD)
      .query(`
        SELECT 
          n.IdNSD, 
          lp.IdLog, 
          lp.IdDiemBatDau, 
          lp.TgBatDau,
          lp.TgKetThuc,
          ct1.TenCT AS TenDiemBatDau,
          ct2.TenCT AS TenDiemKetThuc,
          lp.IdDiemKetThuc, 
          lp.PathJson,
          kv.TenKV
        FROM logpath lp
        JOIN NguoiSuDung n ON lp.IdNSD = n.IdNSD
        JOIN CongTrinh ct1 ON lp.IdDiemBatDau = ct1.IdCT
        JOIN CongTrinh ct2 ON lp.IdDiemKetThuc = ct2.IdCT
        JOIN KhuVuc kv ON ct1.IdKV = kv.IdKV
        WHERE n.IdNSD = @IdNSD
        ORDER BY lp.IdLog DESC;
      `);

    const latestPath = fullLog.recordset[0] || null;
    const logs = fullLog.recordset || null;
    res.status(200).json({ latestPath, logs });
  } catch (err) {
    console.error('Lỗi khi lấy log mật khẩu:', err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

app.post('/getDataMap', async (req, res) => {
  const { IdKV } = req.body;
  try {
    if (!IdKV) {
      return res.status(400).json({ error: 'Thiếu idKV!' });
    }

    const pool = await getPool();
    //Lấy danh sách công trình theo IdKV
    const getct = await pool.request()
      .input('IdKV', sql.Int, IdKV)
      .query(`
        SELECT * 
        FROM CongTrinh
        WHERE IdKV = @IdKV
      `);
    //Lấy danh sách địa điểm theo IdCT
    const getdd = await pool.request()
      .input('IdKV', sql.Int, IdKV)
      .query(`
        SELECT ct.IdCT, ct.TenCT, dd.IdDD, dd.TenDD, dd.ViDo, dd.KinhDo, dd.TenKhac, dd.LoaiDD, dd.TangSo
        FROM CongTrinh ct
        LEFT JOIN DiaDiem dd ON ct.IdCT = dd.IdCT
        WHERE ct.IdKV = @IdKV
      `);

    const getDoanDuong = await pool.request()
      .input('IdKV', sql.Int, IdKV)
      .query(`
        SELECT dgtA.IdKV, d.IdDoan, d.DiemDau, dgtA.LoaiDiem , d.DiemCuoi, dgtB.LoaiDiem, d.DoDai, d.IsMain, d.TrangThai
        FROM DiemGiaoThong dgtA
        JOIN DoanDuong d ON dgtA.IdDiem = d.DiemDau
        JOIN DiemGiaoThong dgtB ON dgtB.IdDiem = d.DiemCuoi
        WHERE dgtA.IdKV = @IdKV AND dgtB.IdKV = @IdKV
      `);
    
    const congtrinh = getct.recordset || [];
    const diadiem = getdd.recordset || [];
    const doanduong = getDoanDuong.recordset || [];
    const diemgiaothong = await getDiemGiaoThong() || [];

    return res.status(200).json({ congtrinh, diadiem, doanduong, diemgiaothong });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi lấy dữ liệu thống kê');
  }
});

app.get('/stats', async (req, res) => {
  try {
    const khuvuc = await getKhuvuc();
    const diadiem = await getDiaDiem();
    const congtrinh = await getCongtrinh();
    const nsd = await getNguoiSuDung();

    // Lọc các tỉnh duy nhất từ khu vực
    const uniqueTinh = [...new Set(khuvuc.map(item => item.tinh))]; 
    const user = nsd.filter(item => item.VaiTro.toLowerCase() === 'user');
    const admin = nsd.filter(item => item.VaiTro.toLowerCase() === 'admin');

    res.json({
      soLuongTinh: uniqueTinh.length, // Tổng số tỉnh
      tinh: uniqueTinh, // Danh sách các tỉnh
      soLuongKhuVuc: khuvuc.length,
      soLuongCongTrinh: congtrinh.length,
      soLuongDiaDiem: diadiem.length,
      soLuongUser: user.length,
      soLuongAdmin: admin.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi lấy dữ liệu thống kê');
  }
});

//////////////////////////

// Sử dụng middleware để parse dữ liệu JSON
// POST: Thêm người dùng mới
app.post('/insertnguoisudung', async (req, res) => {
  const { TenNSD, TenDN, MatKhau, VaiTro, DoiTuong } = req.body;

  try {
    if (!TenNSD || !TenDN || !MatKhau || !VaiTro) {
      return res.status(400).json({ error: 'Thiếu thông tin người dùng!' });
    }

    const pool = await getPool(); // ✅ dùng hàm đã import từ db.js
    await pool.request()
      .input('TenNSD', sql.NVarChar, TenNSD)
      .input('TenDN', sql.NVarChar, TenDN)
      .input('MatKhau', sql.NVarChar, MatKhau)
      .input('VaiTro', sql.NVarChar, VaiTro)
      .input('DoiTuong', sql.NVarChar, DoiTuong || null)
      .query(`
        INSERT INTO NguoiSuDung(TenNSD, TenDN, MatKhau, VaiTro, DoiTuong)
        VALUES (@TenNSD, @TenDN, @MatKhau, @VaiTro, @DoiTuong)
      `);

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Lỗi khi thêm người dùng:', err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

app.post('/changepassword', async (req, res) => {
  const { IdNSD, OldMK, NewMK } = req.body;

  try {
    if (!IdNSD || !OldMK || !NewMK) {
      return res.status(400).json({ error: 'Thiếu thông tin khi đổi mk!' });
    }

    const pool = await getPool(); // ✅ dùng hàm đã import từ db.js
    const result = await pool.request()
      .input('IdNSD', sql.Int, IdNSD)
      .input('OldMK', sql.VarChar, OldMK)
      .input('NewMK', sql.VarChar, NewMK)
      .query(`
        INSERT INTO logpassword (IdNSD, OldMK, NewMK, TimeUpdated)
        VALUES (@IdNSD, @OldMK, @NewMK, GETDATE())
      `);

    console.log('Kết quả truy vấn:', result);
    res.status(201).json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('Lỗi khi đổi mât khẩu:', err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

app.post('/insertlogpath', async (req, res) => {
  const { IdNSD, IdDiemBatDau, IdDiemKetThuc, TgBatDau, TgKetThuc, PathJson} = req.body;

  try {
    if (!IdNSD) {
      return res.status(400).json({ error: 'Thiếu thông tin IdNSD!' });
    }
    if (!IdDiemBatDau) {
      return res.status(400).json({ error: 'Thiếu thông tin IdDiemBatDau!' });
    }
    if (!IdDiemKetThuc) {
      return res.status(400).json({ error: 'Thiếu thông tin IdDiemKetThuc!' });
    }

    const pool = await getPool(); // ✅ dùng hàm đã import từ db.js
    const result = await pool.request()
      .input('IdNSD', sql.Int, IdNSD)
      .input('IdDiemBatDau', sql.Int, IdDiemBatDau)
      .input('IdDiemKetThuc', sql.Int, IdDiemKetThuc)
      .input('TgBatDau', sql.DateTime, TgBatDau)
      .input('TgKetThuc', sql.DateTime, TgKetThuc)
      .input('PathJson', sql.NVarChar, PathJson)
      .query(`
        INSERT INTO logpath (IdNSD, TgBatDau, TgKetThuc, IdDiemBatDau, IdDiemKetThuc, PathJson)
        VALUES (@IdNSD, @TgBatDau, @TgKetThuc, @IdDiemBatDau, @IdDiemKetThuc, @PathJson)
      `);

    console.log('Kết quả truy vấn:', result);
    res.status(201).json({ message: 'update logpath thành công' });
  } catch (err) {
    console.error('Lỗi khi update logpath:', err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`)
})
