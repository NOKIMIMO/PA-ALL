import { FiMenu } from "react-icons/fi";

interface BurgerProps {
    isAdmin: boolean;
    isLogged: boolean;
}

export default function Burger({ isAdmin, isLogged }: BurgerProps) {
    //check if user login
    return (
        <div>
            <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-base-100 text-base bg-base">
                    <FiMenu className="h-5 w-5 mr-2" />
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-neutral rounded-box w-52 text-base-100">
                    <li><a href='/' >Homepage</a></li>
                    {
                        isLogged && (
                            <li><a href='/eventList'>Event List</a></li>
                        )
                    }

                    <li><a href='/postList'>Post List</a></li>
                    {
                        isLogged && (
                            <li><a href='/voteList'>Vote List</a></li>
                        )
                    }

                    <li><a href='/donate'>Make a Donation</a></li>
                    <li><a href='/about'>About</a></li>
                    {
                        isLogged && (
                            <li><a href='/vault'>GDE</a></li>
                        )
                    }
                    {isAdmin && <li><a href='/admin'>Admin</a></li>}
                </ul>
            </div>
        </div>
    )
}