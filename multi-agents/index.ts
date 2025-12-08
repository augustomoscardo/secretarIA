import { Annotation, StateGraph, START, END } from "@langchain/langgraph"
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import "dotenv/config"
import fs from "fs"

const ai = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_GENAI_API_KEY || ""
})


const State = Annotation.Root({
  input: Annotation<HumanMessage>,
  executedNodes: Annotation<number>({
    reducer: (currentExecuted, newExecution) => currentExecuted + 1,
    default: () => 0
  }),
  nextNode: Annotation<string>(),
  output: Annotation<BaseMessage[]>({
    reducer: (currentOutput, newOutput) => [...currentOutput, ...newOutput],
    default: () => [],
  })
});

// função que altera o estado 
async function supervisor(state: typeof State.State) {
  console.log('Supervisor escolhendo o próximo especialista');

  const nextNode = await ai.invoke(`
    Escolha um desses próximos estados: financial_specialist, scheduling_specialist, comms_specialist, END.
    Retorne APENAS o nome do especialista e nada mais. Sem quebra de linha
  `)

  console.log(nextNode.content);
  return {
    nextNode: nextNode.content
  }
}

function financialSpecialist(state: typeof State.State) {
  console.log(`Financial Specialist chamado!`);
  
  return {
    executedNodes: 1,
    output: [new AIMessage("Olá da AI")],
  };
}

function schedulingSpecialist(state: typeof State.State) {
  console.log(`Scheduling Specialist chamado!`);
  
  return {
    executedNodes: 1,
    output: [new AIMessage("Olá da AI")],
  };
}

function commsSpecialist(state: typeof State.State) {
  console.log(`Comms Specialist chamado!`);
  
  return {
    executedNodes: 1,
    output: [new AIMessage("Olá da AI")],
  };
}

const graph = new StateGraph(State)
  .addNode("supervisor", supervisor)
  .addNode("financial_specialist", financialSpecialist)
  .addNode("scheduling_specialist", schedulingSpecialist)
  .addNode("comms_specialist", commsSpecialist)
  .addEdge(START, "supervisor")
  .addConditionalEdges("supervisor", (state: typeof State.State) => {
    return state.nextNode;
  })
  .addEdge("financial_specialist", "supervisor")
  .addEdge("scheduling_specialist", "supervisor")
  .addEdge("comms_specialist", "supervisor")
  .compile()

const result = await graph.invoke({
  input: new HumanMessage("E aí!"),
})

// console.log(result);

const drawableGraph = await graph.getGraphAsync()
const graphImage = await drawableGraph.drawMermaidPng()

const graphArrayBuffer = await graphImage.arrayBuffer()

fs.writeFileSync("./graph.png", Buffer.from(graphArrayBuffer));
// OU
// fs.writeFileSync("./graph.png", new Uint8Array(graphArrayBuffer));