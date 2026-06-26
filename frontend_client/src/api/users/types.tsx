export interface SignupBody {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    gdpr: boolean;
    terms: boolean;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface GoogleAuthBody {
    code: string;
}

export interface VerifyCodeBody {
    email: string;
    code: string;
    type: 'activation' | 'change_password';
}
