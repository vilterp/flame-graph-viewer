import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FlameGraph } from "react-flame-graph";

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
        <p style={{ color: "red" }}>Invalid JSON</p>
      ) : (
        <FlameGraph data={json} height={800} width={1000} />
      )}
    </div>
  );
}

function tryParse(json: string) {
  try {
    return { type: "ok", body: JSON.parse(json) };
  } catch (e) {
    return { type: "err" };
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
