import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { todos } = await request.json();

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      temperature: 0.8,
      n: 1,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "When responding, welcome user always as Mr.Artim and say welcome to AI Trello App! Limit the response to 200 characters",
        },
        {
          role: "user",
          content: `Hi there, provide a summary of the following Todos. Count how many todos are in each category such as To do, in progress and done, then tell the user to have a productive day! Here's the data: ${JSON.stringify(
            todos
          )}`,
        },
      ],
    });

    const { data } = response;

    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    console.error({ error });
  }
}
