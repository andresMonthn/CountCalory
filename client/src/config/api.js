// Centralized API Configuration
// Logic:
// 1. Prefer Environment Variable (VITE_API_URL) if explicitly set
// 2. If running in Production Mode (built), use the Render Production URL
// 3. Default to Localhost for development

const isProduction = import.meta.env.PROD; // Vite automatically sets this to true when building
const envApiUrl = import.meta.env.VITE_API_URL;

// Production URL for your Render backend
const PROD_URL = 'https://countcalory.onrender.com/api';

// Local Development URL
const DEV_URL = 'http://localhost:4000/api';

// Determine the final API URL
export const API_URL = envApiUrl || (isProduction ? PROD_URL : DEV_URL);

console.log(`🔌 API Configuration Loaded:
- Mode: ${isProduction ? 'Production' : 'Development'}
- API URL: ${API_URL}
`);
