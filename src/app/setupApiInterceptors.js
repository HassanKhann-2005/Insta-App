import { apiClient } from "../constants/api";
import { incrementPendingRequests, decrementPendingRequests } from "./features/ui/uiSlice";

export function setupApiInterceptors(store) {
    apiClient.interceptors.request.use(
        (config) => {
            store.dispatch(incrementPendingRequests());
            return config;
        },
        (error) => {
            store.dispatch(decrementPendingRequests());
            return Promise.reject(error);
        }
    );

    apiClient.interceptors.response.use(
        (response) => {
            store.dispatch(decrementPendingRequests());
            return response;
        },
        (error) => {
            store.dispatch(decrementPendingRequests());
            return Promise.reject(error);
        }
    );
}


