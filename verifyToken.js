const jwt = require('jsonwebtoken');



function verifyToken(req, res, next) {
    let token;

    // Try to get the token from the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // If not found, try to get the token from cookies
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Proceed to verify the token if it was found
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.sendStatus(403); // Forbidden if token verification fails
            }
            req.user = decoded; // Attach decoded token to request object
            next();
        });
    } else {
        return res.sendStatus(403); // Forbidden if no token is found
    }
}

module.exports = verifyToken;
