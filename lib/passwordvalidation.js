export function validatePassword(password) {
    let errorMsg = '';
    const error = [];
    if (!/(?=.*[A-Z])/.test(password)) {
        error.push("one uppercase letter")
        errorMsg += "one uppercase letter, "
    }
    if (!/(?=.*[a-z])/.test(password)) {
        error.push("one lowercase letter")

    }
    if (!/(?=.*\d)/.test(password)) {
        error.push("one number")

    }
    if (!/(?=.*[@#$!%*?&])/.test(password)) {
        error.push("one special charecter")

    }
    if (!/(?=.{6,})/.test(password)) {
        error.push("6 charecters long")

    }

    if (error.length === 0) return ''
    else if (error.length === 1) return `Password must be at least ${error[0]}`
    else {
        const lastError = error.pop();
        return `Password must be at least ${error.join(", ")} and ${lastError}`
    }

}