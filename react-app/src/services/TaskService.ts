import { CustomError } from "../commons/Error";

interface TaskCreateRequest {
  dueDate: string;
  eventId: number | undefined;
  title: string;
  description: string;
  priority?: number;
}

interface TaskUpdateRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: number;
}

interface ListTaskRequest {
  page?: number;
  limit?: number;
}

class TaskService {
  async createTask(body: TaskCreateRequest): Promise<any> {
    const response = await fetch('/api/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new CustomError(response.status, data.error || 'Something went wrong');
    }
    return data;
  }

  async finishTask(taskId: number): Promise<void> {
    const response = await fetch(`/api/v1/tasks/${taskId}/finish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const data = await response.text();
      throw new CustomError(response.status, data || 'Something went wrong');
    }
  }
  async unfinishTask(taskId: number): Promise<void> {
    const response = await fetch(`/api/v1/tasks/${taskId}/unfinish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const data = await response.text();
      throw new CustomError(response.status, data || 'Something went wrong');
    }
  }
  async updateTask(taskId: number, body: TaskUpdateRequest): Promise<any> {
    const response = await fetch(`/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new CustomError(response.status, data.error || 'Something went wrong');
    }
    return data;
  }
  async getTaskById(taskId: number): Promise<any> {
    const response = await fetch(`/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new CustomError(response.status, data.error || 'Something went wrong');
    }
    return data;
  }

  async deleteTaskById(taskId: number): Promise<void> {
    const response = await fetch(`/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const data = await response.text();
      throw new CustomError(response.status, data || 'Something went wrong');
    }
  }
  async assignTaskToUser(taskId: number, userId: number): Promise<void> {
    const response = await fetch(`/api/v1/tasks/${taskId}/assign/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const data = await response.text();
      throw new CustomError(response.status, data || 'Something went wrong');
    }
  }
  async listTasks(filter: ListTaskRequest): Promise<any> {
    const url = new URL('/api/v1/tasks', window.location.origin);
    if (filter.page) url.searchParams.append('page', filter.page.toString());
    if (filter.limit) url.searchParams.append('limit', filter.limit.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new CustomError(response.status, data.error || 'Something went wrong');
    }
    return data;
  }
  async removeTaskFromUser(taskId: number, userId: number): Promise<void> {
    const response = await fetch(`/api/v1/tasks/${taskId}/unassign/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const data = await response.text();
      throw new CustomError(response.status, data || 'Something went wrong');
    }
  }
}

export default new TaskService();
