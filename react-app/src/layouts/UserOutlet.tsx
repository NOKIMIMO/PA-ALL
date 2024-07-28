import { Outlet } from "react-router-dom";

export default function UserLayout() {
    return (
        <div>
            <Outlet /> {/* This will render the nested routes */}
        </div>
    );
}