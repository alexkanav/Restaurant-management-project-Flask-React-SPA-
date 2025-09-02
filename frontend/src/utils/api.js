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

        const contentType = response.headers.get("Content-Type");
        const isJson = contentType && contentType.includes("application/json");
        const responseData = isJson ? await response.json() : null;

        // Return response status and response data
        if (!response.ok) {
            // Attach message from response if available
            const errorMessage = responseData?.message || `HTTP error! Status: ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.responseData = responseData;
            throw error;
        }

        return { status: response.status, data: responseData };

    } catch (error) {
        console.error("sendToServer error:", error);
        throw error;
    }
}
