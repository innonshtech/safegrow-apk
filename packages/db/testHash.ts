import bcrypt from 'bcryptjs';

const hash = '$2b$10$3KLXsmiFbnsfcPSP.7pGOe1ulnQEapQhz5IzPCNhpWauGQlnOkkxK';
async function run() {
  const isMatch = await bcrypt.compare('password123', hash);
  console.log('Match?', isMatch);
}
run();
