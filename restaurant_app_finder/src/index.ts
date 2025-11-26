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
        error: 'Unauthorized',
        message: 'Invalid access code'
      });
    }
  
    // validate message parameter
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message parameter is required and must be a string'
      });
    }

    console.log(`Processing request: "${message}"`);

    // step 1: parse language using gemini model
    const command = await parseWithGemini(message);
    console.log('Gemini parsed command:', JSON.stringify(command, null, 2));

    // step 2: use foursqaure api to find restaurants
    const restaurants = await searchRestaurants(command.parameters);
    console.log(`Found ${restaurants.length} restaurants`);

    // step 3: return results in json format
    return res.json({
      query: message,
      parsed_command: command,
      results: restaurants,
      count: restaurants.length
    });  

  } catch (error: any) {
    console.error('Error in /api/execute:', error.message);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Test endpoint: http://localhost:${port}/api/execute?message=Find%20cheap%20pizza%20in%20los%20angeles&code=pioneerdevai`);
});
