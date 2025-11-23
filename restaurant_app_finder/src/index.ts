import express, {Request, Response} from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/execute', async (req: Request, res: Response) => {
  const {message, code } = req.query;

  if (code !== 'pionnerdevai') {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!message) {
    return res.status(400).json({ error: 'message parameter is required' })
  }

  try {
    res.json({message: 'route is working!', received: message });
  } catch (error) {
    res.status(500).json({error: 'internal service error' });
  }
});

app.listen(port, () => {
  console.log(`the server is running on port ${port}`);
  console.log(`test the endpoint at http://localhost:${port}/api/execute?message=hello&code=pionnerdevai`); // message can be edited in the url so feel free to try //
})