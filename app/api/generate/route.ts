import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "abcd1234-replace-with-real-key",
  baseURL: process.env.BASE_URL_EDGE || 'https://api.groq.com',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const systemInstruction = `
      You are an expert technical tutor creating a highly structured concept map. Your logic must be flawless.
      
      CRITICAL TREE STRUCTURE RULES:
      1. STRICT 1-TO-MANY HIERARCHY: You are building a perfect Tree. Root -> Categories -> Specific Examples. 
      2. ONE PARENT ONLY: A child node can ONLY belong to ONE parent category. NEVER connect a leaf node (like a specific city, tool, or command) to multiple categories. Pick the single most relevant category and put it there.
      3. NO DEAD ENDS: Every category node MUST have at least two specific child nodes branching off it. If you cannot provide specific children for a category, DO NOT create that category.
      4. HIGH-VALUE LABELS: Edge labels must be exactly 2 to 4 words explaining the relationship (e.g., "major port city", "compiles down to"). Do NOT use generic words like "includes" or "example of".
      5. CONCRETE LEAVES: The lowest level of your tree must be tangible, real-world examples.
      6. SIZE: Generate between 15 and 25 nodes total.
      
      Return ONLY valid JSON in this exact format:
      {
        "nodes": [{"id": "1", "label": "Topic", "summary": "1-sentence summary"}],
        "edges": [{"id": "e1-2", "source": "1", "target": "2", "label": "max 4 words"}]
      }
    `;
    const userPrompt = `Topic: ${body.prompt}`;

    console.log("Generating for:", body.prompt);
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      reasoning_effort: 'medium',
      response_format: { type: 'json_object' } 
    });

    const responseText = chatCompletion.choices[0]?.message?.content; 
    
    if (!responseText) {
      throw new Error("No text returned from AI");
    }

    console.log("Cleaned AI Response:", responseText.substring(0, 50) + "..."); 

    const data = JSON.parse(responseText);
    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error("Server Error details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}