import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv"
import { allDefinitions as calendarDefinitions } from "./tools/calendar.js";
import { allDefinitions as emailDefinitions } from "./tools/email.js";

config()

const allDefinitions = [...calendarDefinitions, ...emailDefinitions];
const allDeclarations = allDefinitions.map(definition => definition.declaration);

// dado o nome -> trazer a function a ser executada.  {fnName: fn}
const allFunctions = Object.fromEntries(allDefinitions.map(definition => [definition.declaration.name, definition.function]));

// console.log(allFunctions);


const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
})

const contents = [
  {
    role: "user",
    parts: [{ text: "Remarque todos os eventos do dia 2025-05-01 para 1h mais tarde e avise os convidados." }]
  }
]

let response = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: contents,
  config: {
    tools: [{ functionDeclarations: allDeclarations, }]
  }
})

while (response.functionCalls) {
  const functionCall = response.candidates[0].content.parts[0].functionCall // {args: {}, name: ""}
  const functionToExecute = functionCall.name
  const functionParams = functionCall.args
  console.log(`**Chamando função ${functionToExecute}**`);

  const fn = allFunctions[functionToExecute]
  // console.log(fn);


  const result = fn(functionParams)
  console.log(`**Resultado da função: ${result}**`);

  // Mandar o result da função de volta para a IA.
  const functionResponse = {
    role: "user",
    parts: [{
      functionResponse: {
        name: functionToExecute,
        response: { result: result }
      }
    }]
  }

  contents.push(functionResponse);

  response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: contents,
    config: {
      tools: [{ functionDeclarations: allDeclarations, }]
    }
  });
}

console.log(response.candidates[0].content.parts[0]);