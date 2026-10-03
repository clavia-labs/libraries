import { Effect, Schema } from "effect"
import { Rpc } from "effect/unstable/rpc"
import { defineLibrary, MethodDescription, MethodHints, type LibraryImplementation } from "./library"

export interface SearchClient {
  readonly search: (input: { readonly query: string; readonly maxResults?: number }) => Effect.Effect<ReadonlyArray<{ readonly title: string; readonly url: string; readonly snippet?: string }>, Error>
}

export function search(client: SearchClient): LibraryImplementation {
  const library = defineLibrary({
    name: "search",
    description: "Search an indexed knowledge source.",
    methods: [Rpc.make("query", {
      payload: Schema.Struct({ query: Schema.String, maxResults: Schema.optionalKey(Schema.Int) }),
      success: Schema.Array(Schema.Struct({ title: Schema.String, url: Schema.String, snippet: Schema.optionalKey(Schema.String) })),
      error: Schema.String,
    }).annotate(MethodDescription, "Search the configured index and return relevant sources.")
      .annotate(MethodHints, { readOnlyHint: true, openWorldHint: true })],
  })
  return library.implement({ query: input => client.search(input).pipe(Effect.mapError(String)) })
}
