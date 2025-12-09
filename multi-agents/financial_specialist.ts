import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { State } from "./state.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ai } from "./google_genai.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const payBill = new DynamicStructuredTool({
  name: "pay_bill",
  description: "",
  schema: z.object({
    price: z.number().describe("O valor da conta a ser paga")
  }),
  func: async ({ price }) => {
    console.log("Pagando conta...");

    return "Conta paga com sucesso.";
  }
})

const financialSpecialistAgent = createReactAgent({
  llm: ai,
  tools: [payBill],
  prompt: new SystemMessage("Você é um analista financeiro de um consultório." +
    "analise a conversa e tome a melhor ação para atender o usuário."
  )
})

export async function financialSpecialist(state: typeof State.State) {
  console.log(`Financial Specialist chamado!`);

  const result = await financialSpecialistAgent.invoke(state)

  const financialSpecialistResponse = result.messages[result.messages.length - 1]?.content;

  return {
    messages: [new HumanMessage({
      content: financialSpecialistResponse || ""
    })],
  };
}