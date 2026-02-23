import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.BASE_URL_EDGE || 'https://api.groq.com', 
});

export async function POST(req: Request) {
  try {
    const { topic, nodeLabel } = await req.json();

    const systemInstruction = `
      You are an expert technical tutor. A user is learning about "${topic}".
      They asked for a detailed, highly technical deep-dive into the specific sub-concept: "${nodeLabel}".
      
      Provide a clear, highly informative explanation.
      
      RULES:
      1. Keep it strictly under 3 short paragraphs.
      2. Use bullet points for key technical facts.
      3. BE CONCRETE. Give real-world examples, specific commands, or exact historical/technical facts. Do not be vague.
      4. Format with standard bold/italic markdown. Do NOT use markdown code blocks (like \`\`\`html).
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Explain ${nodeLabel} in the context of ${topic}` }
      ],
      model: 'openai/gpt-oss-120b', 
      temperature: 0.2, 
      reasoning_effort: 'medium', 
    });

    const responseText = chatCompletion.choices[0]?.message?.content;

    if (!responseText) throw new Error("No text returned");

    return NextResponse.json({ explanation: responseText });

  } catch (error) {
    console.error("Explanation Error:", error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}