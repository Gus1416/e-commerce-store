import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, User, Lock, Loader, UserPlus, ArrowRight } from "lucide-react";
import FormInput from "../components/FormInput";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, loading } = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
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
          Create your account
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
            {/* Name input */}
            <FormInput
              FormElement="input"
              label="Full name"
              Icon={User}
              type="text"
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            {/* Email input */}
            <FormInput 
              FormElement="input"
              label="Email address"
              Icon={Mail}
              type="email"
              id="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            {/* Password input */}
            <FormInput
              FormElement="input"
              label="Password"
              Icon={Lock}
              type="password"
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {/* Confirm password input */}
            <FormInput
              FormElement="input"
              label="Confirm password"
              Icon={Lock}
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />

            {/* Submit button */}
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
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Link to login page */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
              Login here <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
