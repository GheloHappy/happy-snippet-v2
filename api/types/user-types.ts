export interface User {
    username: string;
    email: string;
    password: string;
}

interface UserSettings {
    user_id: number;
    dark_mode: boolean;
    snippet_theme: string;
    snippet_line_numbers: boolean;
    snippet_wrap_lines: boolean;
}