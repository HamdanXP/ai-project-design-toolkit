export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://ai-project-design-toolkit-backend-production.up.railway.app/api/v1/";
export const REFLECTION_MAX_CHARS = parseInt(import.meta.env.VITE_REFLECTION_MAX_CHARS, 10) || 1200;
export const REFLECTION_MIN_CHARS = parseInt(import.meta.env.VITE_REFLECTION_MIN_CHARS, 10) || 150;