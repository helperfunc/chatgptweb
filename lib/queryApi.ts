import openai from "./chatgpt";

const API_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_CHAT_MODEL = 'gpt-3.5-turbo'

import {
    createParser,
    ParsedEvent,
    ReconnectInterval,
} from "eventsource-parser";

export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}


export async function OpenAIStream(payload: OpenAIStreamPayload) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
  
    let counter = 0;
  
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });
  
    const stream = new ReadableStream({
      async start(controller) {
        // callback
        function onParse(event: ParsedEvent | ReconnectInterval) {
          if (event.type === "event") {
            const data = event.data;
            // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content || "";
              if (counter < 2 && (text.match(/\n/) || []).length) {
                // this is a prefix character (i.e., "\n\n"), do nothing
                return;
              }
              const queue = encoder.encode(text);
              controller.enqueue(queue);
              counter++;
            } catch (e) {
              // maybe parse error
              controller.error(e);
            }
          }
        }
  
        // stream response (SSE) from OpenAI may be fragmented into multiple chunks
        // this ensures we properly read chunks and invoke an event for each SSE event stream
        const parser = createParser(onParse);
        // https://web.dev/streams/#asynchronous-iteration
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });
  
    return stream;
}


const query = async (prompt: any, chatId: string, model: string) => {
    let res;
    if (model.startsWith('gpt-3.5-turbo')) {
        res = await OpenAIStream({
            model: model, 
            messages: prompt,
            temperature: 0.9,
            top_p: 1,
            max_tokens: 1000,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: true,
            n: 1,
        }).then(res => new Response(res)).catch(
            (err) => {
                `ChatGPT was unable to find an answer for that! (Error: ${err.message})`
            }
        );
    } else {
        res = await openai.createCompletion({
            model, 
            prompt,
            temperature: 0.9,
            top_p: 1,
            max_tokens: 1000,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).then(res => res.data.choices[0].text).catch(
            (err) => {
                `ChatGPT was unable to find an answer for that! (Error: ${err.message})`
            }
        );
    }
    return res;
};

// const query = async (prompt: any, chatId: string, model: string) => {
//     let res;
//     if (model.startsWith('gpt-3.5-turbo')) {
//         res = await openai.createChatCompletion({
//             model, 
//             messages: prompt,
//             temperature: 0.9,
//             top_p: 1,
//             max_tokens: 1000,
//             frequency_penalty: 0,
//             presence_penalty: 0,
//         }).then(res => res.data.choices[0].message?.content).catch(
//             (err) => {
//                 `ChatGPT was unable to find an answer for that! (Error: ${err.message})`
//             }
//         );
//     } else {
//         res = await openai.createCompletion({
//             model, 
//             prompt,
//             temperature: 0.9,
//             top_p: 1,
//             max_tokens: 1000,
//             frequency_penalty: 0,
//             presence_penalty: 0,
//         }).then(res => res.data.choices[0].text).catch(
//             (err) => {
//                 `ChatGPT was unable to find an answer for that! (Error: ${err.message})`
//             }
//         );
//     }
//     return res;
// };



export default query;


