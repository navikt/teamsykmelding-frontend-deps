import git from "simple-git";
import fs from "node:fs/promises";
import path from "node:path";
import * as R from "remeda";

const GIT_ROOT = "/home/karl/git";
const REPOS = [
  "sykmeldinger",
  "dinesykmeldte",
  "syk-dig",
  "syfosmmanuell",
  "smregistrering",
];

async function main() {
  const repoDirs = await Promise.all(
    REPOS.map((it) => fs.readdir(path.join(GIT_ROOT, it)))
  );

  await Promise.all(
    REPOS.map(async (it) => {
      const gitPath = path.join(GIT_ROOT, it);

      const branch = (await git(gitPath).branch()).current;

      if (!(branch === "main" || branch === "master")) {
        throw new Error(`${it} is not on master/main (${branch})`);
      }
    })
  );

  const pkgJsons = await Promise.all(
    REPOS.map((it) =>
      fs
        .readFile(path.join(GIT_ROOT, it, "package.json"))
        .then((it) => JSON.parse(it))
    )
  );

  const grouped = R.pipe(
    pkgJsons,
    R.flatMap((it) =>
      R.pipe(
        [...R.toPairs(it.dependencies), ...R.toPairs(it.devDependencies)],
        R.map((pairs) => [...pairs, it.name])
      )
    ),
    R.groupBy((it) => it[0]),
    R.mapValues((it) => {
      if (it.length === 1) return it;
      return R.reduce(it, (acc, item) => {
        const index = acc.findIndex(itm => itm[0]+itm[1] === item[0]+item[1])
        if (index >= 0) {
          acc[index].push(item[2])
          return acc;
        }
        return [...acc, item];
      }, []);
    }),
    R.toPairs,
    R.sortBy((it) => it[1].length),
    R.reverse,
  );

  await fs.writeFile("./data/result.json", JSON.stringify(grouped, null, 2));
}

main();
