import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { State } from "./state.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ai } from "./google_genai.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const scheduleAppointment = new DynamicStructuredTool({
  name: "schedule_appointment",
  description: "Marca uma nova consulta",
  schema: z.object({}),
  func: async () => {
    console.log("Marcando consulta...");
    return "Consulta marcada com sucesso.";
  }
})

const rescheduleAppointment = new DynamicStructuredTool({
  name: "reschedule_appointment",
  description: "Remarca uma consulta existente",
  schema: z.object({}),
  func: async ({ price }) => {
    console.log("Remarcando consulta...")
    return "Consulta remarcada com sucesso.";
  }
})

const cancelAppointment = new DynamicStructuredTool({
  name: "cancel_appointment",
  description: "Cancela uma consulta existente",
  schema: z.object({}),
  func: async () => {
    console.log("Cancelando consulta...");
    return "Consulta cancelada com sucesso.";
  }
})

const agent = createReactAgent({
  llm: ai,
  tools: [scheduleAppointment, rescheduleAppointment, cancelAppointment],
  prompt: new SystemMessage("Você é um secretário de um consultório, responsável por organizar a agenda." +
    "analise a conversa e tome a melhor ação para atender o usuário."
  )
})

export async function schedulingSpecialist(state: typeof State.State) {
  console.log(`Scheduling Specialist chamado!`);

  const result = await agent.invoke(state)

  const response = result.messages[result.messages.length - 1]?.content;

  return {
    messages: [new HumanMessage({
      content: `Scheduling Specialist: ${response || ""}`
    })],
  };
}