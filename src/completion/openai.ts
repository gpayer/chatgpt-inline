/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import * as vscode from "vscode";

const systemMessage = `you are an automated tool. each prompt will contain code. you will only response with a completion of the code.`;

export async function openaiCompletion(
  codeSnippet: string
): Promise<string | undefined> {
  // TODO: set api key as a secret
  // get api key from vscode configuration
  const chatgptInlineConf = vscode.workspace.getConfiguration("chatgptInline");

  const apiKey = chatgptInlineConf.get<string | undefined>("apiKey");
  if (!apiKey) {
    vscode.window.showErrorMessage(
      "ChatGPT Inline: API key not set. Please set it in the configuration."
    );
    return undefined;
  }

  const model = chatgptInlineConf.get<string>("model") || "gpt-3.5-turbo";

  // call openai completion endpoint via fetch

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: codeSnippet },
        ],
        max_tokens: 64,
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(response);

    if (response.status === 200) {
      return response.data.choices[0].message.content;
    } else {
      vscode.window.showErrorMessage("ChatGPT Inline: OpenAI API call failed.");
      return undefined;
    }
  } catch (error) {
    console.log(error);
    vscode.window.showErrorMessage("ChatGPT Inline: OpenAI API call failed.");
    return undefined;
  }
}
