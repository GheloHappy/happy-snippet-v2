// src/components/Toast.tsx
import toast, { type ToastOptions as BaseToastOptions, Toaster } from 'react-hot-toast';
import { AlertCircle, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { type ReactNode } from 'react';

/* -------------------------------------------------
   Pick only the options we want to expose to callers
   ------------------------------------------------- */
type CustomToastOptions = Pick<
    BaseToastOptions,
    'duration' | 'id' | 'position' | 'className' | 'style'
>;

/* -------------------------------------------------
   Base dark toast style (black + red theme)
   ------------------------------------------------- */
const baseToastStyle: React.CSSProperties = {
    background: '#1a1a1a',           // Deep black
    color: '#ffffff',                // White text
    borderRadius: '8px',
    padding: '12px 16px',            // Your requested padding
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #7f1d1d',      // Dark red-900 border
    maxWidth: '420px',
};

/* -------------------------------------------------
   Toast Variants
   ------------------------------------------------- */
type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface CustomToastProps {
    title?: string;
    message: ReactNode;
    variant?: ToastVariant;
    options?: CustomToastOptions;
}

const getVariantConfig = (variant: ToastVariant = 'info') => {
    switch (variant) {
        case 'success':
            return {
                icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                borderColor: '#166534', // green-900
            };
        case 'error':
            return {
                icon: <XCircle className="w-5 h-5 text-red-400" />,
                borderColor: '#7f1d1d', // red-900
            };
        case 'warning':
            return {
                icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
                borderColor: '#78350f', // amber-900
            };
        case 'loading':
            return {
                icon: <Loader2 className="w-5 h-5 text-red-400 animate-spin" />,
                borderColor: '#7f1d1d',
            };
        case 'info':
        default:
            return {
                icon: <AlertCircle className="w-5 h-5 text-blue-400" />,
                borderColor: '#1e40af', // blue-900
            };
    }
};

/* -------------------------------------------------
   Custom Toast Renderer
   ------------------------------------------------- */
const CustomToastContent = ({ title, message, variant = 'info' }: CustomToastProps) => {
    const { icon } = getVariantConfig(variant);

    return (
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1">
                {title && <div className="font-semibold text-white mb-1">{title}</div>}
                <div className="text-sm text-gray-300">{message}</div>
            </div>
        </div>
    );
};

/* -------------------------------------------------
   Public custom toast (main export)
   ------------------------------------------------- */
export const toastCustom = ({
    title,
    message,
    variant = 'info',
    options = {},
}: CustomToastProps) => {
    const { borderColor } = getVariantConfig(variant);

    const style: React.CSSProperties = {
        ...baseToastStyle,
        borderColor,
        ...options.style,
    };

    toast(
        <CustomToastContent title={title} message={message} variant={variant} />,
        {
            duration: variant === 'loading' ? Infinity : 4000,
            ...options,
            style,
        }
    );
};

/* -------------------------------------------------
   Convenience wrappers
   ------------------------------------------------- */
export const toastSuccess = (message: string, title?: string, options?: CustomToastOptions) =>
    toastCustom({ message, title: title || '', variant: 'success', options });

export const toastError = (message: string, title?: string, options?: CustomToastOptions) =>
    toastCustom({ message, title: title || '', variant: 'error', options });

export const toastWarning = (message: string, title?: string, options?: CustomToastOptions) =>
    toastCustom({ message, title: title || '', variant: 'warning', options });

export const toastInfo = (message: string, title?: string, options?: CustomToastOptions) =>
    toastCustom({ message, title: title || '', variant: 'info', options });

export const toastLoading = (message: string, title?: string, options?: CustomToastOptions) =>
    toastCustom({ message, title: title || '', variant: 'loading', options });

export const toastDismiss = (id?: string) => toast.dismiss(id);

/* -------------------------------------------------
   Toaster Component (add to your root layout)
   ------------------------------------------------- */
export const ToastProvider = () => (
    <Toaster
        position="top-center"
        toastOptions={{
            style: {
                background: 'transparent',
                boxShadow: 'none',
                padding: 0,
            },
        }}
        containerStyle={{
            top: 20,
            right: 20,
        }}
    />
);