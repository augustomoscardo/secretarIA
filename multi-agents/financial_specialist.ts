import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { State } from "./state.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ai } from "./google_genai.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const payBill = new DynamicStructuredTool({
  name: "pay_bill",
  description: "",
  schema: z.object({}),
  func: async () => {
    console.log("Pagando conta...");
    return "Conta paga com sucesso.";
  }
})

const getBill = new DynamicStructuredTool({
  name: "get_bill",
  description: "Pegar o valor da conta do usuário",
  schema: z.object({}),
  func: async ({ price }) => {
    console.log("Buscando o valor da conta...")
    return "Sua conta tem o valor de 500 reais";
  }
})

const createBill = new DynamicStructuredTool({
  name: "create_bill",
  description: "Cria uma novo boleto para ser pago",
  schema: z.object({
    price: z.number().describe("O valor da conta a ser criada")
  }),
  func: async ({ price }) => {
    console.log("Gerando conta...");
    return "Boleto gerado com sucesso.";
  }
})

const agent = createReactAgent({
  llm: ai,
  tools: [payBill, getBill, createBill],
  prompt: new SystemMessage("Você é um analista financeiro de um consultório." +
    "analise a conversa e tome a melhor ação para atender o usuário."
  )
})

export async function financialSpecialist(state: typeof State.State) {
  console.log(`Financial Specialist chamado!`);

  const result = await agent.invoke(state)

  const response = result.messages[result.messages.length - 1]?.content;

  return {
    messages: [new HumanMessage({
      content: `Financial Specialist: ${response || ""}`
    })],
  };
}