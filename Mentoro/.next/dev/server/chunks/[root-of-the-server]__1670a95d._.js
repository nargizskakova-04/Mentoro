module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/quizzes/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
;
;
const MAX_CONTEXT_CHARS = 6000;
function truncateForContext(text) {
    if (text.length <= MAX_CONTEXT_CHARS) return text;
    return text.slice(0, MAX_CONTEXT_CHARS) + '\n\n[... обрезано ...]';
}
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"]("AIzaSyBahf8utHGsO8sT7VrtHMGDbvQ8Qwr7Yc4");
async function POST(request) {
    try {
        const body = await request.json();
        const { type, documentText } = body; // 'explain' or 'quiz'
        if (!type || ![
            'explain',
            'quiz'
        ].includes(type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid generation type'
            }, {
                status: 400
            });
        }
        let contextText = '';
        if (documentText && typeof documentText === 'string' && documentText.trim()) {
            contextText = documentText.trim();
        } else {
            const query = type === 'explain' ? 'summary overview main points' : 'test questions key facts';
            const relevantChunks = await retrieveRelevantChunks(query, 5);
            contextText = relevantChunks.map((c)=>c.text).join('\n---\n');
        }
        if (!contextText) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No document content available. Please upload a document first.'
            }, {
                status: 400
            });
        }
        contextText = truncateForContext(contextText);
        let systemPrompt = '';
        let userPrompt = '';
        if (type === 'explain') {
            systemPrompt = `You are a study assistant. Your task is to explain and help people learn. Study the received data and explain what it is about. Also answer follow-up questions from the user. Use Markdown formatting for readability.`;
            userPrompt = `Study the following document and explain what it is about:\n\n${contextText}`;
        } else {
            systemPrompt = `You are a strict output generator. You must generate a JSON array of 15-20 multiple choice questions.

IMPORTANT: Questions must be about the SUBJECT MATTER and LEARNING CONTENT inside the document - test the student's understanding of the concepts, definitions, facts, and ideas presented in the text. Do NOT ask meta-questions about the document itself (e.g. "What format is this document?" or "How many sections does this have?").

The output must be a valid JSON array of objects. NO markdown, NO code blocks, just raw JSON.
Each object must have:
- "question": string (tests knowledge from the content)
- "options": array of 4 strings
- "correctAnswer": string (must match one of the options exactly)
- "explanation": string (brief explanation referring to the document content)

Example format:
[
    {"question": "According to the text, what is X?", "options": ["A", "B", "C", "D"], "correctAnswer": "B", "explanation": "The document states..."},
    {"question": "Which concept is defined as...?", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "explanation": "..."}
]`;
            userPrompt = `Generate 15-20 multiple choice questions that test understanding of the material in this document:\n\n${contextText}`;
        }
        const response = await openai.chat.completions.create({
            model: 'gemini-1.5-flash',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            stream: true,
            // Для генерации квиза (JSON) Gemini лучше работает с этим параметром:
            response_format: type === 'quiz' ? {
                type: 'json_object'
            } : undefined
        });
        const stream = new ReadableStream({
            async start (controller) {
                try {
                    for await (const chunk of response){
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                } catch (streamError) {
                    const err = streamError instanceof Error ? streamError : new Error(String(streamError));
                    const causeMsg = err.cause instanceof Error ? err.cause.message : '';
                    const msg = err.message + ' ' + causeMsg;
                    if (msg.includes('Context size') || msg.includes('context') || msg.includes('exceeded')) {
                        controller.enqueue(new TextEncoder().encode('\n\n⚠️ Документ слишком большой для модели. Попробуйте загрузить файл меньшего размера или использовать более короткий текст.'));
                    } else {
                        controller.enqueue(new TextEncoder().encode('\n\n⚠️ Ошибка при генерации. Попробуйте ещё раз.'));
                    }
                } finally{
                    controller.close();
                }
            }
        });
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](stream, {
            headers: {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked'
            }
        });
    } catch (error) {
        console.error('Generation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to generate content'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1670a95d._.js.map