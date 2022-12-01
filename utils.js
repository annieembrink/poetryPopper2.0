function successUrlEncode(message) {
    const query = new URLSearchParams({type: "success", message: message});
    return query.toString();
}

function failUrlEncode(message) {
    const query = new URLSearchParams({type: "fail", message: message});
    return query.toString();
}


export { successUrlEncode, failUrlEncode }