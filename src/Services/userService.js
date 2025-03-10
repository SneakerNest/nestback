import { create, findByEmail, findByUsername } from '../../DB/queries.js';
import bcrypt from 'bcryptjs';

export const registerUser = async ({ name, username, email, password }) => {
    console.log('Registering user:', { name, username, email });

    // Check if the username or email already exists in the DB
    const existingEmail = await findByEmail(email);
    const existingUser = await findByUsername(username);

    if (existingEmail || existingUser) {
        throw new Error('Username or email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in the DB
    const newUser = await create(name, username, email, hashedPassword);

    console.log('User created successfully:', newUser);

    return { name: newUser.name, username: newUser.username, email: newUser.email };
};
// Login User
export const loginUser = async ({ email, password }) => {
  // Fetch user by email from the DB
  const user = await findByEmail(email);

  // Check if the user exists and validate password
  if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
  }

  console.log('User logged in successfully:', user);

  return { name: user.name, username: user.username, email: user.email };
};