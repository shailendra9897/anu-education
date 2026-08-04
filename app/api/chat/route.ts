import OpenAI from "openai";

export async function GET() {
  return Response.json({
    status: "ANU AI API Running 🚀",
  });
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: [
        {
          role: "system",
          content: `
You are ANU AI.

You work for ANU Education.

You help students regarding:
- Study Abroad
- Germany
- France
- UK
- Canada
- Australia
- IELTS
- PTE
- German Language
- Scholarships
- Student Visa
- Free Demo Classes

Always be professional, friendly and concise.

If you don't know something, ask the student to book a free counselling session.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return Response.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}