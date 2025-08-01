
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';
import { healthCheckQuestions, documentTemplates } from '../../components/data';

// This is a server-side only file.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This function handles POST requests to the /api/generate endpoint.
export async function POST(req: Request) {
    try {
        const { type, payload } = await req.json();

        switch (type) {
            case 'riskAnalysis':
                return await handleRiskAnalysis(payload);
            case 'docGeneration':
                return await handleDocGeneration(payload);
            case 'contractReview':
                return await handleContractReview(payload);
            default:
                return new NextResponse(JSON.stringify({ error: 'Invalid generation type' }), { status: 400 });
        }
    } catch (error: any) {
        console.error(`API Error:`, error);
        return new NextResponse(JSON.stringify({ error: error.message || 'An unknown error occurred' }), { status: 500 });
    }
}


async function handleRiskAnalysis(payload: { answers: Record<string, string> }) {
    const { answers } = payload;
    
    const formattedAnswers = Object.entries(answers).map(([qid, ans]) => {
        const question = healthCheckQuestions.find(q => q.id === qid);
        const option = question?.options.find(o => o.value === ans);
        return `- ${question?.question}: ${option?.label}`;
    }).join('\n');

    const systemInstruction = `You are "Legally Legit AI", an expert legal risk analysis AI for Australian small businesses. Your task is to analyze a user's answers about their business and identify the top 5 legal risks. For each risk, you MUST provide:
1.  A short, descriptive 'title'.
2.  A 'severity' rating: "High", "Medium", "Low", or "Info".
3.  A 'description' in plain English, explaining the risk and its potential consequences.
4.  An 'areaForReview' sentence suggesting a practical step for the user to consider.
5.  A 'suggestedTemplate' field. If one of the available document templates can help mitigate the risk, provide its key (e.g., 'employmentContract'). If no template is relevant, this field MUST be null. Available templates keys are: ${Object.keys(documentTemplates).join(', ')}.

You MUST provide the output as a JSON object with two keys: "score" (an integer out of 100 representing overall legal health, where 100 is perfect) and "risks" (an array of the risk objects as described above).`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Here are my answers:\n${formattedAnswers}`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.INTEGER, description: "A score from 0-100." },
                    risks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                severity: { type: Type.STRING },
                                description: { type: Type.STRING },
                                areaForReview: { type: Type.STRING },
                                suggestedTemplate: { type: Type.STRING, nullable: true },
                            },
                            required: ["title", "severity", "description", "areaForReview", "suggestedTemplate"]
                        }
                    }
                },
                required: ["score", "risks"]
            },
        },
    });

    const jsonResponse = JSON.parse(response.text);
    return new NextResponse(JSON.stringify(jsonResponse), { status: 200 });
}

async function handleDocGeneration(payload: { templateKey: string; formData: Record<string, string> }) {
    const { templateKey, formData } = payload;
    const template = documentTemplates[templateKey];

    const prompt = `Generate a simple, plain-English "${template.name}" for an Australian small business.
    The document should be structured with clear headings.
    Use the following details:
    ${Object.entries(formData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
    
    IMPORTANT: For any details not provided, use a clearly marked placeholder like "[Your Company Address]" or "[Insert Clause Details Here]".
    Do not invent information. Structure the output as a single block of HTML with appropriate tags like <h2>, <h3>, <p>, <ul>, <li>. Do not include markdown like \`\`\`html.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    const generatedDoc = response.text.replace(/```html/g, '').replace(/```/g, '').trim();
    return new NextResponse(JSON.stringify({ generatedDoc }), { status: 200 });
}

async function handleContractReview(payload: { contractText: string }) {
    const { contractText } = payload;

    const systemInstruction = `You are an AI assistant for Australian small businesses. Your task is to review a legal contract and spot potential issues from the perspective of the business owner receiving the contract. Focus on clauses that are unfair, ambiguous, or risky. For each issue you find, you MUST provide:
    1.  A short, descriptive 'title'.
    2.  A 'riskLevel' rating: "High", "Medium", or "Low".
    3.  A simple 'explanation' of the issue in plain English.
    4.  A 'suggestion' for what the business owner should ask their lawyer about or propose as an amendment.
    
    Do not rewrite the contract or give legal advice. Your goal is to flag points for discussion with a professional. The output MUST be a JSON array of issue objects. If there are no major issues, return an empty array.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Please review the following contract:\n\n${contractText}`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        riskLevel: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        suggestion: { type: Type.STRING },
                    },
                    required: ["title", "riskLevel", "explanation", "suggestion"]
                }
            },
        },
    });

    const jsonResponse = JSON.parse(response.text);
    return new NextResponse(JSON.stringify(jsonResponse), { status: 200 });
}
