export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string) => {
    localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
    localStorage.removeItem('authToken');
};