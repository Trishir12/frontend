import axios from "axios";

const userAPI = axios.create({ baseURL: import.meta.env.VITE_USER_SERVICE_URL });
const productAPI = axios.create({ baseURL: import.meta.env.VITE_PRODUCT_SERVICE_URL });
const merchantAPI = axios.create({ baseURL: import.meta.env.VITE_MERCHANT_SERVICE_URL });
const checkoutAPI = axios.create({ baseURL: import.meta.env.VITE_CHECKOUT_SERVICE_URL });

const attachToken = (config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};


[userAPI, productAPI, merchantAPI, checkoutAPI].forEach(api =>
  api.interceptors.request.use(attachToken, (e) => Promise.reject(e))
);

export { userAPI, productAPI, merchantAPI ,checkoutAPI};
