import { FaCat } from "react-icons/fa";
import { GiWool } from "react-icons/gi";

const Loading = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="relative flex items-center">
                <FaCat className="text-gray-800 text-6xl animate-cat-chase" />
                <GiWool className="text-pink-500 text-6xl ml-12 animate-spin-wool" />
            </div>
        </div>
    );
}

export default Loading;