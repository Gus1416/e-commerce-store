import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

/**
 * This is a zustand store that manages user authentication.
 * It exports a state object with the following properties:
 * - user: the current user object
 * - loading: a boolean indicating if a request is in progress
 * - checkingAuth: a boolean indicating if the store is currently checking if the user is logged in
 * - signup: a function that signs up a new user and sets the user object in the state
 * - login: a function that logs in a user and sets the user object in the state
 * - logout: a function that logs out the current user and sets the user object to null
 * - checkAuth: a function that checks if the user is logged in and sets the user object in the state if they are
 *
 * The store uses the axios instance to make requests to the backend API.
 * The store uses the toast library to display error messages to the user.
 */
export const useUserStore = create((set, get) => ({
    // Initial states
    user: null,
    loading: false,
    checkingAuth: true,

    // Set states functions
    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Passwords do not match");
        }

        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            set({ user: res.data.user, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "Something went wrong");
        }
    },   

    login: async ({ email, password }) => {
        set({ loading: true });

        try {
            const res = await axios.post("/auth/login", { email, password });
            set({ user: res.data.user, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "Something went wrong");
        }
    },

    logout: async () => {
        try {
            await axios.post("/auth/logout");
            set({ user: null });
        } catch (error) {
            toast.error(error.response.data.message || "Something went wrong");
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const res = await axios.get("/auth/profile");
            set({ user: res.data.user, checkingAuth: false });
        } catch (error) {
            set({ user: null, checkingAuth: false });
        }
    },

    refreshToken: async () => {
        // Prevent multiple refresh token requests by checking if a refresh token request is already in progress
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const res = await axios.get("/auth/refresh-token");
            set({ checkingAuth: false });
            return res.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    }
}));


// axios interceptor for refreshing access token
let refreshPromise = null;

/**
 * An axios interceptor is a function that is called for each request or response
 * made by axios. This particular interceptor is used to refresh the access token
 * when it has expired. When a request is made and the server responds with a 401
 * status code (Unauthorized), this interceptor catches the error and attempts
 * to refresh the access token by calling the refreshToken function from the
 * useUserStore. If the refresh token request is successful, the original request
 * is re-sent with the new access token. If the refresh token request fails, the
 * user is logged out by calling the logout function from the useUserStore.
 */
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config; // Save the original request

        // If the error is a 401 status code, attempt to refresh the access token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // If a refresh token request is already in progress, wait for it to finish
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }
                
                // Start a new refresh token request
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                // Re-send the original request with the new access token
                return axios(originalRequest);
            } catch (error) {
                // If the refresh token request fails, log the user out
                useUserStore.getState().logout();
                return Promise.reject(error); // Re-throw the error
            }
        }

        // If the error is not a 401 status code, re-throw the error
        return Promise.reject(error);
    }
);
