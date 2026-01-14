import bcrypt from "bcrypt";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the password to hash: ", async (password) => {
  if (!password) {
    console.log("No password provided");
    rl.close();
    process.exit(1);
  }

  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log("\n=== PASSWORD HASH ===");
  console.log(hash);
  console.log("\nCopy this hash and store it as ADMIN_PASSWORD_HASH secret.");
  console.log("Never store the plain text password!\n");
  
  rl.close();
  process.exit(0);
});
