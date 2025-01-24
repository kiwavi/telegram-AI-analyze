import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

let apiSecret = process.env.OPENAI_SECRET;

const openai = new OpenAI({
  apiKey: apiSecret,
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {
      role: "user",
      content: `Does the sentence 'An Israeli drone drops a bomb on a building in northern Gaza, flies off, and detonates it near Palestinian civilians, footage shared by local media shows' represent an act of aggression against Palestine by Israel? Answer with yes or no or maybe.`,
    },
  ],
});

// let names = `Israeli military raid area surrounding hospital in West Bank - Sticking in the boots right before ceasefire — reports

// #Israel`;

// console.log(names.replace(/[\r\n]+/gm, " "));

completion.then((result) => console.log(result.choices[0].message));
