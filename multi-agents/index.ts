import { StateGraph, START, END } from "@langchain/langgraph"
import { HumanMessage } from "@langchain/core/messages"
import { State } from "./state.js"
import { supervisor } from "./supervisor.js"
import { financialSpecialist } from "./financial_specialist.js"
import { schedulingSpecialist } from "./scheduling_specialist.js"
import { commsSpecialist } from "./comms_specialist.js"

import fs from "fs"

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

const result = await graph.invoke({ messages: [new HumanMessage("Olá, quero pagar a minha conta de  300 reais")] })

console.log(result);

const drawableGraph = await graph.getGraphAsync()
const graphImage = await drawableGraph.drawMermaidPng()

const graphArrayBuffer = await graphImage.arrayBuffer()

fs.writeFileSync("./graph.png", Buffer.from(graphArrayBuffer));
// OU
// fs.writeFileSync("./graph.png", new Uint8Array(graphArrayBuffer));