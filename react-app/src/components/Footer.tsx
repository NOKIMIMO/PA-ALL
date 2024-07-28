import { FaTwitter, FaFacebook, FaInstagram, FaPaw } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="footer items-center p-4 bg-neutral text-neutral-content">
            <aside className="items-center grid-flow-col">
                <FaPaw className="fill-current"></FaPaw>
                <p>Copyright © 2024 - All right reserved</p>
            </aside>
            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <a href="https://twitter.com"><FaTwitter className=''></FaTwitter></a>
                <a href='https://instagram.com'><FaInstagram></FaInstagram></a>
                <a href="https://facebook.com"><FaFacebook></FaFacebook></a>
            </nav>
        </footer>
    );
}
