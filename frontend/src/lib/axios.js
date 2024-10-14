import axios from "axios";

/**
 * This code creates an instance of the axios HTTP client with a
 * predefined base URL and configuration. The base URL is set to
 * "http://localhost:5000/api" in development mode and "/api" in
 * production mode. The "withCredentials" option is set to true, which
 * means that the Axios instance will send cookies with the request.
 * This is important for authentication, because the backend API
 * relies on cookies to authenticate requests.
 */
const axiosInstance = axios.create({
    baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
    withCredentials: true,
});

export default axiosInstance;

// Axios is a popular library for making HTTP requests in JavaScript.
// Axios is better than Fetch because it has better support for cookies and other features.