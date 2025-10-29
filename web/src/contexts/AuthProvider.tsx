import { createContext, useContext, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
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
    // signIn: (fields: SignInFields) => Promise<void>;
    // signUp: (fields: SignUpFields) => Promise<boolean>;
    signOut: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // const dispatch = useAppDispatch();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const signIn = async (fields: SignInFields) => {
        const allFieldsFilled = Object.values(fields).every(
            (field) => field.trim() !== ""
        );

        if (!allFieldsFilled) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await postData(`auth/login`, fields);

            if (result.status === 200) {
                setUser(result.data.userInfo);

                dispatch(setUserDetails(
                    result.data.userInfo
                ));

                toast.success("Welcome back!");

                navigate(routes[result.data.userInfo.auth_description] || "/user", { replace: true });
                return
            }

            toast.error(result.data.message || "Login failed. Please try again.");
            return;

        } catch (error) {
            console.log(error)
            toast.error("Login failed. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
}