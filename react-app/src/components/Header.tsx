import { FaPaw } from 'react-icons/fa';
import ContactForm from './ContactForm';
import UserBtn from './UserBtn';
import Burger from './Burger';
import { useUser } from '../context/UserContext';
import ThemeSwitcher from './ThemeSwitcher';


export default function Header() {
    const { user } = useUser();
    const isAdmin = user?.role.toLowerCase() === 'admin' || user?.role.toLowerCase() === 'super_admin';
    const isLogged = user?.role.toLowerCase() === 'user' || isAdmin;
    return (
        <div className="navbar bg-neutral fixed top-0 left-0 w-full z-50">
            <div className="navbar-start">
                <Burger isAdmin={isAdmin} isLogged={isLogged}/>
                <ThemeSwitcher />
            </div>
            <div className="navbar-center">

                <a className="btn btn-ghost text-xl text-base-100">Pattes et partage <FaPaw className="ml-2 inline-block" /></a>
            </div>
            <div className="navbar-end text-base-100">
                <ContactForm short={true} />
                <UserBtn notif={true} userData={user} />
            </div>
        </div>

    )
}