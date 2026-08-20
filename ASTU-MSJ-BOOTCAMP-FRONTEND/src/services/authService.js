export const authService = {
  login: async (credentials) => ({ success: true, data: credentials }),
  register: async (userData) => ({ success: true, data: userData }),
  logout: async () => ({ success: true }),
};
