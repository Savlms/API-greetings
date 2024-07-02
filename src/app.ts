import express, { Request, Response } from 'express';
import geoip from 'geoip-lite';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

const app = express();
const port = process.env.PORT;
console.log()

// Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key
const weatherApiKey = process.env.weatherAPIKEY;

app.get('/api/hello', async (req: Request, res: Response) => {
    const client_name = req.query.client_name as string || 'Guest';
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    console.log(req.headers['x-forwarded-for'])
    console.log( req.ips)
    const geo = geoip.lookup('197.210.226.168');
    // console.log(geo)
    // console.log(req.ip)


    const userHeaders = {
        'Authorization': req.headers['authorization'], // Example: Authorization header
        'User-Agent': req.headers['user-agent'], // Example: User-Agent header
        'X-forwarded-for': req.headers['x-forwarded-for']
        // Add other headers as necessary
    };
    if (!geo) {
        return res.status(500).json({ error: 'Unable to determine location' });
    }

    const city = geo.city || 'Unknown';
    const location = `${city}`;
    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}&aqi=no`

    try {
        const ipResponse = await axios.get(`https://api.geoapify.com/v1/ipinfo?&apiKey=${weatherApiKey}`, {
            headers: userHeaders
         })
        const weatherResponse = await axios.get(weatherUrl);
        if(ipResponse.data) {
             console.log(ipResponse.data)
        }
        // const temperature = weatherResponse.data.main.temp;



        // const response = {
        //     client_ip: clientIp,
        //     location,
        //     greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}`
        // };

        res.json(ipResponse.data);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to get weather data',
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
