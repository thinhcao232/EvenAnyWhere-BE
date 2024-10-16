const checkPassword = (password) => {
    if (password.length < 6 || password.length > 256) return false;
    return true;
};

module.exports = checkPassword;