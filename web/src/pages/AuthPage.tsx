import {
    Skull
} from 'lucide-react';


export default function AuthPage() {

    return (
        <div className="min-h-screen flex justify-center items-center p-5 bg-default">
            <div className="flex flex-col w-full items-center justify-center max-w-5xl md:h-[50vh] md:overflow-hidden gap-y-4">
                <Skull className="w-16 h-16 text-red-500 animate-pulse" />
                <h1 className="text-2xl text-heading">Happy Snippet</h1>
                <p className="text-gray-400">Sign in to access your snippets</p>
                
                <div className='w-full bg-gray-900 border-red-900/30 shadow-2xl rounded-md p-4 text-red-400 font-semibold'>
                    <label>Email or Username</label>
                    <input type="text" className='w-full mt-2 p-2 bg-gray-800 border border-red-900/50 rounded-md focus:outline-none focus:border-red-500 text-white' />
                </div>
            </div>
        </div>
    )
}