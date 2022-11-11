import data from "../data/result.json";

import "./App.css";

function App() {
  return (
    <div>
      {data.map(([depName, uses], index) => (
        <div>
          <div>
            {depName}{" "}
            ({uses.reduce((acc, item) => {
              if (item.length === 3) return acc;
              return acc + item.length - 3;
            }, uses.length)} uses)
          </div>
          <div className="indent">
            {uses.map(([dep, version, ...apps]) => (
              <div>{`${dep}@${version} (${apps.join(", ")})`}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
