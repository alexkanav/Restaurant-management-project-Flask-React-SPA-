import { baseApiUrl } from '../../config.json';


export async function sendToServer(path, data = null, method = "POST") {
    const options = {
        method,
        headers: {},
        credentials: 'include', // Needed for cookies or session
    };

    if (method !== "GET" && data) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    let url = `${baseApiUrl}${path}`;
    if (method === "GET" && data) {
        url += `?${new URLSearchParams(data).toString()}`;
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("sendToServer error:", error);
        throw error;
    }
}
