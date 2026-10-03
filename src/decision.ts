import { Effect, Schema } from "effect"
import { Rpc } from "effect/unstable/rpc"
import { defineLibrary, MethodDescription, MethodHints, type LibraryImplementation } from "./library"

export interface DecisionModel {
  readonly complete: (input: { readonly system?: string; readonly prompt: string }) => Effect.Effect<string, Error>
}

export function decision(model: DecisionModel): LibraryImplementation {
  const library = defineLibrary({
    name: "decision",
    description: "Ask a configured model for a bounded decision.",
    methods: [Rpc.make("ask", {
      payload: Schema.Struct({ prompt: Schema.String, system: Schema.optionalKey(Schema.String) }),
      success: Schema.Struct({ text: Schema.String }),
      error: Schema.String,
    }).annotate(MethodDescription, "Ask the configured decision model to respond to a prompt.")
      .annotate(MethodHints, { readOnlyHint: true, openWorldHint: true })],
  })
  return library.implement({ ask: input => model.complete(input).pipe(Effect.map(text => ({ text })), Effect.mapError(String)) })
}
