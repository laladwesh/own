// Splits a command line into a sequence of pipelines:
//   cat Dockerfile | grep docker && ls ; pwd
// -> [{ join: "start", stages: [["cat","Dockerfile"],["grep","docker"]] },
//     { join: "&&",    stages: [["ls"]] },
//     { join: ";",     stages: [["pwd"]] }]
export const parseLine = (line) => {
  const seq = [];
  let join = "start";
  let stages = [];
  let argv = [];
  let word = "";
  let quote = null;
  let has = false;

  const endWord = () => {
    if (has) argv.push(word);
    word = "";
    has = false;
  };
  const endStage = () => {
    endWord();
    if (argv.length) stages.push(argv);
    argv = [];
  };
  const endPipeline = (nextJoin) => {
    endStage();
    if (stages.length) seq.push({ join, stages });
    stages = [];
    join = nextJoin;
  };

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
      else word += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      has = true;
    } else if (/\s/.test(c)) {
      endWord();
    } else if (c === "|") {
      endStage();
    } else if (c === ";") {
      endPipeline(";");
    } else if (c === "&" && line[i + 1] === "&") {
      endPipeline("&&");
      i += 1;
    } else {
      word += c;
      has = true;
    }
  }
  endPipeline(";");
  return seq;
};

// Quote-aware tokens of one command (kept for completion).
export const tokenize = (line) => {
  const first = parseLine(line)[0];
  return first ? first.stages[first.stages.length - 1] : [];
};
