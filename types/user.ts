export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface AuthContextType {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
} 