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
"[project]/src/lib/rag.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// RAG (Retrieval-Augmented Generation) - document processing and text extraction
__turbopack_context__.s([
    "clearVectorStore",
    ()=>clearVectorStore,
    "extractTextFromFile",
    ()=>extractTextFromFile,
    "processDocument",
    ()=>processDocument,
    "retrieveRelevantChunks",
    ()=>retrieveRelevantChunks
]);
const mockStore = [];
async function extractTextFromFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'txt' || ext === 'md') {
        return await file.text();
    }
    if (ext === 'pdf') {
        const { extractText } = await __turbopack_context__.A("[project]/node_modules/unpdf/dist/index.mjs [app-route] (ecmascript, async loader)");
        const arrayBuffer = await file.arrayBuffer();
        const { text } = await extractText(new Uint8Array(arrayBuffer), {
            mergePages: true
        });
        return text || '';
    }
    // doc, docx, xlsx - not fully supported
    if (ext === 'doc' || ext === 'docx' || ext === 'xlsx') {
        throw new Error(`File type .${ext} is not fully supported. Please use .txt, .md, or .pdf for best results.`);
    }
    return await file.text();
}
async function processDocument(file) {
    const text = await extractTextFromFile(file);
    const cleanedText = text.trim() || 'No readable content found in the document.';
    // Store chunks for RAG (simple sentence-based chunking)
    const sentences = cleanedText.split(/(?<=[.!?])\s+/).filter((s)=>s.trim().length > 20);
    const chunkSize = 3;
    for(let i = 0; i < sentences.length; i += chunkSize){
        const chunkText = sentences.slice(i, i + chunkSize).join(' ');
        mockStore.push({
            id: `${Date.now()}-${i}`,
            text: chunkText,
            metadata: {
                filename: file.name,
                index: i
            }
        });
    }
    if (mockStore.length === 0) {
        mockStore.push({
            id: Date.now().toString(),
            text: cleanedText,
            metadata: {
                filename: file.name
            }
        });
    }
    return {
        sessionId: 'session-' + Date.now(),
        extractedText: cleanedText
    };
}
function clearVectorStore() {
    mockStore.length = 0;
}
async function retrieveRelevantChunks(query, limit = 5) {
    if (mockStore.length === 0) {
        return [];
    }
    return mockStore.slice(0, limit);
}
}),
"[project]/src/app/api/quizzes/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No file provided'
            }, {
                status: 400
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clearVectorStore"])();
        const { sessionId, extractedText } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processDocument"])(file);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            sessionId,
            extractedText,
            message: 'Document processed successfully'
        });
    } catch (error) {
        console.error('Upload processing error details:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to process document',
            details: String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bceffe42._.js.map