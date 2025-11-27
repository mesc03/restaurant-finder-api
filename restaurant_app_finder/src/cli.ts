import * as readline from 'readline';
import dotenv from 'dotenv';
import { parseWithGemini } from './services/gemini_handler';
import { searchRestaurants } from './services/foursquare_handler';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('enter search: ', async (message) => {
  const command = await parseWithGemini(message);
  const restaurants = await searchRestaurants(command.parameters);
  
  console.log(`\nfound ${restaurants.length} restaurants:\n`);
  restaurants.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name} - ${r.address}`);
  });
  
  rl.close();
});
