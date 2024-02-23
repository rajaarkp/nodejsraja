const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rajaarif'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Database connected');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/biodata', (req, res) => {
  const { name, age, gender, address, email, phone, kelas, hobby } = req.body;
  const sql = 'INSERT INTO biodata (name, age, gender, address, email, phone, kelas, hobby) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, age, gender, address, email, phone, kelas, hobby], (err, result) => {
    if (err) {
      res.status(500).send('Gagal menambahkan data');
      throw err;
    }
    res.redirect('/read');
  });
});

app.get('/read', (req, res) => {
  const sql = 'SELECT * FROM biodata';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data:', err);
      res.status(500).send('Gagal mengambil data');
      return; // Menghentikan eksekusi selanjutnya setelah mengirim tanggapan kesalahan
    }

    let tableRows = '';
    results.forEach(biodata => {
      tableRows += `
        <tr>
          <td style="font-weight: bold;">${biodata.name}</td>
          <td>${biodata.age}</td>
          <td>${biodata.gender}</td>
          <td>${biodata.address}</td>
          <td style="color: blue;">${biodata.email}</td>
          <td>${biodata.phone}</td>
          <td>${biodata.kelas}</td>
          <td>${biodata.hobby}</td>
          <td>
            <a href="/update/${biodata.id}" style="text-decoration: none; color: green;">Update</a>
            <form action="/delete/${biodata.id}" method="post" style="display: inline;">
              <button type="submit" style="background-color: red; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
            </form>
          </td>
        </tr>
      `;
    });
    

    const table = `
  <style>
    /* Gaya untuk tabel */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-family: Arial, sans-serif;
    }

    th, td {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }

    th {
      background-color: #f2f2f2;
      color: #333333;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    /* Gaya untuk tombol Update dan Delete */
    a.update-button, button.delete-button {
      background-color: #4CAF50; /* Green */
      border: none;
      color: white;
      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      margin-right: 5px;
      cursor: pointer;
      border-radius: 4px;
    }

    button.delete-button {
      background-color: #f44336; /* Red */
    }

    a.update-button:hover, button.delete-button:hover {
      opacity: 0.8;
    }
    
    .backButton {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .backButton:hover {
      background-color: #45a049;
    }
    
  </style>

  <table>
    <thead>
      <tr>
        <th>Nama</th>
        <th>Usia</th>
        <th>Jenis Kelamin</th>
        <th>Alamat</th>
        <th>Email</th>
        <th>Telepon</th>
        <th>Kelas</th>
        <th>Hobi</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
`;


    // Menambahkan link atau tombol untuk kembali ke halaman utama
    const backButton = '<a class="backButton" href="/">Create</a><br>';

    // Mengirimkan tanggapan setelah selesai membangun tabel
    res.send(backButton + table);
  });
});


app.get('/update/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM biodata WHERE id=?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).send('Gagal mengambil data');
      throw err;
    }
    if (result.length > 0) {
      res.render('update', { biodata: result[0] });
    } else {
      res.status(404).send('Data tidak ditemukan');
    }
  });
});

app.post('/update/:id', (req, res) => {
  const id = req.params.id;
  const { name, age, gender, address, email, phone, kelas, hobby } = req.body;
  const sql = 'UPDATE biodata SET name=?, age=?, gender=?, address=?, email=?, phone=?, kelas=?, hobby=? WHERE id=?';
  db.query(sql, [name, age, gender, address, email, phone, kelas, hobby, id], (err, result) => {
    if (err) {
      res.status(500).send('Gagal mengupdate data');
      throw err;
    }
    res.redirect('/read');
  });
});

app.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM biodata WHERE id=?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).send('Gagal menghapus data');
      throw err;
    }
    res.redirect('/read');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
