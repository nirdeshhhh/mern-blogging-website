const storeInSession = (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
};

const lookInSession = (key) => {
    const value = sessionStorage.getItem(key);
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const removeFromSession = (key) => {
    sessionStorage.removeItem(key);
};

const logOutUser = () => {
    sessionStorage.clear();
};

export {
    storeInSession,
    lookInSession,
    removeFromSession,
    logOutUser
};
