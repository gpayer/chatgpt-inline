import * as vscode from "vscode";
import { openaiCompletion } from "./openai";

let debounceTime = 0;

export const provideInlineCompletionItems = async (
  document: vscode.TextDocument,
  position: vscode.Position,
  context: vscode.InlineCompletionContext,
  token: vscode.CancellationToken
): Promise<
  vscode.InlineCompletionList | vscode.InlineCompletionItem[] | undefined
> => {
  // if debounce time is not reached, wait until it is reached or token.isCancellationRequested triggered
  if (debounceTime > 0) {
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, debounceTime);
      token.onCancellationRequested(() => {
        clearTimeout(timeout);
        resolve(undefined);
      });
      debounceTime = 0;
    });
  }

  debounceTime = 1000;

  const maxLines = 30; // TODO: get this from configuration

  const lineNumbers: number[] = [];
  const start = Math.max(0, position.line - maxLines);
  for (let i = start; i <= position.line; i++) {
    lineNumbers.push(i);
  }

  const lines = lineNumbers.map((lineNumber) => {
    return document.lineAt(lineNumber).text;
  });

  const codeSnippet = lines.join("\n");
  // console.log("====================================");
  // console.log("codeSnippet:", codeSnippet);

  // retrieve current line
  const currLine = document.lineAt(position.line).text;
  console.log("currLine:", currLine);

  // create suggestion from completion api
  let suggestion = "";
  const runTime = await new Promise<number>((resolve) => {
    const start = Date.now();
    openaiCompletion(codeSnippet).then((sugg) => {
      suggestion = sugg || "";
      suggestion = suggestion.split("\n")[0];
      resolve(Date.now() - start);
    });
  });
  debounceTime -= runTime;
  if (debounceTime < 0) {
    debounceTime = 0;
  }
  console.log("runTime:", runTime, "ms");
  if (!suggestion) {
    return undefined;
  }
  console.log("suggestion:", suggestion);

  // create inline completion item
  const completionItem = new vscode.InlineCompletionItem(suggestion);

  // find out if a suffix of currLine is a prefix of suggestion
  // if so, set filterText to the suffix, else set it to currLine
  if (currLine) {
    completionItem.filterText =
      findNotCommonStart(currLine, suggestion) + suggestion;
  } else {
    completionItem.filterText = undefined;
  }
  // const filterText = currLine ? currLine + suggestion : undefined;
  // completionItem.filterText = filterText;
  console.log(
    "filterText:",
    completionItem.filterText,
    "insertText:",
    completionItem.insertText
  );

  // completionItem.range = completionItem.filterText
  //   ? new vscode.Range(
  //       new vscode.Position(position.line, 0),
  //       new vscode.Position(position.line, completionItem.filterText.length)
  //     )
  //   : undefined;

  console.log(
    "completionItem:",
    completionItem,
    "replacement range: line",
    position.line,
    "from",
    completionItem.range?.start.character,
    "to",
    completionItem.range?.end.character
  );

  if (token.isCancellationRequested) {
    return undefined;
  }

  // return completion item
  return [completionItem];
};

export function findNotCommonStart(
  currLine: string,
  suggestion: string
): string {
  let filterText = currLine;

  // Check for suffix and prefix match
  for (let i = 0; i < currLine.length; i++) {
    if (suggestion.startsWith(currLine.substring(i))) {
      filterText = currLine.substring(0, i);
      break;
    }
  }

  return filterText;
}
