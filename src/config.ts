const DEFAULT_API_URL =
  'https://script.google.com/macros/s/AKfycbxusIn3XBgRcT2xKyvKZhDqrEKECzQNUzBvCitJ2u0Tuu05T0j0tPYhqifnHl6Do8uULw/exec';

export const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || DEFAULT_API_URL;
export const API_TIMEOUT_MS = 20_000;
