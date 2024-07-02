"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
console.log();
const ipApiKey = process.env.ipApiKey;
const weatherApiKey = process.env.weatherApiKey;
app.get('/api/hello', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client_name = req.query.client_name || 'Guest';
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress);
    const userHeaders = {
        'Authorization': req.headers['authorization'],
        'User-Agent': req.headers['user-agent'],
        'X-forwarded-for': req.headers['x-forwarded-for']
    };
    let location;
    let temperature;
    try {
        const ipResponse = yield axios_1.default.get(`https://api.geoapify.com/v1/ipinfo?&apiKey=${ipApiKey}`, {
            headers: userHeaders
        });
        if (ipResponse.data) {
            const geo = geoip_lite_1.default.lookup(`${ipResponse.data.ip}`);
            if (geo) {
                location = geo.city || "unknown";
                try {
                    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${geo.city}&aqi=no`;
                    const weatherData = yield axios_1.default.get(weatherUrl);
                    if (weatherData.data) {
                        temperature = weatherData.data.current.temp_c || "unknown";
                        const response = {
                            client_ip: clientIp,
                            location,
                            greeting: `Hello, ${client_name}! The temperature is ${temperature} degrees Celsius in ${location}`
                        };
                        res.json(response);
                    }
                }
                catch (error) {
                    res.status(500).json({
                        message: 'Failed to get weather data',
                    });
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Failed to get weather data',
        });
        console.log(error);
    }
}));
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
