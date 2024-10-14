import React from 'react'
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, UserPlus, ArrowRight } from "lucide-react";
import FormInput from '../components/FormInput';
import { useUserStore } from '../stores/useUserStore';

const LoginPage = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading } = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Heading */}
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Log in into your account
        </h2>
      </motion.div>

      {/* Form */}
      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Input */}
            <FormInput
              FormElement="input"
              label="Email address"
              Icon={Mail}
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password Input */}
            <FormInput
              FormElement="input"
              label="Password"
              Icon={Lock}
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition
              duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Log In
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Not a member?{" "}
            <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">
              Sign up now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
};

export default LoginPage