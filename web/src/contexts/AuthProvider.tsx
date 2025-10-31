import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";


export type AuthUser = {
    id: string;
    email: string;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    email_verified?: boolean;
    provider?: string;
    exp?: number;
    cookieExpiration?: number;
}

interface AuthContextType {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    signIn: (fields: SignInFields) => Promise<void>;
    googleSignIn: () => Promise<void>;
    signUp: (fields: SignUpFields) => Promise<boolean>;
    signOut: () => Promise<void>;
    isLoading: boolean;
}

interface SignInFields {
    email: string;
    password: string;
}

interface SignUpFields {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // const dispatch = useAppDispatch();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const signIn = async (fields: SignInFields) => {

    };

    const googleSignIn = async () => {

    }

    const signUp = async (fields: SignUpFields): Promise<boolean> => {
        return false
    }

    const signOut = async () => {
    }

    return (
        <AuthContext.Provider
            value={{ user, setUser, signIn, googleSignIn, signUp, signOut, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};