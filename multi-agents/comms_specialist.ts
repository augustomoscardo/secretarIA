import { HumanMessage } from "@langchain/core/messages"
import type { State } from "./state.js";

export function commsSpecialist(state: typeof State.State) {
  console.log(`Comms Specialist chamado!`);

  return {
    messages: [new HumanMessage("Olá da AI")],
  };
}