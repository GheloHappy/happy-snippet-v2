import {
    Skull
} from 'lucide-react';


export default function AuthPage() {
    return (
        <div className="min-h-screen flex justify-center items-center p-5 bg-default">
            <div className="flex flex-col w-full items-center justify-center max-w-5xl md:h-[50vh] md:overflow-hidden">
                <Skull className="w-16 h-16 text-red-500 animate-pulse" />
                <h1 className="text-2xl text-heading">Happy Snipet</h1>
                <p className="text-gray-400">Sign in to access your snippets</p>
            </div>
        </div>
    )
}