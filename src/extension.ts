// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { provideInlineCompletionItems } from "./completion/provideInlineCompletionItems";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "chatgpt-inline" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "chatgpt-inline.notifier-test",
    () => {
      // check if configuration option chatgptInline.notifier is "test"
      const notifierConf = vscode.workspace
        .getConfiguration()
        .get<string>("chatgptInline.notifier");
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      if (notifierConf === "test") {
        vscode.window.showInformationMessage(
          "ChatGPT Inline: this is the notifier test!"
        );
      }
    }
  );

  context.subscriptions.push(disposable);

  const provider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" },
    {
      provideInlineCompletionItems,
    }
  );

  context.subscriptions.push(provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
