import { ai } from "./google_genai.js";
import { State } from "./state.js";
import { z } from "zod"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const routingTool = {
  name: "routingTool",
  description: "Selecione o próximo estado.",
  schema: z.object({
    next: z.enum(["financial_specialist", "scheduling_specialist", "comms_specialist", "END"])
  })
}

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system", "Você é o supervisor de um consultório. Tome a melhor ação para atender a necessidade do cliente" +
    "Com base na conversa a seguir:"
  ],
  new MessagesPlaceholder("messages"),
  ["human", "Escolha um desses próximos estados: financial_specialist, scheduling_specialist, comms_specialist, END (estado terminal se não tiver mais nada para fazer)"]
])

// função que altera o estado 
export async function supervisor(state: typeof State.State) {
  console.log('Supervisor escolhendo o próximo especialista');

  const aiWithTool = ai.bindTools([routingTool], {
    tool_choice: "routingTool"
  })

  const aiResponse = await prompt.pipe(aiWithTool).invoke({ messages: state.messages })

  if (aiResponse.tool_calls) {
    console.log(`Supervisor chamou ${aiResponse.tool_calls[0]?.args.next}`);

    return {
      nextNode: aiResponse.tool_calls[0]?.args.next
    }
  } else {
    console.log(`Supervisor terminou o atendimento.`);

    return {
      nextNode: "END"
    }
  }
}