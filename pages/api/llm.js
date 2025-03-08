export default async function handler(req, res) {
    // Basic security: Check for a secret key in the request
    const secret = req.headers['x-api-secret'];
    if (secret !== process.env.API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const response = await fetch(`${process.env.LLM_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral', prompt: req.body.prompt }),
      });
  
      if (!response.ok) {
        throw new Error('LLM API request failed');
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }