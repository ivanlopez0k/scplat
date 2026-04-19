export interface LoginResponse {
  message: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: number;
    name: string;
    lastname: string;
    email: string;
    role: string;
  };
}

export interface RegisterData {
  name: string;
  lastname: string;
  dni: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'parent';
  courseId?: string;
  childDni?: string;
}

const API_URL = '/api';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  return data;
}

export async function register(data: RegisterData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/user/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const responseData: LoginResponse = await response.json();
  return responseData;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/user/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function checkAuth(): Promise<AuthStatus> {
  try {
    const response = await fetch(`${API_URL}/user/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    const user = await response.json();
    return { authenticated: true, user };
  } catch {
    return { authenticated: false };
  }
}

export function isAuthenticated(): boolean {
  // Note: With httpOnly cookies, we can't check token existence client-side
  // This is a best-effort check that should be verified server-side
  return document.cookie.includes('token=');
}

// Password reset functions
export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string | null;
}

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${API_URL}/user/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al solicitar recuperación');
  }

  return data;
}

export async function verifyResetToken(token: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/user/verify-reset-token/${token}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.valid === true;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/user/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password }),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al restablecer contraseña');
  }

  return data;
}
