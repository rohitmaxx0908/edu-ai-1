
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Service to interact with the backend RAG (Retrieval-Augmented Generation) pipeline.
 */
export async function askAI(question: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/rag/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: question }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch AI response');
        }

        return await res.json();
    } catch (error) {
        console.error("Error calling RAG service:", error);
        throw error;
    }
}
