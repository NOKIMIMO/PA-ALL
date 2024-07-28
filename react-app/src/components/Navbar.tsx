import { ReactNode } from 'react';

export function Navbar({ children }: { children: ReactNode }) {
    return (
        <div className="grid grid-cols-12 h-screen">
            <div className="col-span-1 border p-4 flex justify-center items-center bg-gray-200">
                <div className="drawer">
                    <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                        {/* Page content here */}
                        <label htmlFor="my-drawer" className="btn btn-primary drawer-button">{'<'}</label>
                    </div>
                    <div className="drawer-side">
                        <label htmlFor="my-drawer" className="drawer-overlay"></label>
                        <ul className="menu p-4 w-60 min-h-full text-base-content bg-gray-200">
                            {/* Sidebar content here */}
                            <li><a>Sidebar Item 1</a></li>
                            <li><a>Sidebar Item 2</a></li>
                            <li className="mt-auto flex justify-center">
                                <label htmlFor="my-drawer" className="btn btn-primary drawer-button">{'>'}</label>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="col-span-11 p-4">
                {children} {/* Render the content passed as children */}
            </div>
        </div>
    );
}