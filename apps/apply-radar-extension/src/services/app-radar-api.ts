import axios, { isCancel, AxiosError } from "axios";
const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = API_URL;

export class ApplyRadarApi {
  static async googleSignIn(token: string) {
    try {
      const response = await axios.post(`/auth/google`, {
        idToken: token,
      });
      return response.data;
    } catch (error) {
      if (isCancel(error)) {
        console.log("Request cancelled:", error.message);
      } else if (error instanceof AxiosError) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }
}
