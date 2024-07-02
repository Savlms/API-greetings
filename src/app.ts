import express, { Request, Response } from 'express';
import geoip from 'geoip-lite';
import cors from 'cors'
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()
const app = express();
const port = process.env.PORT;
const ipApiKey = process.env.ipApiKey;
const weatherApiKey = process.env.weatherApiKey

app.use(cors());

app.get('/api/hello', async (req: Request, res: Response) => {
    const client_name = req.query.client_name as string || 'Guest';
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    
    
    const userHeaders = {
        'Authorization': req.headers['authorization'], 
        'User-Agent': req.headers['user-agent'], 
        'X-forwarded-for': req.headers['x-forwarded-for']
       
    };
   let location;
   let temperature;

    try {
        const ipResponse = await axios.get(`https://api.geoapify.com/v1/ipinfo?&apiKey=${ipApiKey}`, {
            headers: userHeaders
         })
      
        if(ipResponse.data) {
            
             const geo = geoip.lookup(`${ipResponse.data.ip}`);
             if (geo) {
                
                location = geo.city || "unknown"
               try {
                    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${geo.city}&aqi=no`
                    const weatherData = await axios.get(weatherUrl)
                    if (weatherData.data) {
                        
                temperature = weatherData.data.current.temp_c || "unknown"
                const response = {
                    client_ip: clientIp,
                    location,
                    greeting: `Hello, ${client_name}! The temperature is ${temperature} degrees Celsius in ${location}`
                };
        
                res.json(response);
                    }
               } catch(error) {
                res.status(500).json({
                    message: 'Failed to get weather data',
                })

               }
                
             }  
        }

    } catch (error) {
        res.status(500).json({
            message: 'Failed to get weather data',
        })
        console.log(error);
    }
    
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});






