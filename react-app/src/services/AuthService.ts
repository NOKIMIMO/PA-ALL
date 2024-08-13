import { CustomError } from '../commons/Error';
import UserService from './UserService';

export interface LogRegResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface LogoutResponse {
  message: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LogRegResponse | CustomError> {

    const body = {
      email: email,
      password: password,
    };
    try {
      const response = await fetch('/api/v1/auth/login', {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (!response.ok) {
        return new CustomError(response.status, data.error || 'Something went wrong');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role)
      // Fetch user data after registration
      const userData = await this.fetchUserData();
      if (userData instanceof CustomError) {
        return userData;
      }

      return { ...data, user: userData } as LogRegResponse;
    } catch (error) {
      return new CustomError(500, 'Network error or server not reachable');
    }
  }

  async logout(): Promise<LogoutResponse | CustomError> {
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return new CustomError(response.status, data.error || 'Something went wrong');
      }
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return data as LogoutResponse;
    } catch (error) {
      return new CustomError(500, 'Network error or server not reachable');
    }
  }

  async register(email: string, password: string, firstname:string, lastname:string): Promise<LogRegResponse | CustomError> {

    const body = {
      email: email,
      password: password,
      firstname: firstname,
      lastname: lastname,
    };
    try {
      const response = await fetch('/api/v1/auth/signup', {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (!response.ok) {
        console.log(data.error);
        return new CustomError(response.status, data.error || 'Something went wrong');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      // Fetch user data after registration
      const userData = await this.fetchUserData();
      if (userData instanceof CustomError) {
        return userData;
      }

      return { ...data, user: userData } as LogRegResponse;
    } catch (error) {
      return new CustomError(500, 'Network error or server not reachable');
    }
  }

  async sendMessage(name: string, email: string, message: string): Promise<{ message: string } | CustomError> {
    const body = {
      name: name,
      email: email,
      message: message,
    };
    try {
      const response = await fetch('/api/v1/contact', {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (!response.ok) {
        return new CustomError(response.status, data.error || 'Something went wrong');
      }
      return data;
    } catch (error) {
      return new CustomError(500, 'Network error or server not reachable');
    }
  }
  async fetchUserData() {
    try {
      const data = await UserService.getUserDataByToken();
      if (data instanceof CustomError) {
        localStorage.removeItem('token');
        return data;
      }
      return data;
    } catch (error) {
      return new CustomError(500, 'Network error or server not reachable');
    }
  }

}



export default new AuthService();