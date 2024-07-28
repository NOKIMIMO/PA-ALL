import { FaUser } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import { useToast } from '../context/ToastManager';
import { ToastType } from '../enum/toast';
import { useNavigate } from 'react-router-dom';
interface UserBtnProps {
    notif: boolean;
    userData: any;
}

export default function UserBtn({ notif,userData }: UserBtnProps) {
    const { addToast } = useToast(); 
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await AuthService.logout();
            console.log(localStorage.getItem('token'));
            addToast('Logout successful', ToastType.SUCCESS); 
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    return (
        <div className="relative">
            <button className="btn btn-ghost btn-circle dropdown ">
                <div className="indicator">
                    <FaUser tabIndex={0} role="button" className="h-5 w-5 mr-2" />
                    {notif && <span className="badge badge-xs badge-info indicator-item"></span>}
                </div>
                {
                localStorage.getItem('token') != null ? (
                    <ul className="menu dropdown-content w-48 bg-base-100 text-neutral shadow-lg rounded-md origin-top-right right-0">
                        <li>
                            <a href={`/user/${userData?.id}`} className="block px-4 py-2 text-sm">Profile</a>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="block px-4 py-2 text-sm">Logout</button>
                        </li>
                    </ul>
                ) : (
                    <ul className="menu dropdown-content w-48 bg-base-100 text-neutral shadow-lg rounded-md origin-top-right right-0">
                        <li>
                            <a href="/login/" className="block px-4 py-2 text-sm">Login</a>
                        </li>
                    </ul>
                )
            }
            </button>
        </div>
    );
}