import axios from "axios";

const API_URI = import.meta.env.VITE_API_URI;

const api = axios.create({
    baseURL: API_URI,
    withCredentials: true,
});

// helper for building params
const buildUrlWithParams = (
    url: string,
    params: Record<string, string | number | boolean> = {}
): string => {
    const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
    ).toString();
    return queryString ? `${url}?${queryString}` : url;
};

// Unified request function
const request = async (
    method: "get" | "post" | "patch" | "delete",
    url: string,
    data: any = {},
    params: Record<string, string | number | boolean> = {}
) => {
    try {
        const fullUrl = buildUrlWithParams(url, params);
        return await api.request({
            method,
            url: fullUrl,
            data,
            headers: {
                platform: "web",
            },
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response;
        }
        throw error;
    }
};

// Exported functions
export const getData = (url: string, params: Record<string, string | number | boolean> = {}) =>
    request("get", url, {}, params);

export const postData = (url: string, data: any) => request("post", url, data);

export const patchData = (url: string, data: any) => request("patch", url, data);

export const deleteData = (url: string, params: Record<string, string | number | boolean> = {}) =>
    request("delete", url, {}, params);