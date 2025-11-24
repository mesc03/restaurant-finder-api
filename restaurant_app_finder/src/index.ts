import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import {parseWithGemini} from './services/gemini_handler';
import { error } from 'console';
import { parse } from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// check if api is running
app.get('/', (req: Request, res: Response) => {
  res.send('restaurant app finder api is running');
})

// main api
app.get('/api/execute', async (req: Request, res: Response) => {
  try {
    const {message, code } = req.query;
  
    if (code !== 'pionnerdevai') {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'invalid code'
      });
    }
  
  // validate msg params
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'message parameter is required and must be a string',
      message: 'please provide a valid message query parameter'
      });
    }

  console.log(`processing request: "${message}"`);

  // parse llm
  const command = await parseWithGemini(message);
  console.log('parsed command:', JSON .stringify(command, null, 2));

  // return parsing command
  return res.json({ 
    query: message,
    parsed_command: command,
    message: 'successfully parsed message'
   });  

  } catch (error: any) {
    console.error('error in /api/execute:', error.message);

    return res.status(500).json({
      error: 'internal server error',
      message: error.message || 'an unexpected error occurred'
    });
  }
});

app.listen(port, () => {
  console.log(`the server is running on port http://localhost:${port}`);
  console.log(`test the endpoint at http://localhost:${port}/api/execute?message=Find%20sushi%20in%20Tokyo&code=pionnerdevai`); // message can be edited in the url so feel free to try //
})