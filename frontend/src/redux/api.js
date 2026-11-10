import axios from 'axios';

export const BASE_URL = (
    process.env.REACT_APP_BASE_URL && process.env.REACT_APP_BASE_URL !== 'undefined'
        ? process.env.REACT_APP_BASE_URL
        : 'http://localhost:5000'
).replace(/\/+$/, '');

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

