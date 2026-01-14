const bcrypt = require('bcrypt');

const password = 'CrmSecure2024';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Mot de passe: CrmSecure2024');
  console.log('Hash:');
  console.log(hash);
});
