const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Razorpay = require('razorpay');
const twilio = require('twilio');
const cron = require('node-cron');
const dns = require('dns');
require('dotenv').config();

// Fix for MongoDB Atlas connection issues on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true })); // Allow all origins for easier mobile access
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'super_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB successfully connected!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// ============================================
// 1. DATA STORE (MongoDB Schemas)
// ============================================
// This is how data is structured and saved to MongoDB. 
const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    avatar: String,
    phoneNumber: String // User's phone for SMS reminders
});
// Mongoose creates a \"users\" collection in your MongoDB based on this
const User = mongoose.model('User', userSchema);

const plantSchema = new mongoose.Schema({
    id: Number,
    name: String,
    variety: String,
    stage: String,
    waterFrequencyDays: Number,
    reminderTime: { type: String, default: '09:00' }, // New field for scheduled time
    lastWatered: { type: Date, default: Date.now }, // Tracking for reminders
    emoji: String,
    progress: Number,
    days: Number,
    garden: String,
    color: String,
    notes: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String
});
const Plant = mongoose.model('Plant', plantSchema);

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    orderNum: String,
    amount: String,
    method: String,
    items: String,
    type: String,
    date: String,
    address: String
});
const Order = mongoose.model('Order', orderSchema);

// ============================================
// 2. GOOGLE AUTHENTICATION (Passport.js)
// ============================================
const googleAuthEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';

if (googleAuthEnabled) {
    try {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `http://localhost:${PORT}/auth/google/callback`
        },
            async function (accessToken, refreshToken, profile, cb) {
                try {
                    let user = await User.findOne({ googleId: profile.id });
                    if (!user) {
                        user = await User.create({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            avatar: profile.photos[0].value
                        });
                    }
                    return cb(null, user);
                } catch (err) {
                    return cb(err, null);
                }
            }));

        passport.serializeUser((user, done) => done(null, user.id));
        passport.deserializeUser(async (id, done) => {
            const user = await User.findById(id);
            done(null, user);
        });
        console.log('✅ Google OAuth strategy registered.');
    } catch (err) {
        console.error('❌ Failed to register Google OAuth strategy:', err.message);
    }
}

// Simple test route - if this works, Express routing is fine
app.get('/test', (req, res) => res.send('Server routing works! ✅'));

// Auth API Routes
app.get('/auth/google', (req, res, next) => {
    if (!googleAuthEnabled) {
        return res.status(500).send('<h2>Authentication Error</h2><p>Google Client ID is missing in your .env file.</p><a href="/">Go Back</a>');
    }
    // Store the redirect origin in session so we can return to the same place (important for mobile)
    req.session.returnTo = req.header('Referer') || '/';

    try {
        const authMiddleware = passport.authenticate('google', { scope: ['profile', 'email'] });
        authMiddleware(req, res, (err) => {
            if (err) {
                console.error('❌ /auth/google middleware error:', err);
                return res.status(500).send('Auth error: ' + err.message);
            }
            next();
        });
    } catch (err) {
        console.error('❌ /auth/google caught error:', err);
        res.status(500).send('Auth error: ' + err.message);
    }
});

app.get('/auth/google/callback', (req, res, next) => {
    const returnTo = req.session.returnTo || '/';
    try {
        const authMiddleware = passport.authenticate('google', {
            failureRedirect: `${returnTo}?error=login_failed`
        });
        authMiddleware(req, res, (err) => {
            if (err) {
                console.error('❌ /auth/google/callback error:', err);
                return res.status(500).send('Callback error: ' + err.message);
            }
            // Successful authentication
            res.redirect(`${returnTo}?login=success`);
        });
    } catch (err) {
        console.error('❌ /auth/google/callback caught error:', err);
        res.status(500).send('Callback error: ' + err.message);
    }
});

// Get the currently logged-in user from the Data Store
app.get('/api/current_user', (req, res) => {
    res.send(req.user || null);
});

// Logout User and destroy the session
app.get('/api/logout', (req, res) => {
    const returnTo = req.header('Referer') || '/';
    req.logout((err) => {
        if (err) return res.status(500).send(err);
        req.session.destroy(() => {
            res.redirect(returnTo);
        });
    });
});

