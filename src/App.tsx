import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { FlameGraph } from "react-flame-graph";
import { z } from "zod";
import { sum } from "lodash";
import { useTable, useSortBy, Column } from "react-table";

const nodeSchema = z.object({
  name: z.string(),
  value: z.number(),
  tooltip: z.string().optional(),
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
  children: z.array(z.lazy(() => nodeSchema)),
});

type Node = z.infer<typeof nodeSchema>;

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

      {parsed.success ? (
        <>
          <FlameGraph data={parsed.data} height={400} width={1400} />
          <TopTable flameGraph={parsed.data} />
        </>
      ) : (
        <p style={{ color: "red", fontFamily: "monospace" }}>
          {JSON.stringify(parsed.error)}
        </p>
      )}
    </div>
  );
}

function TopTable(props: { flameGraph: Node }) {
  const rootValue = props.flameGraph.value;

  const flattened = useMemo(
    () => flatten(props.flameGraph),
    [props.flameGraph]
  );

  const columns = useMemo(() => {
    return [
      {
        Header: "Self",
        accessor: "self",
        Cell: (props: any) =>
          `${props.value} (${Math.round((props.value / rootValue) * 100)}%)`,
      },
      {
        Header: "Total",
        accessor: "total",
        Cell: (props: any) =>
          `${props.value} (${Math.round((props.value / rootValue) * 100)}%)`,
      },
      { Header: "Name", accessor: "name" },
    ];
  }, [props.flameGraph]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns: columns,
        data: flattened,
      },
      useSortBy
    );

  return (
    <table {...getTableProps()} style={{ border: "solid 1px black" }}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps(column.getSortByToggleProps())}
                style={{
                  borderBottom: "solid 3px red",
                  background: "aliceblue",
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                {column.render("Header")}
                {/* Add a sort direction indicator */}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td
                  {...cell.getCellProps()}
                  style={{
                    padding: "10px",
                    border: "solid 1px gray",
                  }}
                >
                  {cell.render("Cell")}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

type FlattenedNode = {
  name: string;
  self: number;
  total: number;
};

function flatten(node: Node): FlattenedNode[] {
  const out: FlattenedNode[] = [];
  recursiveFlatten(node, out);
  return out;
}

function recursiveFlatten(node: Node, out: FlattenedNode[]) {
  out.push({
    name: node.name,
    total: node.value,
    self: node.value - sum(node.children.map((child) => child.value)),
  });
  node.children.forEach((child) => recursiveFlatten(child, out));
}

function tryParse(json: string): z.SafeParseReturnType<string, Node> {
  try {
    return nodeSchema.safeParse(JSON.parse(json));
  } catch (e) {
    return { success: false, error: e };
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
