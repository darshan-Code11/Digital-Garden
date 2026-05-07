const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const oldLogic = `        // 🌿 STEP 1: Call Hugging Face ML model (PlantVillage trained) 🌿
        const HF_MODEL = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
        const hfHeaders = { 'Content-Type': 'application/octet-stream', 'Authorization': \`Bearer \${process.env.HF_API_KEY || ''}\` };

        let mlLabel = null;
        let mlScore = null;

        try {
            const hfRes = await fetch(\`https://router.huggingface.co/hf-inference/models/\${HF_MODEL}\`, {
                method: 'POST',
                headers: hfHeaders,
                body: imgBuffer
            });
            const hfData = await hfRes.json();
            console.log('🤖 HF ML result:', JSON.stringify(hfData).substring(0, 200));

            // HF returns array of {label, score} sorted by confidence
            if (Array.isArray(hfData) && hfData.length > 0 && hfData[0].label) {
                mlLabel = hfData[0].label;
                mlScore = Math.round(hfData[0].score * 100);
            } else if (hfData.error) {
                console.warn('HF API warning:', hfData.error);
            }
        } catch (hfErr) {
            console.warn('HF API call failed, falling back to Claude:', hfErr.message);
        }

        // 📚 STEP 2: Look up disease in our comprehensive database 📚
        if (mlLabel) {
            const dbKey = normalizeLabel(mlLabel);
            if (dbKey && PLANT_DISEASE_DB[dbKey]) {
                const info = PLANT_DISEASE_DB[dbKey];
                console.log(\`✅ ML identified: \${info.label} (\${mlScore}% confidence)\`);
                return res.json({
                    status: info.label,
                    healthy: info.healthy,
                    confidence: mlScore || info.confidence,
                    urgency: info.urgency,
                    urgencyLabel: info.urgencyLabel,
                    description: info.desc,
                    steps: info.steps,
                    alts: info.alts,
                    source: 'PlantVillage ML Model (MobileNetV2, 54K+ images)'
                });
            }
        }

        // 🤖 STEP 3: Fallback to Claude if HF failed or label not in DB 🤖
        console.log('🔄 Falling back to Claude API for:', mlLabel || 'unknown');
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            return res.json({
                status: mlLabel || 'Analysis Unavailable',
                healthy: false,
                confidence: mlScore || 50,
                urgency: 'med',
                urgencyLabel: '⚠️ Manual Assessment Needed',
                description: 'ML model detected an issue but database lookup failed. Please consult a local agricultural extension service.',
                steps: ['Take a clear close-up photo of affected area', 'Consult your local plant nursery or extension office', 'Remove visibly diseased plant material as a precaution'],
                alts: [],
                source: 'ML Model (database lookup failed)'
            });
        }

        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 800,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
                        {
                            type: 'text',
                            text: \`You are a plant pathologist with expertise in the PlantVillage dataset (38 disease classes). \${mlLabel ? \`A MobileNetV2 ML model pre-classified this as: "\${mlLabel}" with \${mlScore}% confidence.\` : ''} Analyze this leaf image and respond ONLY with a valid JSON object (no markdown):
{"status":"precise disease name","healthy":true/false,"confidence":85,"urgency":"low/med/high/critical","urgencyLabel":"✅ No Action Needed","description":"3-4 sentence scientific diagnosis","steps":["step1","step2","step3","step4"],"alts":[{"name":"Alternative Disease","pct":8}],"source":"Claude Vision + ML"}\`
                        }
                    ]
                }]
            })
        });
        const claudeData = await claudeRes.json();
        if (claudeData.error) throw new Error(claudeData.error.message);
        const text = claudeData.content[0].text.trim().replace(/\`\`\`json|\`\`\`/g, '').trim();
        return res.json(JSON.parse(text));`;

const newLogic = `        // 🤖 STEP 1: Try Claude Vision FIRST for highest accuracy across ALL plant species 🤖
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (anthropicKey) {
            console.log('🔄 Calling Claude Vision API for accurate diagnosis...');
            try {
                const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
                    body: JSON.stringify({
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 800,
                        messages: [{
                            role: 'user',
                            content: [
                                { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
                                {
                                    type: 'text',
                                    text: \`You are an expert plant pathologist. Analyze this leaf/plant image. Identify the exact plant species and any diseases, pests, or deficiencies present. If it is an Aloe Vera with black spots (Aloe Rust / Sooty Mold), correctly identify it. Respond ONLY with a valid JSON object (no markdown):
{"status":"[Plant Name] - [Precise Disease Name]","healthy":true/false,"confidence":95,"urgency":"low/med/high/critical","urgencyLabel":"⚠️ Treat Soon","description":"3-4 sentence scientific diagnosis explaining exactly what is wrong.","steps":["step1","step2","step3","step4"],"alts":[{"name":"Alternative Disease","pct":8}],"source":"Claude AI Vision"}\`
                                }
                            ]
                        }]
                    })
                });
                const claudeData = await claudeRes.json();
                if (claudeData.error) throw new Error(claudeData.error.message);
                const text = claudeData.content[0].text.trim().replace(/\`\`\`json|\`\`\`/g, '').trim();
                const parsed = JSON.parse(text);
                console.log('✅ Claude Vision succeeded:', parsed.status);
                return res.json(parsed);
            } catch (claudeErr) {
                console.warn('Claude API failed, falling back to ML model:', claudeErr.message);
            }
        }

        // 🌿 STEP 2: Fallback to Hugging Face ML model (PlantVillage trained - limited to 38 crops) 🌿
        const HF_MODEL = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
        const hfHeaders = { 'Content-Type': 'application/octet-stream', 'Authorization': \`Bearer \${process.env.HF_API_KEY || ''}\` };

        let mlLabel = null;
        let mlScore = null;

        try {
            const hfRes = await fetch(\`https://router.huggingface.co/hf-inference/models/\${HF_MODEL}\`, {
                method: 'POST',
                headers: hfHeaders,
                body: imgBuffer
            });
            const hfData = await hfRes.json();
            console.log('🤖 HF ML result:', JSON.stringify(hfData).substring(0, 200));

            // HF returns array of {label, score} sorted by confidence
            if (Array.isArray(hfData) && hfData.length > 0 && hfData[0].label) {
                mlLabel = hfData[0].label;
                mlScore = Math.round(hfData[0].score * 100);
            } else if (hfData.error) {
                console.warn('HF API warning:', hfData.error);
            }
        } catch (hfErr) {
            console.warn('HF API call failed:', hfErr.message);
        }

        // 📚 STEP 3: Look up disease in our comprehensive database 📚
        if (mlLabel) {
            const dbKey = normalizeLabel(mlLabel);
            if (dbKey && PLANT_DISEASE_DB[dbKey]) {
                const info = PLANT_DISEASE_DB[dbKey];
                return res.json({
                    status: info.label,
                    healthy: info.healthy,
                    confidence: mlScore || info.confidence,
                    urgency: info.urgency,
                    urgencyLabel: info.urgencyLabel,
                    description: info.desc,
                    steps: info.steps,
                    alts: info.alts,
                    source: 'PlantVillage ML Model (MobileNetV2, 54K+ images)'
                });
            }
        }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Successfully updated diagnose endpoint');
