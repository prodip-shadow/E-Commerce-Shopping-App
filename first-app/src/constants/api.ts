import axios from "axios";



const api = axios.create({ baseURL: "https://ecom-app-server-two.vercel.app/api" });
export default api;
