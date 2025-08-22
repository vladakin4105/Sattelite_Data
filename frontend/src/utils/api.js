import axios from "axios";

// Dacă avem REACT_APP_API_BASE setat, îl folosim
// Altfel, dacă rulăm din browser pe host → folosim localhost:8000
// Dacă am vrea doar între containere (SSR etc.), am folosi http://api:8000
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (window.location.hostname === "localhost" ? "http://localhost:8000" : "http://api:8000");

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});
