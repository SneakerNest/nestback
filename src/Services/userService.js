const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const path = require('path');
const usersFilePath = path.join(__dirname, '../users.json'); 

const registerUser = async ({ username, email, password }) => {
  console.log('Registering user:', { username, email });
  console.log('usersFilePath:', usersFilePath); 
  let users = [];
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    if (data.trim() === '') {
      users = [];
    } else {
      users = JSON.parse(data);
    }
  } catch (error) {
    if (error.code === 'ENOENT' || error.message.includes('Unexpected end of JSON')) {
      users = [];
    } else {
      console.error('Read error:', error);
      throw error;
    }
  }

  const existingUser = users.find(
    (user) => user.email === email || user.username === username
  );
  if (existingUser) {
    throw new Error('Username or email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: users.length + 1,
    username,
    email,
    password: hashedPassword,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  console.log('Writing to users.json:', users);
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    console.log('Successfully wrote to users.json');
  } catch (writeError) {
    console.error('Failed to write to users.json:', writeError);
    throw writeError;
  }

  return { id: newUser.id, username, email };
};

const loginUser = async ({ email, password }) => {
  const users = JSON.parse(await fs.readFile(usersFilePath, 'utf8'));
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  return { id: user.id, username: user.username, email: user.email };
};

module.exports = { registerUser, loginUser };