const bcrypt = require('bcrypt');

// Strong password: 18 characters with uppercase, lowercase, numbers, and symbols
const password = 'Xk9#mTp2$vLq7@Rn5W';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Mot de passe fort: Xk9#mTp2$vLq7@Rn5W');
  console.log('Hash:');
  console.log(hash);
  
  // Verify the hash works
  bcrypt.compare(password, hash, function(err, result) {
    console.log('Verification:', result ? 'OK' : 'FAILED');
  });
});
