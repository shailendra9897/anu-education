import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

export async function POST(req: NextRequest) {
  try {
    const { phone, name } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "No phone provided" }, { status: 400 });
    }

    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: "college_students_demo_2026",
            language: { code: "en" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "image",
                    image: {
                      link: "https://www.anuedu.in/your-image.jpg"
                    }
                  }
                ]
              }
            ]
          }
        }),
      }
    );

    const data = await metaResponse.json();

    console.log("Meta response:", data);

    if (!metaResponse.ok) {
      return NextResponse.json(
        { error: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      meta: data
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}