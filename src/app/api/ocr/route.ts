import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: "Convert the content of this document image into GitHub Flavored Markdown format. Maintain the original structure and formatting as closely as possible. Include all text, tables, headings like and lists. Use appropriate Markdown syntax for headers, tables, and bullet points. Do not add any additional commentary or description outside of the document's content."
            },
            {
              type: 'image_url',
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      model: 'llama-3.2-11b-vision-preview',
      temperature: 0.2,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    });
    const result = chatCompletion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Error processing image' }, { status: 500 });
  }
}