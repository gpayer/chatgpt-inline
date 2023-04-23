import * as vscode from "vscode";
import { openaiCompletion } from "./openai";

export const provideInlineCompletionItems = async (
  document: vscode.TextDocument,
  position: vscode.Position,
  context: vscode.InlineCompletionContext,
  token: vscode.CancellationToken
): Promise<
  vscode.InlineCompletionList | vscode.InlineCompletionItem[] | undefined
> => {
  const maxLines = 10; // TODO: get this from configuration

  const lineNumbers: number[] = [];
  const start = Math.max(0, position.line - maxLines);
  for (let i = start; i <= position.line; i++) {
    lineNumbers.push(i);
  }

  const lines = lineNumbers.map((lineNumber) => {
    return document.lineAt(lineNumber).text;
  });

  const codeSnippet = lines.join("\n");
  console.log("codeSnippet:", codeSnippet);

  // retrieve current line
  const currLine = document.lineAt(position.line).text;

  // create suggestion from completion api
  const suggestion = await openaiCompletion(codeSnippet);
  if (!suggestion) {
    return undefined;
  }
  console.log("suggestion:", suggestion);

  // create inline completion item
  const completionItem = new vscode.InlineCompletionItem(suggestion);

  // find out if a suffix of currLine is a prefix of suggestion
  // if so, set filterText to the suffix, else set it to currLine
  //   if (currLine) {
  //     completionItem.filterText =
  //       findNotCommonStart(currLine, suggestion) + suggestion;
  //   } else {
  //     completionItem.filterText = undefined;
  //   }
  const filterText = currLine ? currLine + suggestion : undefined;

  completionItem.range = new vscode.Range(
    new vscode.Position(position.line, 0),
    new vscode.Position(position.line, currLine.length || 1)
  );
  console.log(
    "completionItem:",
    completionItem,
    "replacement range: line",
    position.line,
    "from",
    0,
    "to",
    currLine.length
  );

  // return completion item
  return [completionItem];
};

// TODO: might not be necessary. anyways, unit tests are needed
function findNotCommonStart(currLine: string, suggestion: string): string {
  let filterText = currLine;

  // Check for suffix and prefix match
  for (let i = 1; i < currLine.length; i++) {
    if (suggestion.startsWith(currLine.substring(i))) {
      filterText = currLine.substring(0, i);
      break;
    }
  }

  return filterText;
}
