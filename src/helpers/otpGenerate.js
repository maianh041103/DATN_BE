module.exports.otp = (number) => {
    let result = '';
    const character = '0123456789';
    for (let i = 0; i < number; i++) {
        result += character.charAt(Math.floor(Math.random() * character.length));
    }
    return result;
}