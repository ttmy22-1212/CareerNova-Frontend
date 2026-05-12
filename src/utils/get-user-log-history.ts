interface User {
  username: string;
  logCount: number;
}

export const updateUserLoginHistory = (username: string): void => {
  try {
    // Lấy history từ localStorage, nếu không có thì khởi tạo mảng rỗng
    const usersHistory: User[] = JSON.parse(
      localStorage.getItem("user-log-history") || "[]",
    );

    // Tìm user trong history
    const existingUserIndex = usersHistory.findIndex(
      (user: User) => user.username === username,
    );

    if (existingUserIndex !== -1) {
      // Nếu user đã tồn tại, tăng logCount
      usersHistory[existingUserIndex].logCount += 1;
    } else {
      // Nếu user chưa tồn tại, thêm mới
      usersHistory.push({ username, logCount: 1 });
    }

    // Lưu lại vào localStorage
    localStorage.setItem("user-log-history", JSON.stringify(usersHistory));
  } catch (error) {
    console.error("Error updating user login history:", error);
  }
};

export const getUserLoginHistory = (username: string): User | null => {
  try {
    const usersHistory: User[] = JSON.parse(
      localStorage.getItem("user-log-history") || "[]",
    );

    const userHistory = usersHistory.find(
      (user: User) => user.username === username,
    );

    return userHistory || null;
  } catch (error) {
    console.error("Error getting user login history:", error);
    return null;
  }
};
