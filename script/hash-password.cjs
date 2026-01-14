const bcrypt = require('bcrypt');

const password = 'F9!rQ@Zp6M#tA8$LxS2^eK';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Password hash:');
  console.log(hash);
});
