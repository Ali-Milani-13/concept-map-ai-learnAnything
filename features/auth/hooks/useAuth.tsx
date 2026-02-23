import { useState, FormEvent } from 'react';
import { authenticateUser } from '../actions/auth.actions';

interface UseAuthProps {
  onAuthSuccess: (user: Record<string, unknown>) => void;
  onClose: () => void;
}

export function useAuth({ onAuthSuccess, onClose }: UseAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authenticateUser(isLogin, email, password);

      if (result.error) throw new Error(result.error);

      if (result.hasSession) {
        onAuthSuccess(result.user as Record<string, unknown>);
        onClose();
      } else if (!isLogin && result.user) {
        setError("Success! Please check your email for the confirmation link, then log in.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleAuth,
    toggleMode
  };
}