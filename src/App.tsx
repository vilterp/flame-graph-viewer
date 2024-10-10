import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FlameGraph } from "react-flame-graph";
import { z } from "zod";

const nodeSchema = z.object({
  name: z.string(),
  value: z.number(),
  tooltip: z.string().optional(),
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
  children: z.array(z.lazy(() => nodeSchema)).optional(),
});

function App() {
  const [json, setJson] = useState("");

  const parsed = tryParse(json);

  return (
    <div>
      <h1>Flame Graph Viewer</h1>

      <textarea
        value={json}
        style={{ fontFamily: "monospace" }}
        onChange={(e) => setJson(e.target.value)}
        placeholder="Paste JSON here"
      />

      {parsed.type === "err" ? (
        <p style={{ color: "red", fontFamily: "monospace" }}>
          {JSON.stringify(parsed.errors)}
        </p>
      ) : (
        <FlameGraph data={json} height={800} width={1000} />
      )}
    </div>
  );
}

function tryParse(json: string) {
  try {
    const parsed = JSON.parse(json);
    const result = nodeSchema.safeParse(parsed);
    if (result.success) {
      return { type: "ok", data: result.data };
    } else {
      return { type: "err", errors: result.error.errors };
    }
  } catch (e) {
    return { type: "err", errors: [{ message: "Invalid JSON format" }] };
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
