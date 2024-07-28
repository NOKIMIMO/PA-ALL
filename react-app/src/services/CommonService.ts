import { CustomError } from '../commons/Error';


class CommonService {
  public async checkToken() {
    try{
        const response = await fetch('/api/v1/health/check', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    } catch (error) {
        localStorage.removeItem('token');
        return new CustomError(401, 'Unauthorized');
    }
  }
}

export default new CommonService(); 