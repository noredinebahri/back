const NodeCache = require('node-cache');
const myCache = new NodeCache();

exports.cacheMiddleware = (duration) => {
    return (req, res, next) => {
        const key = req.originalUrl || req.url;
        const cachedResponse = myCache.get(key);
        console.log(cachedResponse);

        if (cachedResponse) {
            console.log(`Cache hit for ${key}`);
            res.send(cachedResponse);
        } else {
            console.log(`Cache miss for ${key}`);
            res.sendResponse = res.send;
            res.send = (body) => {
                myCache.set(key, body, duration);
                res.sendResponse(body);
            };
            next();
        }
    };
}