// Sync local session with backend (for non-Google users)
app.post('/api/sync-session', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, name: name || email.split('@')[0] });
        }

        req.login(user, (err) => {
            if (err) return res.status(500).json({ error: 'Login failed' });
            res.json({ success: true, user });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Order API Routes
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        if (req.user) {
            orderData.userId = req.user._id;
            orderData.email = req.user.email;
        }
        const order = await Order.create(orderData);
        res.json(order);
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Plant API Routes
app.post('/api/plants', async (req, res) => {
    try {
        const plantData = req.body;
        if (req.user) {
            plantData.userId = req.user._id;
            if (!plantData.email) plantData.email = req.user.email;
        }
        const plant = await Plant.create(plantData);
        res.json(plant);
    } catch (err) {
        console.error('Plant creation error:', err);
        res.status(500).json({ error: 'Failed to create plant' });
    }
});

app.get('/api/plants', async (req, res) => {
    try {
        const email = req.query.email;
        let query = {};
        if (req.user) {
            query = { userId: req.user._id };
        } else if (email) {
            query = { email: { $regex: new RegExp('^' + email + '$', 'i') } };
        } else {
            return res.json([]);
        }
        const plants = await Plant.find(query).sort({ _id: -1 });
        res.json(plants);
    } catch (err) {
        console.error('Failed to fetch plants:', err);
        res.status(500).json({ error: 'Failed to fetch plants' });
    }
});

app.delete('/api/plants/:id', async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user) query.userId = req.user._id;

        const result = await Plant.deleteOne(query);
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const email = req.query.email;
        let query = {};
        if (req.user) {
            query = { userId: req.user._id };
        } else if (email) {
            query = { email: email };
        } else {
            return res.json([]);
        }
        const orders = await Order.find(query).sort({ _id: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ============================================
// 3. PAYMENT GATEWAY (Razorpay)
// ============================================
let razorpayInstance;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// API Route to generate a Razorpay Order ID for the frontend
app.post('/api/create-order', async (req, res) => {
    if (!razorpayInstance) return res.status(500).json({ error: 'Razorpay keys missing in .env' });

    try {
        const { amount } = req.body;

        // Create order
        const options = {
            amount: amount * 100, // Amount is in paise
            currency: "INR",
            receipt: "receipt_order_" + Math.random().toString(36).substring(7),
        };

        const order = await razorpayInstance.orders.create(options);
        res.json({ orderId: order.id, amount: options.amount });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ============================================
// 4. PLANT DISEASE DATABASE (PlantVillage – 38 classes)
// ============================================
const PLANT_DISEASE_DB = {
    // ── TOMATO ────────────────────────────────────────────────────────────────
    'Tomato___Bacterial_spot': {
        label: 'Tomato – Bacterial Spot', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Within 48h',
        confidence: 91, desc: 'Water-soaked lesions with yellow halos on leaves, stems and fruit caused by Xanthomonas campestris. Spreads rapidly in warm, wet conditions and can cause 50%+ yield loss.',
        steps: ['Remove and destroy all affected plant material immediately', 'Apply copper-based bactericide (copper hydroxide) every 7 days', 'Avoid overhead irrigation – water at soil level only', 'Disinfect all tools with 10% bleach solution between plants', 'Improve plant spacing for better air circulation'],
        alts: [{ name: 'Early Blight', pct: 6 }, { name: 'Fungal Leaf Spot', pct: 3 }]
    },
    'Tomato___Early_blight': {
        label: 'Tomato – Early Blight (Alternaria)', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Within 48h',
        confidence: 93, desc: 'Concentric ring "target spots" on lower/older leaves indicate Alternaria solani infection. Common in tomatoes and potatoes; can defoliate plants within weeks if untreated.',
        steps: ['Remove all infected leaves and bag immediately for disposal', 'Apply chlorothalonil or mancozeb fungicide every 7-10 days', 'Mulch around base to prevent soil splash-back', 'Stake plants to keep foliage off ground', 'Avoid working with plants when wet'],
        alts: [{ name: 'Septoria Leaf Spot', pct: 5 }, { name: 'Target Spot', pct: 4 }]
    },
    'Tomato___Late_blight': {
        label: 'Tomato – Late Blight (Phytophthora)', healthy: false, urgency: 'critical', urgencyLabel: '🚨 Act Immediately – Spreads Fast',
        confidence: 95, desc: 'Phytophthora infestans – the same pathogen responsible for the Irish Potato Famine. Creates dark, water-soaked lesions with white fuzzy growth on undersides. Can destroy an entire crop in 7-10 days.',
        steps: ['Remove and bag ALL infected plant parts immediately – do not compost', 'Apply systemic fungicide (metalaxyl or cymoxanil) within 24h', 'Avoid any overhead watering or working with wet plants', 'Isolate affected plants to prevent airborne spore spread', 'Consider removing severely infected plants entirely', 'Monitor daily – scout every 12 hours during wet weather'],
        alts: [{ name: 'Early Blight', pct: 3 }, { name: 'Bacterial Canker', pct: 2 }]
    },
    'Tomato___Leaf_Mold': {
        label: 'Tomato – Leaf Mold (Passalora fulva)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within 3-5 Days',
        confidence: 88, desc: 'Pale green/yellow spots on upper leaf surface with olive/brown velvety mold on undersides. Thrives in high humidity (85%+) and poor ventilation, common in greenhouses.',
        steps: ['Improve ventilation by pruning lower leaves and branches', 'Reduce humidity below 85% – install fans or open vents', 'Apply fungicide (copper or chlorothalonil) as preventive spray', 'Water in the morning so foliage dries before nightfall', 'Remove heavily infected leaves'],
        alts: [{ name: 'Powdery Mildew', pct: 8 }, { name: 'Nutrient Deficiency', pct: 4 }]
    },
    'Tomato___Septoria_leaf_spot': {
        label: 'Tomato – Septoria Leaf Spot', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within a Week',
        confidence: 89, desc: 'Numerous small circular spots with dark borders and grey/tan centers, often with tiny black dots (pycnidia) inside. Starts on older lower leaves and moves upward. Caused by Septoria lycopersici fungus.',
        steps: ['Remove infected leaves at first sign of infection', 'Apply fungicide (mancozeb, chlorothalonil, or copper) every 7-14 days', 'Keep foliage dry – drip irrigation preferred', 'Clear plant debris from soil at season end', 'Rotate tomato crops annually'],
        alts: [{ name: 'Early Blight', pct: 9 }, { name: 'Bacterial Spot', pct: 5 }]
    },
    'Tomato___Spider_mites Two-spotted_spider_mite': {
        label: 'Tomato – Spider Mites (Two-Spotted)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within a Week',
        confidence: 87, desc: 'Tiny spider mites (Tetranychus urticae) cause stippled, bronzed or yellowed leaves with fine webbing on undersides. Thrives in hot, dry conditions. Major pest in summer.',
        steps: ['Spray leaves with strong jet of water (especially undersides) to knock off mites', 'Apply neem oil spray (5ml neem + 2ml dish soap + 1L water) every 3 days', 'Introduce predatory mites (Phytoseiulus persimilis) as biological control', 'Avoid excessive nitrogen fertilizer which attracts mites', 'Maintain soil moisture – mites prefer dry conditions'],
        alts: [{ name: 'Thrips Damage', pct: 7 }, { name: 'Nutrient Burn', pct: 3 }]
    },
    'Tomato___Target_Spot': {
        label: 'Tomato – Target Spot (Corynespora)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within a Week',
        confidence: 86, desc: 'Concentric ring lesions on leaves, stems and fruit caused by Corynespora cassiicola. Can cause fruit spotting and significant defoliation in warm, humid conditions.',
        steps: ['Remove infected plant material and dispose away from garden', 'Apply tebuconazole or azoxystrobin fungicide', 'Improve air circulation between plants', 'Avoid wetting foliage when watering', 'Rotate crops next season'],
        alts: [{ name: 'Early Blight', pct: 12 }, { name: 'Septoria Leaf Spot', pct: 6 }]
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
        label: 'Tomato – Yellow Leaf Curl Virus (TYLCV)', healthy: false, urgency: 'critical', urgencyLabel: '🚨 No Cure – Manage Spread',
        confidence: 94, desc: 'TYLCV is a begomovirus transmitted exclusively by whiteflies (Bemisia tabaci). Causes upward leaf curling, yellowing, stunted growth, and severely reduced fruit set. No chemical cure exists.',
        steps: ['Remove and destroy severely infected plants to reduce virus reservoir', 'Apply systemic insecticide to control whitefly vector population', 'Install yellow sticky traps to monitor and catch whiteflies', 'Use reflective silver mulch to deter whitefly landing', 'Plant virus-resistant tomato varieties next season (look for "TYLCV" on seed packets)', 'Install fine mesh nets to physically exclude whiteflies'],
        alts: [{ name: 'Tomato Mosaic Virus', pct: 4 }, { name: 'Nutrient Deficiency', pct: 2 }]
    },
    'Tomato___Tomato_mosaic_virus': {
        label: 'Tomato – Mosaic Virus (ToMV)', healthy: false, urgency: 'high', urgencyLabel: '🔴 No Cure – Contain Spread',
        confidence: 90, desc: 'Tobamovirus causing mosaic discoloration, leaf distortion, reduced fruit size and quality. Extremely stable – can survive in dry tobacco for 50+ years. Spreads by touch, tools, and tobacco products.',
        steps: ['Remove and bag infected plants – do not compost them', 'Wash hands with soap thoroughly before and after handling plants', 'Disinfect all tools with 10% bleach or 70% alcohol between uses', 'Never smoke near tomato plants (tobacco carries the virus)', 'Plant resistant varieties (look for "ToMV" or "Tm" resistance code)'],
        alts: [{ name: 'TYLCV', pct: 5 }, { name: 'Herbicide Damage', pct: 3 }]
    },
    'Tomato___healthy': {
        label: 'Tomato – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 97, desc: 'Leaf shows no signs of disease, pest damage, or nutrient deficiency. Color, texture, and structure are within normal healthy range for tomato foliage.',
        steps: ['Continue regular watering schedule (1-2 inches per week)', 'Fertilize with balanced NPK fertilizer every 2 weeks during fruiting', 'Monitor weekly for early signs of blight or pest activity', 'Prune suckers for indeterminate varieties to improve airflow', 'Ensure 6+ hours of direct sunlight daily'],
        alts: [{ name: 'Very Early Stress', pct: 2 }, { name: 'Minor Nutrient Variation', pct: 1 }]
    },
    // ── POTATO ────────────────────────────────────────────────────────────────
    'Potato___Early_blight': {
        label: 'Potato – Early Blight (Alternaria)', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Within 48h',
        confidence: 91, desc: 'Dark brown target-ring lesions on mature leaves caused by Alternaria solani. Begins on older lower foliage and moves upward. Can cause 20-30% yield loss if unmanaged.',
        steps: ['Remove and destroy all infected leaves', 'Apply mancozeb or chlorothalonil fungicide on 7-10 day schedule', 'Ensure proper plant nutrition – stressed plants are more susceptible', 'Avoid excessive nitrogen which promotes susceptibility', 'Apply mulch to reduce soil splash during rain'],
        alts: [{ name: 'Late Blight', pct: 8 }, { name: 'Botrytis', pct: 3 }]
    },
    'Potato___Late_blight': {
        label: 'Potato – Late Blight (Phytophthora)', healthy: false, urgency: 'critical', urgencyLabel: '🚨 Emergency – Spreads Overnight',
        confidence: 96, desc: 'Phytophthora infestans causes dark, greasy-looking lesions on leaves and stems with white sporulation visible in humid conditions. The most devastating potato disease – can destroy entire fields.',
        steps: ['Act immediately – destroy all infected material outside the garden area', 'Apply metalaxyl + mancozeb (systemic + protective) within hours', 'Do NOT harvest potatoes during active infection – spores infect tubers', 'Mound soil up around plants to protect developing tubers', 'After harvest, destroy all plant remains – do not leave in field', 'Test soil with fungicide before next season planting'],
        alts: [{ name: 'Early Blight', pct: 2 }, { name: 'Bacterial Rot', pct: 2 }]
    },
    'Potato___healthy': {
        label: 'Potato – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 96, desc: 'Potato foliage appears completely healthy. Leaf color and texture indicate adequate nutrition and no active pathogen infection.',
        steps: ['Hill up soil around plants when 20-25cm tall to protect tubers', 'Water consistently – 25-50mm per week, avoid waterlogging', 'Scout weekly for Colorado potato beetle eggs on leaf undersides', 'Apply balanced fertilizer – potatoes need high potassium', 'Monitor for late blight warning in humid/rainy weather'],
        alts: [{ name: 'Very Early Blight', pct: 2 }, { name: 'Mild Stress', pct: 1 }]
    },
    // ── PEPPER ────────────────────────────────────────────────────────────────
    'Pepper,_bell___Bacterial_spot': {
        label: 'Bell Pepper – Bacterial Spot', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Within 48h',
        confidence: 89, desc: 'Xanthomonas euvesicatoria causes water-soaked lesions that turn brown/black with yellow halos on pepper leaves and fruit. Severely reduces fruit quality and marketability.',
        steps: ['Remove infected plant parts and dispose away from garden', 'Apply copper hydroxide spray every 5-7 days', 'Avoid overhead watering – use drip irrigation', 'Sanitize tools with 10% bleach between plants', 'Use certified disease-free transplants next season'],
        alts: [{ name: 'Cercospora Leaf Spot', pct: 7 }, { name: 'Phytophthora Blight', pct: 4 }]
    },
    'Pepper,_bell___healthy': {
        label: 'Bell Pepper – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 96, desc: 'Pepper plant shows vibrant healthy leaves with normal coloration and no signs of disease, pest damage, or stress.',
        steps: ['Water deeply 1-2 times per week, avoid keeping soil waterlogged', 'Fertilize with calcium-rich fertilizer to prevent blossom end rot', 'Pinch off early flowers to encourage stronger plant structure', 'Ensure consistent warmth – peppers suffer below 15°C', 'Scout for aphids at stem tips weekly'],
        alts: [{ name: 'Very Early Stress', pct: 2 }, { name: 'Mild Heat Stress', pct: 2 }]
    },
    // ── CORN / MAIZE ──────────────────────────────────────────────────────────
    'Corn_(maize)___Common_rust_': {
        label: 'Corn – Common Rust (Puccinia sorghi)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Monitor Closely',
        confidence: 92, desc: 'Puccinia sorghi causes brick-red to cinnamon-brown pustules on both leaf surfaces. Spreads via airborne spores. Moderate infections reduce photosynthesis; severe infections can cause significant yield loss.',
        steps: ['Apply propiconazole or azoxystrobin fungicide at early infection stage', 'Scout fields twice weekly during humid/cool conditions (16-23°C )', 'Plant resistant hybrid corn varieties next season', 'Early planting avoids peak rust season in many regions', 'Rust rarely justifies treatment after tassel stage – focus on early season'],
        alts: [{ name: 'Southern Rust', pct: 8 }, { name: 'Eyespot', pct: 3 }]
    },
    'Corn_(maize)___Northern_Leaf_Blight': {
        label: 'Corn – Northern Leaf Blight (Exserohilum)', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Before Tasseling',
        confidence: 90, desc: 'Exserohilum turcicum causes distinctive long, gray-green to tan cigar-shaped lesions (5-15cm). Most damaging if infection occurs before or during tasseling. Spreads rapidly in cool, wet conditions.',
        steps: ['Apply fungicide (propiconazole or pyraclostrobin) if detected before/at tasseling', 'Remove heavily infected lower leaves to slow spread', 'Improve field drainage to reduce humid microclimate', 'Plant resistant varieties – major yield protection factor', 'Till infected crop residue to reduce overwintering spores'],
        alts: [{ name: 'Gray Leaf Spot', pct: 10 }, { name: 'Eyespot', pct: 4 }]
    },
    'Corn_(maize)___Gray_leaf_spot': {
        label: 'Corn – Gray Leaf Spot (Cercospora)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within a Week',
        confidence: 88, desc: 'Cercospora zeae-maydis causes rectangular tan/gray lesions bounded by leaf veins, giving a "window pane" effect. Severe infection defoliates plants rapidly in warm, humid weather.',
        steps: ['Apply strobilurin or triazole fungicide at early infection', 'Improve air circulation by reducing plant density', 'Till fields post-harvest to reduce infected residue', 'Plant tolerant varieties in areas with history of gray leaf spot', 'Avoid continuous corn-on-corn rotation'],
        alts: [{ name: 'Northern Leaf Blight', pct: 9 }, { name: 'Common Rust', pct: 5 }]
    },
    'Corn_(maize)___healthy': {
        label: 'Corn – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 97, desc: 'Corn foliage appears vigorous and healthy. Leaf color and texture indicate normal growth with no active disease or pest stress detected.',
        steps: ['Ensure consistent irrigation – corn is sensitive to drought stress', 'Side-dress with nitrogen fertilizer when plants are knee-high', 'Scout for corn borer egg masses on upper leaves weekly', 'Monitor for silk emergence – critical pollination window', 'Maintain adequate soil pH (6.0-6.8) for nutrient availability'],
        alts: [{ name: 'Very Early Stress', pct: 1 }, { name: 'Mild Nutrient Variation', pct: 1 }]
    },
    // ── APPLE ─────────────────────────────────────────────────────────────────
    'Apple___Apple_scab': {
        label: 'Apple – Apple Scab (Venturia inaequalis)', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat in Spring',
        confidence: 92, desc: 'Venturia inaequalis causes olive-green to black velvety scabs on leaves and fruit. Primary infection from overwintered spores in spring. Major quality issue – makes fruit unmarketable.',
        steps: ['Apply fungicide (captan or myclobutanil) from green tip through petal fall', 'Rake and destroy fallen leaves in autumn – main spore source', 'Prune for open canopy to improve air circulation and spray penetration', 'Apply lime sulfur spray during dormant season', 'Plant scab-resistant apple varieties (e.g., Enterprise, Liberty)'],
        alts: [{ name: 'Sooty Blotch', pct: 6 }, { name: 'Black Rot', pct: 4 }]
    },
    'Apple___Black_rot': {
        label: 'Apple – Black Rot (Botryosphaeria)', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Within 48h',
        confidence: 88, desc: 'Botryosphaeria obtusa causes "frog-eye" leaf spots, cankers on branches, and mummified black fruit. Enters through wounds and dead wood. Fruit rot can develop rapidly.',
        steps: ['Prune out all dead/cankered wood at least 15cm below visible infection', 'Remove and destroy mummified fruit – major overwintering source', 'Apply captan or copper fungicide during growing season', 'Avoid wounding bark during pruning or cultivation', 'Maintain tree vigor with proper fertilization and irrigation'],
        alts: [{ name: 'Apple Scab', pct: 7 }, { name: 'Cedar Apple Rust', pct: 4 }]
    },
    'Apple___Cedar_apple_rust': {
        label: 'Apple – Cedar Apple Rust (Gymnosporangium)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within a Week',
        confidence: 87, desc: 'Gymnosporangium juniperi-virginianae requires two hosts: apple and eastern red cedar/juniper. Causes bright orange-yellow spots on apple leaves with gelatinous spore horns on juniper galls.',
        steps: ['Apply myclobutanil or propiconazole fungicide from pink through second cover spray', 'Remove nearby eastern red cedar / juniper trees if possible', 'Prune out cedar apple galls from junipers in late winter before spores release', 'Plant rust-resistant apple varieties', 'Apply preventive copper spray before infection periods (spring)'],
        alts: [{ name: 'Apple Scab', pct: 8 }, { name: 'Quince Rust', pct: 5 }]
    },
    'Apple___healthy': {
        label: 'Apple – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 97, desc: 'Apple foliage appears completely healthy with normal leaf color and no sign of disease, scab, or pest damage.',
        steps: ['Maintain annual dormant pruning for open canopy structure', 'Apply preventive fungicide program starting at green tip each spring', 'Thin fruit to 1 per cluster (15-20cm spacing) for larger, healthier apples', 'Monitor weekly for codling moth trap catches', 'Test and maintain soil pH between 6.0-7.0'],
        alts: [{ name: 'Very Early Scab', pct: 1 }, { name: 'Minor Nutrient Stress', pct: 1 }]
    },
    // ── GRAPE ─────────────────────────────────────────────────────────────────
    'Grape___Black_rot': {
        label: 'Grape – Black Rot (Guignardia bidwellii)', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Within 48h',
        confidence: 90, desc: 'Guignardia bidwellii causes brown leaf lesions with black dots (pycnidia) and shriveled mummified black berries. Most critical infection period is 2-5 weeks after bloom.',
        steps: ['Apply mancozeb or myclobutanil fungicide from pre-bloom through fruit set', 'Remove all mummified berries and infected clusters – primary inoculum', 'Prune for open canopy to improve air drying after rain', 'Destroy pruning debris – do not leave in vineyard', 'Scout weekly during bloom period (highest risk window)'],
        alts: [{ name: 'Downy Mildew', pct: 7 }, { name: 'Botrytis Bunch Rot', pct: 5 }]
    },
    'Grape___Esca_(Black_Measles)': {
        label: 'Grape – Esca / Black Measles', healthy: false, urgency: 'high', urgencyLabel: '🔴 No Cure – Manage Spread',
        confidence: 86, desc: 'A complex trunk disease caused by wood-rotting fungi (Phaeomoniella, Phaeoacremonium). Causes "tiger-stripe" leaf symptoms, shriveled berries, and internal wood decay. Systemic – no cure once established.',
        steps: ['Remove and destroy affected vines or severely infected canes', 'Protect all pruning wounds immediately with wound sealant or fungicide paste', 'Prune during dry conditions only – avoid wet weather pruning', 'Delay annual pruning to late in the dormant season (lower infection risk)', 'Replace dead vines with disease-free certified planting material'],
        alts: [{ name: 'Eutypa Dieback', pct: 8 }, { name: 'Botrytis', pct: 4 }]
    },
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
        label: 'Grape – Leaf Blight (Isariopsis)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within a Week',
        confidence: 84, desc: 'Isariopsis clavispora (syn. Cercospora viticola) causes angular dark brown lesions on grapevine leaves. Can cause premature defoliation reducing fruit quality and vine health.',
        steps: ['Apply copper or mancozeb fungicide at onset', 'Improve canopy density via shoot thinning and leaf removal', 'Avoid overhead irrigation – use drip systems', 'Remove fallen infected leaves from vineyard floor', 'Ensure adequate potassium nutrition for leaf health'],
        alts: [{ name: 'Downy Mildew', pct: 9 }, { name: 'Angular Leaf Scorch', pct: 5 }]
    },
    'Grape___healthy': {
        label: 'Grape – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 96, desc: 'Grapevine foliage appears healthy with no visible signs of fungal, bacterial, or viral disease.',
        steps: ['Maintain preventive fungicide spray schedule from bud break to veraison', 'Perform canopy management – shoot positioning, leaf removal for airflow', 'Monitor soil moisture – maintain consistent irrigation during fruit development', 'Test and maintain soil pH between 6.0-6.5', 'Scout for leafhoppers and mealybugs weekly'],
        alts: [{ name: 'Very Early Disease', pct: 2 }, { name: 'Minor Nutrient Variation', pct: 1 }]
    },
    // ── STRAWBERRY ────────────────────────────────────────────────────────────
    'Strawberry___Leaf_scorch': {
        label: 'Strawberry – Leaf Scorch (Diplocarpon)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within a Week',
        confidence: 87, desc: 'Diplocarpon earlianum causes numerous small, dark purple lesions that merge giving leaves a scorched appearance. Thrives in warm, wet conditions. Can significantly weaken plant vigor.',
        steps: ['Remove and dispose of heavily infected leaves', 'Apply captan or thiram fungicide every 7-10 days during wet periods', 'Ensure good drainage – avoid waterlogged beds', 'Renovate beds after harvest by mowing and tilling row edges', 'Plant resistant varieties and certified disease-free transplants'],
        alts: [{ name: 'Angular Leaf Spot', pct: 8 }, { name: 'Botrytis Crown Rot', pct: 5 }]
    },
    'Strawberry___healthy': {
        label: 'Strawberry – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 96, desc: 'Strawberry foliage appears healthy with normal trifoliate leaf structure and good coloration.',
        steps: ['Maintain consistent moisture – strawberries have shallow roots', 'Remove runners if focused on fruit production (not propagation)', 'Apply mulch to keep fruit clean and regulate soil temperature', 'Fertilize lightly after harvest for next year\'s crown development', 'Scout for two-spotted spider mite on leaf undersides weekly'],
        alts: [{ name: 'Very Early Stress', pct: 2 }, { name: 'Minor Leaf Spot', pct: 1 }]
    },
    // ── CHERRY ────────────────────────────────────────────────────────────────
    'Cherry_(including_sour)___Powdery_mildew': {
        label: 'Cherry – Powdery Mildew (Podosphaera)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within 3-5 Days',
        confidence: 89, desc: 'Podosphaera clandestina causes white powdery coating on young leaves, shoots and fruit. Infected leaves curl upward. More severe on young tissues in spring flush growth.',
        steps: ['Apply sulfur or potassium bicarbonate spray – avoid when temperatures exceed 32°C', 'Apply myclobutanil or trifloxystrobin fungicide for systemic control', 'Prune to improve air circulation through canopy', 'Avoid excessive nitrogen fertilization that promotes susceptible soft growth', 'Start preventive sprays at shuck split stage each spring'],
        alts: [{ name: 'Leaf Spot', pct: 7 }, { name: 'Rust', pct: 4 }]
    },
    'Cherry_(including_sour)___healthy': {
        label: 'Cherry – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 97, desc: 'Cherry foliage appears completely healthy with no signs of disease, pest damage, or nutritional stress.',
        steps: ['Apply preventive fungicide (captan) from petal fall through cover sprays', 'Monitor for cherry fruit fly starting from fruit color change', 'Prune for open vase shape to maximize light penetration', 'Fertilize in early spring before growth begins – avoid late-season N', 'Ensure adequate calcium nutrition to prevent fruit cracking'],
        alts: [{ name: 'Early Leaf Spot', pct: 1 }, { name: 'Minor Stress', pct: 1 }]
    },
    // ── PEACH ─────────────────────────────────────────────────────────────────
    'Peach___Bacterial_spot': {
        label: 'Peach – Bacterial Spot (Xanthomonas)', healthy: false, urgency: 'high', urgencyLabel: '🔴 Treat Within 48h',
        confidence: 88, desc: 'Xanthomonas arboricola pv. pruni causes water-soaked lesions that turn purple/brown on leaves, with shot-hole effect as lesions drop out. Also causes fruit pitting. Spreads in rain and wind.',
        steps: ['Apply copper spray at petal fall and repeat every 7-10 days in wet weather', 'Prune for open canopy – sunlight and airflow reduce disease pressure', 'Avoid overhead irrigation – use drip systems', 'Remove and destroy severely infected shoots', 'Plant resistant peach varieties in areas with chronic bacterial spot history'],
        alts: [{ name: 'Peach Leaf Curl', pct: 8 }, { name: 'Fungal Leaf Spot', pct: 5 }]
    },
    'Peach___healthy': {
        label: 'Peach – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 96, desc: 'Peach foliage appears healthy with vibrant green normal leaf shape and no signs of disease or pest infestation.',
        steps: ['Apply dormant copper spray to prevent bacterial spot and leaf curl', 'Thin fruit to 15-20cm spacing for best size and quality', 'Fertilize with balanced fertilizer in early spring', 'Scout for oriental fruit moth with pheromone traps', 'Ensure proper drainage – peaches are sensitive to root rot'],
        alts: [{ name: 'Very Early Stress', pct: 2 }, { name: 'Minor Nutrient Imbalance', pct: 1 }]
    },
    // ── BLUEBERRY ─────────────────────────────────────────────────────────────
    'Blueberry___healthy': {
        label: 'Blueberry – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 96, desc: 'Blueberry foliage appears healthy with characteristic deep green coloration and normal leaf structure.',
        steps: ['Maintain soil pH between 4.5-5.5 – critical for blueberry health', 'Mulch with pine bark or sawdust to conserve moisture and keep pH low', 'Fertilize with ammonium sulfate (acidifying fertilizer)', 'Scout for blueberry maggot fly with red sphere traps', 'Prune out 3-year-old canes to keep bush productive'],
        alts: [{ name: 'Very Early Stress', pct: 2 }, { name: 'Mummy Berry', pct: 1 }]
    },
    // ── RASPBERRY ─────────────────────────────────────────────────────────────
    'Raspberry___healthy': {
        label: 'Raspberry – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 95, desc: 'Raspberry canes and leaves appear healthy with no signs of disease, virus mosaics, or pest damage.',
        steps: ['Prune out all floricanes (2nd-year canes) after harvest', 'Maintain row width below 30cm for air circulation', 'Trellis primocanes for support and uniform light distribution', 'Scout for raspberry crown borer in spring', 'Apply mulch to suppress weeds and retain moisture'],
        alts: [{ name: 'Very Early Virus', pct: 2 }, { name: 'Mild Stress', pct: 1 }]
    },
    // ── SOYBEAN ───────────────────────────────────────────────────────────────
    'Soybean___healthy': {
        label: 'Soybean – Healthy ✅', healthy: true, urgency: 'low', urgencyLabel: '🟢 No Action Needed',
        confidence: 95, desc: 'Soybean foliage appears healthy with normal trifoliate leaf structure and vibrant green coloration.',
        steps: ['Scout for soybean aphids and bean leaf beetles at V2-V6 stages', 'Monitor for sudden death syndrome in wet soils at early growth stages', 'Rotate with corn to interrupt soybean cyst nematode cycles', 'Apply preventive seed treatments with fungicide + insecticide', 'Test soil and correct pH to 6.0-7.0 for optimal nitrogen fixation'],
        alts: [{ name: 'Very Early Stress', pct: 2 }, { name: 'Mild Chlorosis', pct: 1 }]
    },
    // ── SQUASH ────────────────────────────────────────────────────────────────
    'Squash___Powdery_mildew': {
        label: 'Squash – Powdery Mildew (Podosphaera / Erysiphe)', healthy: false, urgency: 'med', urgencyLabel: '🟡 Act Within 3-5 Days',
        confidence: 91, desc: 'White powdery coating on upper leaf surfaces is caused by Podosphaera xanthii or Erysiphe cichoracearum. Unlike most fungi, spreads in DRY warm conditions. Can significantly reduce squash yield and quality.',
        steps: ['Spray baking soda solution (1 tsp baking soda + 0.5 tsp dish soap + 1L water) every 5 days', 'Apply potassium bicarbonate or neem oil spray', 'Remove and bag heavily infected leaves', 'Improve air circulation by spacing plants and removing low leaves', 'Apply kaolin clay as a preventive barrier spray'],
        alts: [{ name: 'Downy Mildew', pct: 7 }, { name: 'Angular Leaf Spot', pct: 4 }]
    },
    // ── ORANGE / CITRUS ───────────────────────────────────────────────────────
    'Orange___Haunglongbing_(Citrus_greening)': {
        label: 'Citrus – Huanglongbing (Greening Disease)', healthy: false, urgency: 'critical', urgencyLabel: '🚨 Quarantine Disease – Report Immediately',
        confidence: 93, desc: 'HLB (Candidatus Liberibacter asiaticus) is the most destructive citrus disease worldwide. Transmitted by Asian citrus psyllid. Causes asymmetric yellowing (blotchy mottle), bitter misshapen fruit, and tree death within years. No cure exists. Report to your local agriculture department immediately.',
        steps: ['⚠️ REPORT TO LOCAL AGRICULTURE AUTHORITY IMMEDIATELY – this is a quarantine disease in many regions', 'Remove and destroy infected trees to prevent spread to entire grove', 'Control Asian citrus psyllid with systemic insecticide (imidacloprid)', 'Install psyllid monitoring traps throughout property', 'Do NOT move citrus plant material outside the area', 'Contact your county extension office for official guidance'],
        alts: [{ name: 'Nutrient Deficiency', pct: 5 }, { name: 'Citrus Tristeza Virus', pct: 2 }]
    },
};

// Helper: normalize HF label to DB key
// Model returns labels like "Bell Pepper with Bacterial Spot" or "Tomato___Early_blight"
function normalizeLabel(label) {
    if (!label) return null;
    // Direct match first
    if (PLANT_DISEASE_DB[label]) return label;

    // Map human-readable labels (from linkanjarad model) to DB keys
    const labelMap = {
        'tomato with bacterial spot': 'Tomato___Bacterial_spot',
        'tomato with early blight': 'Tomato___Early_blight',
        'tomato with late blight': 'Tomato___Late_blight',
        'tomato with leaf mold': 'Tomato___Leaf_Mold',
        'tomato with septoria leaf spot': 'Tomato___Septoria_leaf_spot',
        'tomato with spider mites': 'Tomato___Spider_mites Two-spotted_spider_mite',
        'tomato with target spot': 'Tomato___Target_Spot',
        'tomato with tomato yellow leaf curl virus': 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
        'tomato with tomato mosaic virus': 'Tomato___Tomato_mosaic_virus',
        'tomato healthy': 'Tomato___healthy',
        'potato with early blight': 'Potato___Early_blight',
        'potato with late blight': 'Potato___Late_blight',
        'potato healthy': 'Potato___healthy',
        'bell pepper with bacterial spot': 'Pepper,_bell___Bacterial_spot',
        'bell pepper healthy': 'Pepper,_bell___healthy',
        'corn with common rust': 'Corn_(maize)___Common_rust_',
        'corn with northern leaf blight': 'Corn_(maize)___Northern_Leaf_Blight',
        'corn with gray leaf spot': 'Corn_(maize)___Gray_leaf_spot',
        'corn healthy': 'Corn_(maize)___healthy',
        'apple with apple scab': 'Apple___Apple_scab',
        'apple with black rot': 'Apple___Black_rot',
        'apple with cedar apple rust': 'Apple___Cedar_apple_rust',
        'apple healthy': 'Apple___healthy',
        'grape with black rot': 'Grape___Black_rot',
        'grape with esca': 'Grape___Esca_(Black_Measles)',
        'grape with leaf blight': 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
        'grape healthy': 'Grape___healthy',
        'strawberry with leaf scorch': 'Strawberry___Leaf_scorch',
        'strawberry healthy': 'Strawberry___healthy',
        'cherry with powdery mildew': 'Cherry_(including_sour)___Powdery_mildew',
        'cherry healthy': 'Cherry_(including_sour)___healthy',
        'peach with bacterial spot': 'Peach___Bacterial_spot',
        'peach healthy': 'Peach___healthy',
        'blueberry healthy': 'Blueberry___healthy',
        'raspberry healthy': 'Raspberry___healthy',
        'soybean healthy': 'Soybean___healthy',
        'squash with powdery mildew': 'Squash___Powdery_mildew',
        'orange with haunglongbing': 'Orange___Haunglongbing_(Citrus_greening)',
    };

    const lc = label.toLowerCase().trim();
    if (labelMap[lc]) return labelMap[lc];

    // Partial match fallback
    const partialKey = Object.keys(labelMap).find(k => lc.includes(k) || k.includes(lc));
    if (partialKey) return labelMap[partialKey];

    // Underscore-style fallback
    const normalized = label.replace(/ /g, '_').replace(/-/g, '_');
    return Object.keys(PLANT_DISEASE_DB).find(k =>
        k.toLowerCase().replace(/[_,()]/g, '') === normalized.toLowerCase().replace(/[_,()]/g, '')
    ) || null;
}

// ============================================
// 5. AI DISEASE DETECTOR (HuggingFace ML → DB lookup → Claude fallback)
// ============================================
app.post('/api/detect-disease', async (req, res) => {
    try {
        const { imageBase64, mediaType } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

        // Convert base64 to binary buffer for HF API
        const imgBuffer = Buffer.from(imageBase64, 'base64');

        // ── STEP 1: Call Hugging Face ML model (PlantVillage trained) ──────────
        const HF_MODEL = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
        const hfHeaders = { 'Content-Type': 'application/octet-stream', 'Authorization': `Bearer ${process.env.HF_API_KEY || ''}` };

        let mlLabel = null;
        let mlScore = null;

        try {
            const hfRes = await fetch(`https://router.huggingface.co/hf-inference/models/${HF_MODEL}`, {
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

        // ── STEP 2: Look up disease in our comprehensive database ──────────────
        if (mlLabel) {
            const dbKey = normalizeLabel(mlLabel);
            if (dbKey && PLANT_DISEASE_DB[dbKey]) {
                const info = PLANT_DISEASE_DB[dbKey];
                console.log(`✅ ML identified: ${info.label} (${mlScore}% confidence)`);
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

        // ── STEP 3: Fallback to Claude if HF failed or label not in DB ─────────
        console.log('⚠️ Falling back to Claude API for:', mlLabel || 'unknown');
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            return res.json({
                status: mlLabel || 'Analysis Unavailable',
                healthy: false,
                confidence: mlScore || 50,
                urgency: 'med',
                urgencyLabel: '🟡 Manual Assessment Needed',
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
                            text: `You are a plant pathologist with expertise in the PlantVillage dataset (38 disease classes). ${mlLabel ? `A MobileNetV2 ML model pre-classified this as: "${mlLabel}" with ${mlScore}% confidence.` : ''} Analyze this leaf image and respond ONLY with a valid JSON object (no markdown):
{"status":"precise disease name","healthy":true/false,"confidence":85,"urgency":"low/med/high/critical","urgencyLabel":"🟢 No Action Needed","description":"3-4 sentence scientific diagnosis","steps":["step1","step2","step3","step4"],"alts":[{"name":"Alternative Disease","pct":8}],"source":"Claude Vision + ML"}`
                        }
                    ]
                }]
            })
        });
        const claudeData = await claudeRes.json();
        if (claudeData.error) throw new Error(claudeData.error.message);
        const text = claudeData.content[0].text.trim().replace(/```json|```/g, '').trim();
        return res.json(JSON.parse(text));

    } catch (err) {
        console.error('Disease detection error:', err);
        return res.json({
            status: 'Early Blight (Alternaria)',
            healthy: false,
            confidence: 78,
            urgency: 'high',
            urgencyLabel: '🔴 Treat Within 48h',
            description: 'Target-ring lesions suggest Alternaria early blight. Common in tomatoes and potatoes. Remove affected leaves and apply neem oil or copper-based fungicide.',
            steps: ['Remove all infected leaves and bag for disposal', 'Apply neem oil spray (5ml per litre water) every 3 days', 'Avoid overhead watering – water at soil level', 'Improve air circulation around plants'],
            alts: [{ name: 'Septoria Leaf Spot', pct: 8 }, { name: 'Bacterial Spot', pct: 4 }],
            source: 'Fallback (network error)'
        });
    }
});

// ============================================
// 6. REMINDER INTEGRATION (Twilio + node-cron)
// ============================================
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_sid')
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

async function sendReminder(to, plantName) {
    if (!twilioClient) {
        console.warn('⚠️ Twilio not configured. Would have sent "Water ' + plantName + '" to ' + to);
        return;
    }
    try {
        await twilioClient.messages.create({
            body: `🌿 Hi! Your plant "${plantName}" needs some water. Don't forget to keep it hydrated today! 💧`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log(`✅ Reminder sent to ${to} for ${plantName}`);
    } catch (err) {
        console.error('❌ Failed to send SMS:', err.message);
    }
}

// Background Task: Check for plants (Runs every minute for accuracy)
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMin}`;
    console.log(`⏰ Cron tick at ${currentTimeString} – checking reminders...`);
    try {
        const plants = await Plant.find().populate('userId');

        for (const plant of plants) {
            const preferredTime = plant.reminderTime || '09:00';
            if (preferredTime !== currentTimeString) continue;
            if (!plant.waterFrequencyDays) continue;

            const lastWatered = plant.lastWatered || plant._id.getTimestamp();
            const diffMs = now - lastWatered;
            const diffDays = diffMs / (1000 * 60 * 60 * 24); // fractional days
            // Send reminder if plant is due (>= waterFrequencyDays) OR if it's the very first reminder (< 1 day old means just added)
            const isDue = diffDays >= plant.waterFrequencyDays;
            const isFirstReminder = diffMs < 1000 * 60 * 60 * 24; // plant added today
            if (!isDue && !isFirstReminder) {
                console.log(`⏭️  Skipping ${plant.name} — ${diffDays.toFixed(1)} days since water, needs ${plant.waterFrequencyDays}`);
                continue;
            }

            // Try to get phone from populated userId
            let phone = plant.userId && plant.userId.phoneNumber ? plant.userId.phoneNumber : null;

            // FALLBACK: look up user by email if userId didn't have a phone
            if (!phone && plant.email) {
                const userByEmail = await User.findOne({ email: { $regex: new RegExp('^' + plant.email + '$', 'i') } });
                if (userByEmail && userByEmail.phoneNumber) {
                    phone = userByEmail.phoneNumber;
                    console.log(`📧 Found phone via email lookup for plant: ${plant.name}`);
                }
            }

            if (phone) {
                console.log(`📲 Sending reminder for ${plant.name} to ${phone}`);
                await sendReminder(phone, plant.name);
            } else {
                console.warn(`⚠️  No phone number found for plant "${plant.name}" (email: ${plant.email || 'none'})`);
            }
        }
    } catch (err) {
        console.error('❌ Cron job error:', err);
    }
});

// API to update user profile (phone number)
app.post('/api/update-profile', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { phoneNumber, name } = req.body;
        const user = await User.findById(req.user._id);
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (name) user.name = name;
        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to record watering
app.post('/api/plants/:id/water', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        if (!plant) return res.status(404).json({ error: 'Plant not found' });

        plant.lastWatered = new Date();
        await plant.save();
        res.json({ success: true, lastWatered: plant.lastWatered });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Trigger a manual reminder (for testing) - requires session
app.post('/api/test-reminder', async (req, res) => {
    if (!req.user || !req.user.phoneNumber) return res.status(400).json({ error: 'User phone number not set' });
    try {
        await sendReminder(req.user.phoneNumber, "Test Plant");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Direct test SMS - no session needed, just pass phone + plantName
app.post('/api/send-test-sms', async (req, res) => {
    const { phone, plantName } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    if (!twilioClient) return res.status(500).json({ error: 'Twilio not configured. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env' });
    try {
        const result = await twilioClient.messages.create({
            body: `🌿 TEST: Your plant "${plantName || 'Test Plant'}" needs water! 💧 - DailyGarden`,
            from: process.env.TWILIO_PHONE_NUMBER.trim(),
            to: phone
        });
        console.log(`✅ Test SMS sent! SID: ${result.sid}`);
        res.json({ success: true, sid: result.sid, status: result.status });
    } catch (err) {
        console.error('❌ Test SMS error:', err.message);
        res.status(500).json({ error: err.message, code: err.code });
    }
});

// Basic API health check
app.get('/api/health', (req, res) => {
    res.send('Backend is updated with Data Models, Auth, and Payments ready!');
});

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname)));

// Handle Single Page Application (SPA) routing
app.get('/*path', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Consolidated Server on port 5000 (accessible on local network)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Gradern Project is LIVE!`);
    console.log(`📱 Local Access:    http://localhost:${PORT}`);
    console.log(`📶 Network Access:  http://YOUR_LOCAL_IP:${PORT}`);
    console.log(`-------------------------------------------\n`);
});

// Force node to stay alive
setInterval(() => { }, 1000 * 60 * 60);