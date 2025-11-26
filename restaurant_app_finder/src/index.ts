import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {parseWithGemini} from './services/gemini_handler';
import {searchRestaurants} from './services/foursquare_handler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api check 
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'restaurant app finder API is running' });
});

// main api
app.get('/api/execute', async (req: Request, res: Response) => {
  try {
    const { message, code } = req.query;

    // Validate access code
    if (code !== 'pioneerdevai') {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'invalid access code'
      });
    }
  
    // validate message parameter
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'bad Request',
        message: 'message parameter is required and must be a string'
      });
    }

    console.log(`processing request: "${message}"`);

    // step 1: parse language using gemini model
    const command = await parseWithGemini(message);
    console.log('gemini parsed command:', JSON.stringify(command, null, 2));

    // step 2: use foursqaure api to find restaurants
    const restaurants = await searchRestaurants(command.parameters);
    console.log(`found ${restaurants.length} restaurants`);

    // step 3: return results in json format
    return res.json({
      query: message,
      parsed_command: command,
      results: restaurants,
      count: restaurants.length
    });  

  } catch (error: any) {
    console.error('error in /api/execute:', error.message);

    return res.status(500).json({
      error: 'internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// when executing in postman better to use http://localhost:3000/api/execute 
// and then add the message and code to the query params
app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
  console.log(`test endpoint: http://localhost:3000/api/execute?message=find%20cheap%20sushi%20restaurant%20in%20los%20angeles&code=pioneerdevai`);
});