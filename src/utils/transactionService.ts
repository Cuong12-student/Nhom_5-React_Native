export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
}

// Danh sách user lưu tạm
let memoryUsers: User[] = [
  { id: 1, name: "Người dùng test", email: "test@gmail.com", password: "123" },
];

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const existingUser = memoryUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existingUser) {
    throw new Error("Email đã được đăng ký!");
  }

  const newUser: User = {
    id: Date.now(),
    name,
    email,
    password,
  };

  memoryUsers.push(newUser);
  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const user = memoryUsers.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );

  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác!");
  }

  return { id: user.id, name: user.name, email: user.email };
}
