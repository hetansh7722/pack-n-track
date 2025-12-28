export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Get data from the frontend
    const { city, days, prefs } = req.body;
    
    // 3. Get the API Key securely from Vercel Settings
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    // 4. Construct the Prompt (Backend logic)
    const systemPrompt = "You are a travel assistant API. Output JSON only. No markdown.";
    const userPrompt = `
        Plan a ${days}-day trip to ${city} for someone who likes ${prefs.join(', ')}.
        Return JSON with this exact structure: 
        { 
            "trip_name": "Title", 
            "center_lat": 0.0, 
            "center_lon": 0.0, 
            "days": [ 
                { "day": 1, "activities": [ {"name": "Place", "coords": [0.0, 0.0], "time": "9AM", "desc": "Info"} ] } 
            ] 
        }`;

    try {
        // 5. Call Groq API from the server
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error('Groq API Error');
        }

        const data = await response.json();
        const tripPlan = JSON.parse(data.choices[0].message.content);

        // 6. Send the clean JSON back to the frontend
        res.status(200).json(tripPlan);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}