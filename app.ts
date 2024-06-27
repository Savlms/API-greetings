import express, { Request, Response } from 'express';
const app = express();
const port = 2143;
import geoip from 'geoip-lite';


app.get('/api/hello', (req: Request, res: Response) => {
    const clientName = req.query.client_name as string;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress; 
    const geo = geoip.lookup(clientIp as string);

    const response = {
        ip: clientIp,
        location: geo ? {
            country: geo.country,
            region: geo.region,
            city: geo.city
        } : 'Location not available',
        message: `Hello, ${clientName}!`
    };

    res.json(response);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});










