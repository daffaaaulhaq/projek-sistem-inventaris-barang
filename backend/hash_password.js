const bcrypt = require('bcryptjs');

const plainPassword = 'password123'; // Ganti dengan password yang Anda inginkan
const saltRounds = 10; // Harus sama dengan yang digunakan di backend (biasanya 10)

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Hashed Password:', hash);
});