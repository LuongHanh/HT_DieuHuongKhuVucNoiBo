import sql from 'mssql'

const config = {
  user: 'sa',                 // Tên đăng nhập SQL Server, ví dụ: sa
  password: '20042002', // Mật khẩu
  server: 'localhost',       // Hoặc IP như 127.0.0.1
  database: 'DHKV_DB',       // Tên database bạn muốn kết nối
  options: {
    encrypt: true,               // Với Azure thì nên bật, localhost thì không bắt buộc
    trustServerCertificate: true // Quan trọng khi chạy local
  }
}

let pool = null;

// Hàm lấy kết nối duy nhất
export async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Kết nối SQL thành công');
    } catch (err) {
      console.error('Lỗi kết nối SQL:', err);
    }
  }
  return pool;
}

// Hàm truy vấn dùng chung
export async function queryDB(sqlQuery) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(sqlQuery);
    return result.recordset;
  } catch (err) {
    console.error(`Lỗi khi chạy truy vấn: ${sqlQuery}`, err);
    return [];
  }
}