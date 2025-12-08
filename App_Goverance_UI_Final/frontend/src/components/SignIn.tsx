import React, { useState } from 'react';
import { UserPlus, LogIn, Shield } from 'lucide-react';

interface SignInProps {
  onSignIn: (username: string) => void;
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [username, setUsername] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    // Get existing users from localStorage
    const usersJson = localStorage.getItem('users');
    const users: string[] = usersJson ? JSON.parse(usersJson) : [];

    if (isCreatingUser) {
      // Create new user
      if (users.includes(username.trim())) {
        setError('User already exists. Please sign in instead.');
        return;
      }
      users.push(username.trim());
      localStorage.setItem('users', JSON.stringify(users));
      setSuccess('User created successfully!');
      setTimeout(() => {
        onSignIn(username.trim());
      }, 1000);
    } else {
      // Sign in existing user
      if (!users.includes(username.trim())) {
        setError('User not found. Please create a new user first.');
        return;
      }
      onSignIn(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">App Governance</h1>
          <p className="text-gray-600">Ticket Managing System</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-gray-900 mb-1">
              {isCreatingUser ? 'Create New User' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isCreatingUser
                ? 'Enter your details to create an account'
                : 'Sign in to access your tickets'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your username"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isCreatingUser ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create User
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Create User */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsCreatingUser(!isCreatingUser);
                setError('');
                setSuccess('');
              }}
              className="text-blue-600 hover:text-blue-700 transition"
            >
              {isCreatingUser
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create New User"}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 mt-6">
          Professional ticket management for your organization
        </p>
      </div>
    </div>
  );
}
