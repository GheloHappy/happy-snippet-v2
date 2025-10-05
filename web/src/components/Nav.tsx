import { MdOutlineMenu, MdClose } from "react-icons/md";
import { AiOutlineHome, AiOutlineSnippets } from "react-icons/ai";

export default function Nav() {
    const navItems = [
        { id: "home", name: "Home", icon: AiOutlineHome, path: "/home" },
        { id: "snippets", name: "Snippets", icon: AiOutlineSnippets, path: "/snippets" },
    ];
    
    return (
        <>
            <div className="fixed top-0 w-full flex items-center justify-center z-50 bg-gradient-to-br from-gray-950 via-red-950 to-black  ">
                <h1 className="text-white">test</h1>
            </div>
        </>
    )
}