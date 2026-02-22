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
"[project]/src/app/api/quizzes/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const MAX_CONTEXT_CHARS = 6000;
function truncateForContext(text) {
    if (text.length <= MAX_CONTEXT_CHARS) return text;
    return text.slice(0, MAX_CONTEXT_CHARS) + '\n\n[... обрезано ...]';
}
const API_KEY = process.env.GOOGLE_AI_API_KEY;
async function POST(req) {
    try {
        const { messages, documentText } = await req.json();
        if (!messages || !Array.isArray(messages)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Messages array is required'
            }, {
                status: 400
            });
        }
        let contextText = '';
        if (documentText && typeof documentText === 'string' && documentText.trim()) {
            contextText = documentText.trim();
        } else {
            const lastMessage = messages[messages.length - 1];
            const query = lastMessage?.content || '';
            const relevantChunks = await retrieveRelevantChunks(query, 5);
            contextText = relevantChunks.map((c)=>c.text).join('\n---\n');
        }
        if (!contextText) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No document context. Please upload and process a document first.'
            }, {
                status: 400
            });
        }
        contextText = truncateForContext(contextText);
        const systemPrompt = {
            role: 'system',
            content: `You are a helpful academic tutor assisting a student with a document.
            Use the following context to answer the student's questions. 
            If the answer is not in the context, say you don't find it in the document but try to answer from general knowledge if relevant (and mark it as general knowledge).
            
            CONTEXT:
            ${contextText}
            
            RULES:
            1. Be concise and clear.
            2. Use Markdown formatting.
            3. Maintain a professional, encouraging tone.`
        };
        const completion = await openai.chat.completions.create({
            model: 'gemini-1.5-flash',
            messages: [
                systemPrompt,
                ...messages
            ],
            stream: true
        });
        const stream = new ReadableStream({
            async start (controller) {
                try {
                    for await (const chunk of completion){
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                } catch (streamError) {
                    const err = streamError instanceof Error ? streamError : new Error(String(streamError));
                    const causeMsg = err.cause instanceof Error ? err.cause.message : '';
                    const msg = err.message + ' ' + causeMsg;
                    const fallback = msg.includes('Context size') || msg.includes('exceeded') ? '⚠️ Контекст превышен. Задайте более короткий вопрос.' : '⚠️ Ошибка. Попробуйте ещё раз.';
                    controller.enqueue(new TextEncoder().encode(fallback));
                } finally{
                    controller.close();
                }
            }
        });
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });
    } catch (error) {
        console.error('Document Chat error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to process chat'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e71c9f70._.js.map