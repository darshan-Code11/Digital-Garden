
    // ==================== DATA ====================
    const DB_KEY = 'gardenlog_db';
    const USERS_KEY = 'gardenlog_users';
    const SESSION_KEY = 'gardenlog_session';

    let currentUser = null;
    let userDB = {}; // per-user data

    // Default tasks
    const defaultTasks = [
      { id: 1, dot: 'dot-water', text: 'Water 🍅 Tomato', time: '9:00 AM', done: false },
      { id: 2, dot: 'dot-fertilize', text: 'Fertilize 🌿 Mint', time: '11:00 AM', done: false },
      { id: 3, dot: 'dot-water', text: 'Water 🌶️ Chilli', time: '6:00 PM', done: false },
      { id: 4, dot: 'dot-harvest', text: 'Harvest 🥬 Spinach', time: 'Evening', done: false },
    ];
    const defaultPlants = [
      { id: 1, emoji: '🍅', name: 'Cherry Tomato', variety: 'Hybrid F1', stage: 'Flowering', progress: 65, days: 42, water: 2, garden: 'Balcony', color: '#ffe0d6', notes: 'Needs regular pruning. Check for aphids weekly.' },
      { id: 2, emoji: '🌿', name: 'Mint', variety: 'Spearmint', stage: 'Vegetative', progress: 80, days: 30, water: 1, garden: 'Indoor', color: '#d4eed8', notes: 'Spreads quickly. Keep in separate pot.' },
      { id: 3, emoji: '🥬', name: 'Spinach', variety: 'Baby Leaf', stage: 'Harvest', progress: 95, days: 55, water: 2, garden: 'Outdoor', color: '#d8f0d4', notes: 'Ready to harvest! Cut outer leaves first.' },
      { id: 4, emoji: '🌶️', name: 'Green Chilli', variety: 'Long Slim', stage: 'Sprout', progress: 25, days: 12, water: 3, garden: 'Balcony', color: '#e0f0d4', notes: 'Seedling phase. Protect from strong winds.' },
    ];
    const harvestData = [
      { plant: '🥬 Spinach', planted: 'Dec 25', expected: 'Feb 20', qty: '800g', status: 'Ready' },
      { plant: '🍅 Cherry Tomato', planted: 'Jan 8', expected: 'Mar 5', qty: '~1.2kg', status: 'On Track' },
      { plant: '🌿 Mint', planted: 'Jan 18', expected: 'Ongoing', qty: '120g', status: 'Harvesting' },
      { plant: '🌶️ Chilli', planted: 'Feb 6', expected: 'Apr 15', qty: '~400g', status: 'Early Stage' },
    ];
    const timelineData = {
      '🍅 Cherry Tomato': [{ date: 'Jan 8', text: '🌰 Seed planted in seed tray', milestone: true }, { date: 'Jan 15', text: '🌱 First sprout appeared!' }, { date: 'Jan 28', text: '🍃 True leaves developing' }, { date: 'Feb 5', text: '🌸 Flower buds forming', milestone: true }, { date: 'Feb 14', text: '🌸 Full bloom!' }, { date: 'Today', text: '⚠️ Slight leaf spot noticed' }],
      '🌿 Mint': [{ date: 'Jan 18', text: '🌰 Stem cutting planted', milestone: true }, { date: 'Jan 22', text: '🌱 Roots forming' }, { date: 'Feb 1', text: '🍃 Lush growth!', milestone: true }, { date: 'Feb 10', text: '✂️ First harvest (20g)' }],
      '🥬 Spinach': [{ date: 'Dec 25', text: '🌰 Seeds sown densely', milestone: true }, { date: 'Jan 3', text: '🌱 Germination in 9 days' }, { date: 'Jan 18', text: '🍃 Thinned seedlings' }, { date: 'Feb 8', text: '🌾 Ready for harvest!', milestone: true }],
    };
    const communityPosts = [
      { avatar: '🧑‍🌾', name: 'Arjun Sharma', text: 'My balcony tomatoes are finally flowering! 45 days in 🍅', likes: 24, time: '2h ago' },
      { avatar: '👩‍🌿', name: 'Priya Nair', text: 'Coffee grounds around mint keeps pests away — try it! 🌿', likes: 47, time: '5h ago' },
      { avatar: '🧑‍🌱', name: 'Rahul M', text: 'Just harvested 800g of spinach from a 2sqft bed! #Organic', likes: 31, time: '1d ago' },
      { avatar: '👩‍🍃', name: 'Sunita K', text: 'Anyone tried growing chillies in Bengaluru? Tips needed!', likes: 12, time: '2d ago' },
    ];
    const tips = ['💧 Water in early morning to reduce evaporation', '🌞 Most vegetables need 6-8h of sunlight daily', '🐛 Check underside of leaves for pests weekly', '🌱 Rotate crops each season to prevent depletion', '✂️ Deadhead flowers to encourage more blooms', '🌧️ Collect rainwater — plants love it!', '🍂 Compost kitchen scraps for free fertilizer', '🌡️ Soil temp matters as much as air temp for germination', '🌿 Neem oil spray prevents 200+ pest species', '💪 Add cocopeat to retain moisture in pots'];
    const diseaseResults = [
      { status: '✅ Healthy Leaf', desc: 'No disease detected. Leaf colour and texture are normal. Keep up the regular care routine.', cls: 'result-healthy' },
      { status: '⚠️ Leaf Spot Detected', desc: 'Fungal leaf spot found. Remove affected leaves and apply neem oil. Improve air circulation around the plant.', cls: 'result-issue' },
      { status: '⚠️ Nutrient Deficiency', desc: 'Yellowing suggests nitrogen deficiency. Add balanced NPK fertilizer or compost tea once a week.', cls: 'result-issue' },
      { status: '✅ Mild Heat Stress', desc: 'Slight wilting from heat. Water more frequently in mornings and provide afternoon shade if possible.', cls: 'result-healthy' },
    ];
    const seasons = [
      { icon: '🌸', name: 'Spring', tip: 'Plant tomatoes, peppers & herbs. Best time for new seedlings.', active: true },
      { icon: '☀️', name: 'Summer', tip: 'Water daily, harvest frequently. Watch for heat stress.' },
      { icon: '🍂', name: 'Autumn', tip: 'Plant root vegetables, garlic & spinach. Collect seeds.' },
      { icon: '❄️', name: 'Winter', tip: 'Grow cold-hardy greens indoors. Plan next year\'s garden.' },
    ];
    const faqs = [
      { q: 'How often should I water my plants?', a: 'Most vegetables need 1-2 inches of water per week. Use the finger test — push your index finger 2 inches into soil. If dry, water thoroughly until it drains from the bottom. Overwatering is the #1 killer of container plants.' },
      { q: 'What is the best soil for container gardening?', a: 'Use a premium potting mix with good drainage. Mix 60% potting mix + 20% cocopeat for moisture retention + 20% perlite for aeration. Never use garden soil in containers — it compacts and blocks drainage. Ugaoo Pot-O-Mix is a great ready-to-use option.' },
      { q: 'Why are my plant leaves turning yellow?', a: 'Yellowing can mean: overwatering (soft, droopy yellow leaves), nitrogen deficiency (lower leaves turn yellow first), too little light, or root rot. Feel the soil — if wet and roots smell musty, it\'s overwatering. If dry, it\'s likely nutrient deficiency.' },
      { q: 'When is the best time to harvest vegetables?', a: 'Harvest in the morning when vegetables are fully hydrated and sugars are highest. Most vegetables taste best young: tomatoes when fully coloured but still firm, leafy greens at 10–15cm height, chillies when full size, beans before seeds bulge in pods.' },
      { q: 'How do I get rid of mealybugs organically?', a: 'Dip a cotton swab in 70% isopropyl alcohol and wipe each mealybug individually. Then spray the whole plant with: 5ml neem oil + 2ml dish soap + 1L water. Repeat every 3 days for 2 weeks. Isolate the affected plant from others immediately.' },
      { q: 'Can I grow vegetables without direct sunlight?', a: 'Leafy greens (spinach, lettuce, methi, coriander) can tolerate 4h of direct sun or 6h of bright indirect light. Fruiting vegetables (tomatoes, chillies, cucumber) need 6+ hours of direct sun. Avoid fruiting vegetables in low-light spots.' },
      { q: 'How do I make organic fertilizer at home?', a: 'Banana peel: soak 5 peels in 1L water for 3 days, dilute 1:5. Compost tea: steep compost in water 24h, strain, apply directly. Mustard cake: soak 50g in 1L water overnight, dilute 1:10. Onion peel water: boil onion peels, cool, and water plants weekly.' },
      { q: 'When should I repot my plants?', a: 'Repot when: roots emerge from drainage holes, plant topples easily, soil dries within 24h of watering, or plant seems stunted despite regular feeding. Choose a pot only 1-2 inches larger — too large causes root rot from excess wet soil.' },
    ];
    const careTipsData = [
      { icon: '☀️', val: '6-8h', lbl: 'Sunlight Daily', trend: 'For most vegetables' },
      { icon: '💧', val: '2x', lbl: 'Water Per Day', trend: 'In summer heat' },
      { icon: '🌡️', val: '20-30°', lbl: 'Ideal Temp', trend: 'For tropical plants' },
      { icon: '🌿', val: 'Monthly', lbl: 'Fertilize', trend: 'Organic compost best' },
    ];
    const achievements = [
      { icon: '🌱', name: 'First Sprout', desc: 'Grew your first plant', locked: false },
      { icon: '💧', name: 'Water Wizard', desc: '30 days streak', locked: false },
      { icon: '🌾', name: 'First Harvest', desc: 'Harvested first crop', locked: false },
      { icon: '🔬', name: 'Plant Doctor', desc: 'Early disease detection', locked: false },
      { icon: '🌍', name: 'Community Star', desc: '10 post likes', locked: false },
      { icon: '🏆', name: 'Master Gardener', desc: 'Grow 10+ plants', locked: true },
      { icon: '🌸', name: 'Bloom Master', desc: '5 flowering plants', locked: true },
      { icon: '♻️', name: 'Composter', desc: '30 compost entries', locked: true },
    ];
    const guides = [
      {
        id: 'g1', emoji: '🍅', bg: '#fff0e8', tag: 'Vegetables', title: 'Growing Tomatoes in Small Spaces', desc: 'Master container tomatoes — maximize yield on any balcony with pro techniques.', time: '8 min read', difficulty: 2,
        content: `<h3>🍅 Growing Tomatoes in Small Spaces</h3>
<p>Container tomatoes can be just as productive as garden-bed plants when given the right conditions. With the right variety, pot size, and care routine, you can harvest hundreds of ripe tomatoes from a single 12-inch balcony pot.</p>
<div class="guide-tip-box">💡 <strong>Key Insight:</strong> Tomatoes are not actually difficult — they fail most often due to two things: inconsistent watering and insufficient sunlight. Fix these and you'll succeed.</div>
<h4>Best Varieties for Indian Container Gardens</h4>
<ul>
<li><strong>Cherry Tomatoes (Ugaoo Hybrid F1)</strong> — Prolific producers. One plant yields 200–400 fruits. Perfect for 10-inch pots. Indeterminate — keeps producing all season.</li>
<li><strong>Patio F1</strong> — Bred specifically for pots. Bushy, determinate habit, no staking. Fruits in 60 days.</li>
<li><strong>Roma Tomato</strong> — Meaty paste tomato. Less susceptible to cracking. Best for cooking.</li>
</ul>
<h4>Container & Soil Setup</h4>
<p>Use containers at least <strong>10–12 inches deep and wide</strong> for cherry tomatoes; 14 inches for larger varieties. Fabric grow bags outperform plastic — they air-prune roots and prevent overwatering. Fill with: 50% Ugaoo Pot-O-Mix + 30% cocopeat + 20% vermicompost.</p>
<h4>Sunlight Requirements (Critical)</h4>
<p>Tomatoes need a <strong>minimum of 6 hours of direct sunlight</strong> daily. In Bengaluru, place pots on south or west-facing balconies. Inadequate sun = no fruit. Do not place behind glass — UV needed for fruiting is filtered.</p>
<h4>Watering Schedule</h4>
<p>Water deeply every alternate day in summer (daily in peak heat above 36°C), every 2–3 days in winter. Test soil moisture 2 inches deep before watering. Mulch pot surface with coco peat. Inconsistent watering causes blossom-end rot and fruit splitting.</p>
<h4>Fertilizing Programme</h4>
<ul>
<li><strong>Weeks 1–4 (Vegetative):</strong> Balanced NPK (19-19-19) once weekly, diluted to 1/2 strength</li>
<li><strong>Weeks 5+ (Flowering/Fruiting):</strong> Switch to high-potassium fertilizer (NPK 0-52-34). Potassium boosts fruit set and sweetness.</li>
<li><strong>Always:</strong> Monthly application of vermicompost around pot base</li>
</ul>
<h4>Staking & Pruning</h4>
<p>Stake indeterminate varieties when 30cm tall. Use bamboo or metal cage. Prune <em>suckers</em> — the shoots growing in the V between main stem and branch. Removing suckers directs energy to fruit production and improves air circulation, reducing fungal disease.</p>
<h4>Pollination on Balconies</h4>
<p>Balconies lack wind and insects. When flowers open, gently shake the plant or use an electric toothbrush against flower stems to vibrate pollen. Do this daily when flowers are open (usually 10am–2pm).</p>
<div class="guide-warning-box">⚠️ <strong>Watch for:</strong> Fruit borer (brown spots on fruit) — spray neem oil every 7 days as prevention. Leaf curl from heat stress — provide afternoon shade above 35°C.</div>
<h4>Common Problems & Solutions</h4>
<ul>
<li>🟡 <strong>Blossom drop:</strong> Temperature too high (>35°C) or too low (<13°C). Or pollen failure from lack of pollination.</li>
<li>🍂 <strong>Yellow lower leaves:</strong> Normal senescence, or nitrogen deficiency. Feed with diluted mustard cake solution.</li>
<li>🔴 <strong>Black bottom on fruit (BER):</strong> Inconsistent watering + calcium deficiency. Add crushed eggshells to pot.</li>
</ul>`},
      {
        id: 'g2', emoji: '💧', bg: '#e8f4ff', tag: 'Watering', title: 'Smart Watering: Science of Soil Moisture', desc: 'Over-watering is the #1 killer. Learn to read soil, roots and plant signals.', time: '5 min read', difficulty: 1,
        content: `<h3>💧 Smart Watering Guide</h3>
<p>More houseplants and vegetables die from overwatering than from any other cause. Root rot — caused by waterlogged, oxygen-deprived soil — is silent, progressive, and often irreversible by the time you notice symptoms.</p>
<div class="guide-tip-box">💡 <strong>The Golden Rule:</strong> Water when the soil needs it, not on a fixed schedule. A plant in full sun in summer may need water daily; the same plant in winter may need it every 5 days.</div>
<h4>The Finger Test (Most Reliable Method)</h4>
<p>Push your index finger <strong>2 inches</strong> (to the second knuckle) into the soil. If it feels dry at that depth, water thoroughly. If still moist, wait. This single technique prevents 90% of watering mistakes.</p>
<h4>How to Read Overwatering vs Underwatering</h4>
<ul>
<li>🔵 <strong>Overwatered:</strong> Soft, yellow, droopy leaves · Soil stays wet 3+ days · Musty smell · Root rot (black, slimy roots)</li>
<li>🔴 <strong>Underwatered:</strong> Crispy, brown leaf edges · Leaves curl inward · Pot feels very light · Soil pulls from pot edges</li>
</ul>
<h4>How to Water Correctly</h4>
<p>Water <strong>slowly and deeply</strong> until water drains freely from bottom holes. This ensures roots at the bottom get hydrated too. Empty the saucer 30 minutes later — never let pots sit in standing water. Morning watering is ideal; foliage dries before evening reducing fungal risk.</p>
<h4>Watering Guide for Indian Home Gardens</h4>
<ul>
<li>🍅 <strong>Tomatoes:</strong> Every 1-2 days summer, every 2-3 days winter</li>
<li>🌿 <strong>Mint:</strong> Every 1-2 days, keep slightly moist</li>
<li>🌶️ <strong>Chilli:</strong> Every 2-3 days (slightly drought-tolerant)</li>
<li>🥬 <strong>Leafy greens:</strong> Every 1-2 days</li>
<li>🌵 <strong>Succulents/Cacti:</strong> Every 10-14 days summer, monthly in winter</li>
<li>🌴 <strong>Areca Palm:</strong> Every 3-4 days, reduce in winter</li>
</ul>
<h4>Water Quality Matters</h4>
<p>Rainwater and filtered water are ideal. Municipal tap water often contains chlorine that can harm sensitive plants. Let tap water sit in an open container for 24 hours before using to allow chlorine to dissipate. Never use softened water — the salt content harms plant roots.</p>
<div class="guide-tip-box">🛠️ <strong>Best Investment:</strong> A soil moisture meter (₹200–400 online) eliminates all guesswork. Insert into soil — green means moist, red means dry. Worth every rupee for beginners.</div>`},
      {
        id: 'g3', emoji: '🐛', bg: '#f0ffe8', tag: 'Pest Control', title: 'Organic Pest Control: Complete Guide', desc: 'Neem oil, companion planting, and DIY sprays to protect without chemicals.', time: '10 min read', difficulty: 2,
        content: `<h3>🐛 Natural Pest Control Guide</h3>
<p>Chemical pesticides kill pests but also destroy beneficial insects like bees, ladybugs, ground beetles and soil microbes — creating a monoculture where pests become resistant and return stronger. Organic methods work with nature, not against it.</p>
<h4>Neem Oil — The #1 Organic Solution</h4>
<p>Cold-pressed neem oil contains <strong>azadirachtin</strong>, which disrupts the lifecycle of 200+ pest species by interfering with their hormonal systems — they stop feeding, moulting, and reproducing. It does not harm birds, earthworms, or most beneficial insects.</p>
<div class="guide-tip-box">💡 <strong>Neem Oil Recipe:</strong> Mix 5ml neem oil + 2ml liquid dish soap (emulsifier) + 1L water. Shake well before each spray. Apply to all leaf surfaces including undersides. Spray in evening to avoid UV breakdown. Reapply every 7-10 days preventively, or every 3-4 days during active infestation.</div>
<h4>Companion Planting: Nature's Pest Shield</h4>
<ul>
<li>🌼 <strong>Marigolds</strong> near tomatoes — repel root-knot nematodes and whiteflies via root chemicals</li>
<li>🌿 <strong>Basil</strong> near chillies and tomatoes — volatile oils deter aphids and spider mites</li>
<li>🧅 <strong>Garlic</strong> borders — broad-spectrum deterrent, repels aphids and fungal spores</li>
<li>🌸 <strong>Nasturtium</strong> as trap crop — aphids prefer it over vegetables; cut and discard when colonized</li>
<li>🌻 <strong>Sunflowers</strong> — attract predatory wasps that eat caterpillars and whiteflies</li>
</ul>
<h4>DIY Organic Sprays</h4>
<ul>
<li><strong>Garlic-Ginger Spray:</strong> Blend 10 garlic cloves + 5cm ginger + 5 chillies + 1L water. Strain through cloth. Dilute 1:10, spray weekly as prevention.</li>
<li><strong>Baking Soda Spray:</strong> 1 tsp baking soda + 1 tsp vegetable oil + 1L water. Prevents and treats powdery mildew effectively.</li>
<li><strong>Onion Peel Spray:</strong> Boil 1 cup onion peels in 1L water for 20 min. Cool, strain, spray directly on plants weekly.</li>
</ul>
<h4>Common Indian Garden Pests</h4>
<ul>
<li>🟡 <strong>Mealybugs:</strong> Cotton-like white masses. Alcohol swab + neem spray. Isolate plant immediately.</li>
<li>🕷️ <strong>Spider Mites:</strong> Tiny dots, webbing. Increase humidity, jet of water daily, neem spray. They hate humidity.</li>
<li>🐌 <strong>Snails/Slugs:</strong> Crushed eggshells, diatomaceous earth barrier around pot. Beer trap (shallow container of beer) overnight.</li>
<li>🪲 <strong>Caterpillars:</strong> Hand-pick at night with torch. Use Bt (Bacillus thuringiensis) biological spray — completely safe, kills only caterpillars.</li>
<li>🟢 <strong>Aphids:</strong> Strong water jet to dislodge. Introduce ladybugs or lacewings. Spray with neem oil.</li>
</ul>
<div class="guide-warning-box">⚠️ <strong>Important:</strong> Spray pesticides (even organic) only in the evening — never when bees are active (morning). Even neem oil can harm bees on direct contact.</div>`},
      {
        id: 'g4', emoji: '🌱', bg: '#f8ffe8', tag: 'Composting', title: 'Home Composting: Kitchen to Black Gold', desc: 'Turn food scraps into the richest plant food — step-by-step apartment composting.', time: '12 min read', difficulty: 1,
        content: `<h3>🌱 Home Composting Complete Guide</h3>
<p>Compost is called "black gold" for a reason: it transforms ordinary potting mix into a living, thriving soil ecosystem that feeds plants, improves drainage, suppresses disease, and reduces your dependence on chemical fertilizers. And it's free.</p>
<div class="guide-tip-box">💡 <strong>Quick Win:</strong> Even just adding finished compost as a 1-inch top dressing to existing pots monthly makes a dramatic difference in plant health and yield.</div>
<h4>What To Compost (and What Not To)</h4>
<ul>
<li>✅ Vegetable and fruit peels, tea bags, coffee grounds with filter</li>
<li>✅ Dry leaves, cardboard (no glossy coating), newspaper</li>
<li>✅ Grass clippings, plant trimmings, eggshells</li>
<li>✅ Hair, nails (slowly), wood ash (in small amounts)</li>
<li>❌ Meat, fish, dairy — attract pests and cause odour</li>
<li>❌ Diseased or pest-infested plants — spreads problems</li>
<li>❌ Oily or cooked food — slows decomposition</li>
<li>❌ Glossy paper, synthetic materials, charcoal ash</li>
</ul>
<h4>Apartment Composting Methods</h4>
<p><strong>1. Simple Container Method:</strong> Use a 20–30L container with a lid. Drill 10–15 small holes around the sides and bottom for aeration. Layer green (kitchen scraps) and brown (dry leaves, cardboard) material in 2:1 ratio by volume. Turn every 3–4 days. Ready in 2–3 months.</p>
<p><strong>2. Vermicompost (Fastest Method):</strong> Use red wiggler worms (Eisenia fetida, available online ₹200–500). They compost 3x faster than traditional methods. Maintain moisture like a wrung-out sponge. Harvest rich worm castings in 4–6 weeks. Worm liquid diluted 1:10 is an excellent liquid fertilizer.</p>
<h4>The Carbon:Nitrogen Ratio (The Most Important Principle)</h4>
<p>Successful composting requires balancing "Browns" (carbon-rich, dry) and "Greens" (nitrogen-rich, wet) in a roughly 2:1 ratio by volume. Too many greens = smelly, anaerobic pile. Too many browns = nothing happens. Adjust as needed.</p>
<h4>Troubleshooting Your Compost</h4>
<ul>
<li>😷 <strong>Smells bad:</strong> Too wet or too many greens. Add dry leaves/cardboard. Turn pile.</li>
<li>🐜 <strong>Ants:</strong> Pile too dry. Add water. Bury food scraps under brown material.</li>
<li>🐛 <strong>Nothing happening:</strong> Too dry, too cold, or no nitrogen. Add kitchen scraps and water.</li>
<li>🦟 <strong>Fruit flies:</strong> Always cover fresh scraps with a layer of brown material.</li>
</ul>
<h4>Using Finished Compost</h4>
<p>Finished compost is dark brown, crumbly, smells like earth (not rot), and has no recognizable food pieces. Apply as: 1-inch top dressing on pots monthly, mixed into new potting soil (20% by volume), or brewed into compost tea for foliar feeding.</p>`},
      {
        id: 'g5', emoji: '🌿', bg: '#e8fff0', tag: 'Herbs', title: 'Year-Round Herb Garden for Indian Homes', desc: 'Fresh basil, mint, coriander all year — with exact growing schedules for India.', time: '7 min read', difficulty: 1,
        content: `<h3>🌿 Year-Round Herb Garden Guide</h3>
<p>A kitchen windowsill herb garden is the most practical gardening project for urban Indian homes. Fresh herbs cost ₹20–50 per bunch at the market — but grow them yourself and you have a continuous supply for almost nothing.</p>
<h4>Essential Indian Kitchen Herbs & How to Grow Them</h4>
<ul>
<li>🌿 <strong>Mint (Pudina):</strong> Fastest-growing herb. Grows in partial shade (4h sun). Keep soil moist. Grows so aggressively it should be in its own pot — its roots invade neighbours. Propagate from cuttings — no seeds needed.</li>
<li>🌱 <strong>Coriander (Dhaniya):</strong> Sow seeds directly into pot (crush seeds gently first — each is actually two seeds). Harvest in 21–30 days. Sow every 3 weeks for continuous supply. Bolts in heat — grow Oct–Feb primarily.</li>
<li>🍃 <strong>Basil:</strong> Needs 6h full sun. Pinch flower heads immediately when they appear to prolong leaf harvest by months. Cut above a leaf node — 2 new branches form. More you harvest, more it grows.</li>
<li>🌿 <strong>Fenugreek (Methi):</strong> Sow densely, harvest as microgreens in 7 days or full leaves at 25 days. Grows best Oct–Feb. One of the most productive kitchen plants per sq cm.</li>
<li>🌱 <strong>Curry Leaf (Kadi Patta):</strong> Perennial tree. Start in a 10-inch pot, repot yearly. Feed monthly with vermicompost. Slow-growing initially but then very productive. Essential in South Indian cooking.</li>
</ul>
<h4>Indian Herb Growing Calendar</h4>
<ul>
<li>🌸 <strong>Oct–Feb (Winter):</strong> Coriander, fenugreek, dill, ajwain, spinach. Peak season for most herbs.</li>
<li>☀️ <strong>Mar–Jun (Summer):</strong> Basil, lemongrass, mint, curry leaves. Heat-lovers.</li>
<li>🌧️ <strong>Jul–Sep (Monsoon):</strong> Mint and tulsi thrive. Most others struggle — improve drainage, reduce watering.</li>
</ul>
<h4>Seed Germination Tips</h4>
<p>Sow seeds at a depth of 2–3x their diameter. Keep soil consistently moist (not wet) until germination. Cover pot with a clear plastic bag to create humidity — remove once seedlings emerge. Bottom heat (placing pots near a warm appliance) speeds germination.</p>
<div class="guide-tip-box">✂️ <strong>Harvest Tip:</strong> Always cut in the morning when herb oils are most concentrated and flavour is strongest. Never harvest more than ⅓ of the plant at once. Regular harvesting stimulates denser, bushier growth.</div>`},
      {
        id: 'g6', emoji: '🌸', bg: '#ffe8f4', tag: 'Flowers', title: 'Companion Flowers That Protect Vegetables', desc: 'Marigolds, nasturtiums, sunflowers — the science of companion planting.', time: '6 min read', difficulty: 2,
        content: `<h3>🌸 Companion Flowers Guide</h3>
<p>Companion planting is one of the oldest, best-documented techniques in organic gardening. Strategic placement of certain flowers creates a natural multi-layered defence system, attracts beneficial insects, and can even improve soil chemistry.</p>
<h4>Marigolds (Tagetes) — The Ultimate Companion</h4>
<p>Marigolds are the most widely researched companion plant. Their roots secrete a compound called <strong>alpha-terthienyl</strong> that kills root-knot nematodes — microscopic worms that destroy roots, especially of tomatoes. Their pungent flower scent also confuses and repels whiteflies, thrips, and tomato hornworms.</p>
<p>Plant French Marigolds (Tagetes patula, small bushy type) densely as a border around the entire vegetable bed, or 1–2 plants between every 3 tomato plants. For nematode control, plant densely and dig into soil at season end.</p>
<h4>Nasturtiums — The Sacrificial Trap Crop</h4>
<p>Nasturtiums are deliberately planted to attract aphids <em>away</em> from vegetables. Aphids colonize nasturtiums preferentially. When nasturtium is heavily colonized, cut the whole plant and dispose (don't compost). The aphid population dies with it. Meanwhile, the nasturtium also attracts hoverflies — whose larvae are voracious aphid predators.</p>
<p>Bonus: Nasturtium flowers and leaves are entirely edible with a peppery, watercress-like flavour. Flowers are beautiful in salads.</p>
<h4>Sunflowers — The Pollinator Magnet</h4>
<p>Plant tall sunflowers at the north or east edge of your garden (so they don't shade vegetables). Bees visit sunflowers in enormous numbers and then pollinate nearby tomatoes, chillies, cucumbers, and beans — dramatically improving fruit set. Sunflower pollen is also highly nutritious for bees.</p>
<h4>Best Companion Combinations for Indian Gardens</h4>
<ul>
<li>🍅 Tomatoes + French Marigold + Sweet Basil + Borage</li>
<li>🌶️ Chillies + Marigold + Nasturtium + Sweet Alyssum</li>
<li>🥬 Brassicas (cabbage, cauliflower) + Lavender + Rosemary + Nasturtium</li>
<li>🥒 Cucumber + Sunflower + Nasturtium + Borage</li>
<li>🫘 Beans + Summer Savory + Marigold</li>
</ul>
<div class="guide-tip-box">🌱 <strong>Where to Plant:</strong> Companion plants should be <em>interplanted</em> among vegetables, not kept separate. Border planting helps but close proximity is where the pest-deterring volatile chemicals have the most effect.</div>`},
    ];
    const marketItems = [
      { id: 1, img: 'https://www.ugaoo.com/cdn/shop/files/Cherry_Tomato_Red_100_GM.jpg?v=1756482675', name: 'Cherry Tomato Seeds', seller: 'Ugaoo', price: 119, mrp: 175, unit: 'per pack', tags: ['Vegetable', 'Bestseller'], category: 'Seeds', rating: 4.9, discount: 32, desc: 'Sweet, prolific cherry tomatoes for balcony container growing. High germination rate, easy to grow, harvest-ready in 70 days. Each plant produces hundreds of bite-sized red tomatoes.', specs: { 'Sowing Time': 'Jan–Mar, Sep–Nov', 'Days to Harvest': '65–75 days', 'Light': 'Full Sun 6h+', 'Pot Size': '10–12 inch' }, highlights: ['🍅 Hundreds of tomatoes per plant', '🌱 High germination rate (>85%)', '🪴 Perfect for 10-12 inch containers', '✂️ Harvest in just 70 days'] },
      { id: 2, img: 'https://www.ugaoo.com/cdn/shop/files/Spinach_Seeds_1.webp?v=1756728580', name: 'Spinach Seeds (Palak)', seller: 'Ugaoo', price: 99, mrp: 145, unit: 'per pack', tags: ['Vegetable', 'Bestseller'], category: 'Seeds', rating: 4.7, discount: 32, desc: 'Nutritious, fast-growing spinach ideal for kitchen gardens. Ready for first harvest in 30 days. Rich in iron, Vitamin A and C. Grow in wide, shallow containers.', specs: { 'Sowing Time': 'Oct–Feb', 'Days to Harvest': '30–40 days', 'Light': 'Partial Sun', 'Container': '6–8 inch deep tray' }, highlights: ['🥬 Ready in just 30 days', '💪 Rich in iron, vitamins A & C', '🌿 Sow every 3 weeks for continuous harvest', '🪴 Perfect for shallow trays'] },
      { id: 3, img: 'https://www.ugaoo.com/cdn/shop/files/Green_Chilli_1.jpg?v=1756485659', name: 'Green Chilli Seeds', seller: 'Ugaoo', price: 99, mrp: 145, unit: 'per pack', tags: ['Spice', 'Indian'], category: 'Seeds', rating: 4.9, discount: 32, desc: 'Long, slim green chillies — the essential Indian kitchen herb. Prolific producer on compact plants. One plant provides 50–100 chillies per season.', specs: { 'Sowing Time': 'Jan–Mar, Jul–Sep', 'Days to Harvest': '70–80 days', 'Light': 'Full Sun', 'Pot Size': '8–10 inch' }, highlights: ['🌶️ 50–100 chillies per plant per season', '☀️ Thrives in Indian summer heat', '🌱 Compact plant for balconies', '🍳 Essential Indian kitchen staple'] },
      { id: 4, img: 'https://www.ugaoo.com/cdn/shop/files/Coriander_Seeds_6_gm.jpg?v=1756483930', name: 'Coriander Seeds', seller: 'Ugaoo', price: 99, mrp: 145, unit: 'per pack', tags: ['Herb', 'Kitchen'], category: 'Seeds', rating: 4.6, discount: 32, desc: 'Fresh coriander in just 21 days. Most used herb in Indian cooking. Sow densely, harvest cut-and-come-again style. Best in cool weather Oct–Feb.', specs: { 'Sowing Time': 'Oct–Feb', 'Days to Harvest': '21–30 days', 'Light': 'Partial Shade', 'Tip': 'Sow every 3 weeks' }, highlights: ['🌿 Harvest in 21 days', '🍲 #1 most used Indian herb', '♻️ Re-sow every 3 weeks', '❄️ Thrives in cool weather'] },
      { id: 5, img: 'https://www.ugaoo.com/cdn/shop/files/Basil_100_GM.jpg?v=1756481494', name: 'Italian Basil Seeds', seller: 'Ugaoo', price: 119, mrp: 175, unit: 'per pack', tags: ['Herb', 'Bestseller'], category: 'Seeds', rating: 4.9, discount: 32, desc: 'Classic sweet Italian basil. Large aromatic leaves for pasta and pesto. Companion plant — repels aphids from nearby vegetables.', specs: { 'Sowing Time': 'Mar–Jun', 'Days to Harvest': '25–35 days', 'Light': 'Full Sun', 'Companion': 'Tomatoes, Peppers' }, highlights: ['🌿 Fragrant large-leaved Italian variety', '🍝 Perfect for pesto and pasta', '🐛 Natural aphid repellent', '✂️ More you harvest, more it grows'] },
      { id: 6, img: 'https://www.ugaoo.com/cdn/shop/files/Sunflower_Sungold_Seeds_100_GM.jpg?v=1756473099', name: 'Sunflower Sungold Seeds', seller: 'Ugaoo', price: 99, mrp: 155, unit: 'per pack', tags: ['Flower', 'Tall'], category: 'Seeds', rating: 4.8, discount: 36, desc: 'Stunning golden-orange double sunflowers. Grows 60–90cm tall. Attracts bees and birds. Spectacular statement on any terrace.', specs: { 'Sowing Time': 'Feb–Apr', 'Days to Bloom': '50–65 days', 'Height': '60–90 cm', 'Light': 'Full Sun' }, highlights: ['🌻 Stunning double golden blooms', '🐦 Attracts bees and butterflies', '🌱 Direct sow, easy to grow', '💐 Beautiful cut flower'] },
      { id: 7, img: 'https://www.ugaoo.com/cdn/shop/files/Tulsi_100_GM_copy.jpg?v=1756484110', name: 'Tulsi Seeds (Holy Basil)', seller: 'Ugaoo', price: 99, mrp: 145, unit: 'per pack', tags: ['Herb', 'Bestseller'], category: 'Seeds', rating: 4.7, discount: 32, desc: 'Sacred and medicinal holy basil. Rich in antioxidants. Used in Ayurveda. Natural mosquito repellent. Can be grown all year.', specs: { 'Sowing Time': 'All Year', 'Days to Harvest': '30–40 days', 'Light': 'Full Sun', 'Medicinal': 'Yes' }, highlights: ['🙏 Sacred plant for Indian homes', '💊 Ayurvedic medicinal properties', '🦟 Natural mosquito repellent', '🌿 Can be grown all year'] },
      { id: 8, img: 'https://www.ugaoo.com/cdn/shop/files/Zinnia_Double_1.5_gm.jpg?v=1756476330', name: 'Zinnia Double Mix Seeds', seller: 'Ugaoo', price: 99, mrp: 155, unit: 'per pack', tags: ['Flower', 'Popular'], category: 'Seeds', rating: 4.4, discount: 36, desc: 'Full, double-petalled zinnia flowers in gorgeous colours. Easiest annual flower for Indian gardens. Attracts butterflies and bees.', specs: { 'Sowing Time': 'Oct–Feb', 'Days to Bloom': '50–60 days', 'Light': 'Full Sun', 'Height': '30–60 cm' }, highlights: ['🦋 Attracts butterflies', '🌺 Double-petalled full blooms', '✂️ Excellent cut flower', '🌱 Minimal care needed'] },
      { id: 9, img: 'https://www.ugaoo.com/cdn/shop/files/1_65df4ea5-2702-4a23-b434-7dad643b4e03.jpg?v=1744815220', name: 'Areca Palm Plant XL', seller: 'Ugaoo', price: 1799, mrp: 2999, unit: 'XL size', tags: ['XL', 'Air-Purifying'], category: 'Plants', rating: 4.8, discount: 40, desc: 'Full-sized Areca Palm with 5–7 lush cane clusters. NASA top air purifier. Natural room humidifier. Pet-friendly.', specs: { Height: '4–5 ft', Light: 'Bright Indirect', Water: 'Every 3–4 days', Pet: 'Pet Friendly' }, highlights: ['🌿 NASA top-rated air purifier', '💦 Natural room humidifier', '🐾 Pet-friendly', '🌴 Vastu-approved'] },
      { id: 10, img: 'https://www.ugaoo.com/cdn/shop/files/Peace_Lily_copy.webp?v=1758701124', name: 'Peace Lily Plant', seller: 'Ugaoo', price: 249, mrp: 399, unit: 'with pot', tags: ['Indoor', 'Vastu'], category: 'Plants', rating: 4.7, discount: 38, desc: 'Beautiful white-spathe flowering houseplant that blooms year-round in low light. Self-watering indicator — droops slightly when thirsty.', specs: { Height: '30–45 cm', Light: 'Low to Medium Indirect', Water: 'Every 5–7 days', Blooms: 'Year-round' }, highlights: ['🌸 Blooms all year in low light', '💨 Removes 5 harmful air toxins', '💧 Wilts when thirsty — clear reminder', '🏠 Perfect for living rooms'] },
      { id: 11, img: 'https://www.ugaoo.com/cdn/shop/files/Snake_Plant_Reworked_copy.webp?v=1758720069', name: 'Snake Plant - Golden Hahnii', seller: 'Ugaoo', price: 249, mrp: 299, unit: 'with pot', tags: ['Vastu', 'Easy Care'], category: 'Plants', rating: 4.8, discount: 17, desc: 'Nearly indestructible dwarf snake plant. Tolerates extremely low light. Purifies air at night. Perfect for bedrooms.', specs: { Height: '15–25 cm', Light: 'Low to Bright Indirect', Water: 'Every 2–3 weeks', Specialty: 'Night O₂ release' }, highlights: ['🌙 Releases oxygen at night', '🔆 Tolerates very low light', '💪 Near-impossible to kill', '🏺 Compact for desks'] },
      { id: 12, img: 'https://www.ugaoo.com/cdn/shop/files/Lucky_Bamboo_3_Layer_copy.jpg?v=1758701120', name: 'Lucky Bamboo - 3 Layer', seller: 'Ugaoo', price: 349, mrp: 499, unit: 'per plant', tags: ['Vastu', 'Easy Care'], category: 'Plants', rating: 4.8, discount: 30, desc: '3-layer spiral lucky bamboo. Most popular Vastu plant. Grows in water or soil. Perfect gift.', specs: { Height: '25–35 cm', Light: 'Indirect', Water: 'Change water weekly', Medium: 'Water or Soil' }, highlights: ['🎋 Symbol of luck and prosperity', '💚 Grows in water — no soil', '🎁 Most popular gifting plant', '🏮 Perfect for office desks'] },
      { id: 13, img: 'https://www.ugaoo.com/cdn/shop/files/Pot-O-Mix-5Kg.jpg?v=1747483880', name: 'Pot-O-Mix Potting Mix', seller: 'Ugaoo', price: 379, mrp: 599, unit: '5 kg bag', tags: ['Potting Mix', 'Premium'], category: 'Plant Care', rating: 4.8, discount: 37, desc: 'Premium ready-to-use potting mix with perlite, cocopeat, and organic compost. Ideal for all container plants.', specs: { Type: 'Potting Mix', Weight: '5 kg', Suitable: 'All Plants', Composition: 'Cocopeat + Perlite + Compost' }, highlights: ['✅ Ready to use — no mixing', '🌱 Enriched with organic compost', '💧 Excellent water retention', '♻️ Peat-free sustainable formula'] },
      { id: 14, img: 'https://www.ugaoo.com/cdn/shop/files/Neem_Oil_250_ML.jpg?v=1747310957', name: 'Neem Oil (250 ml)', seller: 'Ugaoo', price: 269, mrp: 399, unit: '250 ml bottle', tags: ['Organic', 'Pest Control'], category: 'Plant Care', rating: 4.8, discount: 33, desc: 'Cold-pressed pure neem oil. Controls 200+ pest species. Safe for humans, pets, and beneficial insects.', specs: { Volume: '250 ml', Type: 'Pure Cold-Pressed', Usage: 'Dilute 5ml/L water', Certification: 'Organic' }, highlights: ['🐛 Controls 200+ pest species', '🌿 100% organic, pet-safe', '🪲 Fungicide & insecticide', '💧 Dilute 5ml per litre'] },
      { id: 15, img: 'https://www.ugaoo.com/cdn/shop/files/Sienna_Terracotta_Pots_-_Set_of_3.jpg?v=1747483880', name: 'Sienna Terracotta Pots - Set of 3', seller: 'Ugaoo', price: 999, mrp: 1499, unit: 'set of 3', tags: ['Terracotta', 'Set'], category: 'Pots', rating: 4.0, discount: 33, desc: 'Hand-finished terracotta pots in warm sienna glaze. Set of 3 graduating sizes. Porous clay aerates roots and prevents overwatering.', specs: { Sizes: '4, 5 & 6 inch', Material: 'Terracotta Clay', Finish: 'Sienna Glaze', Drainage: 'Yes' }, highlights: ['🏺 Porous clay prevents overwatering', '🌿 Natural root aeration', '✨ Hand-finished glaze', '📦 Set of 3 — great value'] },
      { id: 16, img: 'https://www.ugaoo.com/cdn/shop/files/Tokyo_Round_30_Sand_Small_da16b91a-f8be-48ce-8cc9-0280caa796bb.jpg?v=1749300037', name: 'Tokyo Round Planter', seller: 'Ugaoo', price: 1299, mrp: 1799, unit: 'per planter', tags: ['Modern', 'Lightweight'], category: 'Pots', rating: 4.6, discount: 28, desc: 'Minimalist Japanese-inspired planter in sand stone finish. Ultra-lightweight fiberglass. Weather-resistant for indoor and outdoor use.', specs: { Size: '30 cm diameter', Material: 'Fiberglass', Finish: 'Sand Stone', Weight: 'under 2 kg' }, highlights: ['🗾 Japanese minimalist design', '⚖️ Ultra-lightweight', '🌧️ Fully weatherproof', '🎨 Sand stone texture'] },
    ];

    // ==================== ORDER HISTORY ====================
    async function saveOrderHistory(order) {
      if (!currentUser) return;
      try {
        order.email = currentUser.email;
        await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
      } catch (e) { console.error('Failed to save order to DB:', e); }
    }

    async function renderOrderHistory() {
      const containerProfile = document.getElementById('orderHistoryList');
      const containerMarket = document.getElementById('marketOrderHistoryList');
      if (!currentUser) return;
      if (containerProfile) containerProfile.innerHTML = '<div style="text-align:center;padding:2rem;color:#8a9e8c;">Loading orders... ⏳</div>';
      if (containerMarket) containerMarket.innerHTML = '<div style="text-align:center;padding:2rem;color:#8a9e8c;">Loading orders... ⏳</div>';

      try {
        const res = await fetch('http://localhost:5000/api/orders?email=' + encodeURIComponent(currentUser.email));
        let orders = await res.json();

        if (!orders || !orders.length) {
          const msg = '<div style="text-align:center;padding:2rem;color:#8a9e8c;font-style:italic">No orders yet. Shop the Marketplace to get started! 🛒</div>';
          if (containerProfile) containerProfile.innerHTML = msg;
          if (containerMarket) containerMarket.innerHTML = msg;
          return;
        }
        if (containerProfile) containerProfile.innerHTML = '';
        if (containerMarket) containerMarket.innerHTML = '';
        orders.forEach(o => {
          const icon = o.type === 'Premium' ? '⭐' : '🛒';
          const div = document.createElement('div');
          div.style.cssText = 'background: var(--panel); border-radius: 16px; padding: 1.2rem 1.4rem; margin-bottom: .8rem; box-shadow: 0 4px 16px rgba(45, 90, 39, .07); border: 1px solid rgba(122, 158, 126, .1);';
          div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem">
        <div>
          <div style="font-weight:600;color:var(--forest);font-size:.95rem">${icon} ${o.type} — <span style="font-family:'Caveat',cursive;font-size:1rem">${o.orderNum}</span></div>
          <div style="font-size:.78rem;color:#8a9e8c;margin-top:.2rem">📅 ${o.date} &nbsp;·&nbsp; 💳 ${o.method}</div>
          <div style="font-size:.8rem;color:#6a8a6e;margin-top:.3rem">📦 ${o.items}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:1.15rem;font-weight:700;color:var(--forest)">${o.amount}</div>
          <div style="font-size:.72rem;padding:.15rem .65rem;background:#d4eed8;color:var(--forest);border-radius:50px;margin-top:.3rem;display:inline-block">✅ Confirmed</div>
        </div>
      </div>`;
          if (containerProfile) containerProfile.appendChild(div);
          if (containerMarket) containerMarket.appendChild(div.cloneNode(true));
        });
      } catch (err) {
        if (containerProfile) containerProfile.innerHTML = '<div style="text-align:center;padding:2rem;color:#e05252;">Failed to load order history.</div>';
        if (containerMarket) containerMarket.innerHTML = '<div style="text-align:center;padding:2rem;color:#e05252;">Failed to load order history.</div>';
        console.error(err);
      }
    }

    // ==================== STORAGE HELPERS ====================
    function saveUserDB() {
      try { localStorage.setItem(DB_KEY, JSON.stringify(userDB)); } catch (e) { }
    }
    function loadUserDB() {
      try { const d = localStorage.getItem(DB_KEY); if (d) userDB = JSON.parse(d); } catch (e) { }
    }
    function getUserData(email) {
      if (!userDB[email]) userDB[email] = {
        plants: [...defaultPlants.map(p => ({ ...p }))],
        tasks: [...defaultTasks.map(t => ({ ...t }))],
        harvest: 2.4,
        premium: false,
        premiumPlan: null,
        wateredToday: 0,
      };
      return userDB[email];
    }
    function getUsers() {
      try { const d = localStorage.getItem(USERS_KEY); return d ? JSON.parse(d) : {}; } catch (e) { return {}; }
    }
    function saveUsers(u) {
      try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch (e) { }
    }
    function saveSession(user) {
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch (e) { }
    }
    function loadSession() {
      try { const d = localStorage.getItem(SESSION_KEY); return d ? JSON.parse(d) : null; } catch (e) { return null; }
    }
    function clearSession() {
      try { localStorage.removeItem(SESSION_KEY); } catch (e) { }
    }

    // ==================== AUTH ====================

    function showAuthScreen(callback) {
      document.getElementById('authScreen').classList.remove('hidden');
      if (callback) window._authCallback = callback;
    }
    function closeAuthScreen() {
      document.getElementById('authScreen').classList.add('hidden');
      window._authCallback = null;
    }
    function switchAuthTab(tab) {
      document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
      document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
      document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
      document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    }
    function showAuthError(id, msg) {
      const el = document.getElementById(id); el.textContent = msg; el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
    }
    function doLogin() {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!email || !email.includes('@')) { showAuthError('loginError', 'Please enter a valid email'); return; }
      if (!password) { showAuthError('loginError', 'Please enter your password'); return; }
      const users = getUsers();
      if (users[email]) {
        if (users[email].password !== password) { showAuthError('loginError', 'Incorrect password'); return; }
        loginUser(users[email]);
      } else {
        // Auto-create account on first login (demo mode)
        const newUser = { email, name: email.split('@')[0].replace(/[^a-zA-Z ]/g, ' '), password, city: 'Bengaluru', joinDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), googleAuth: false };
        users[email] = newUser; saveUsers(users);
        loginUser(newUser);
      }
    }
    function doRegister() {
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const city = document.getElementById('regCity').value.trim() || 'India';
      if (!name) { showAuthError('registerError', 'Please enter your name'); return; }
      if (!email || !email.includes('@')) { showAuthError('registerError', 'Please enter a valid email'); return; }
      if (password.length < 6) { showAuthError('registerError', 'Password must be at least 6 characters'); return; }
      const users = getUsers();
      if (users[email]) { showAuthError('registerError', 'Account already exists. Please sign in.'); switchAuthTab('login'); return; }
      const newUser = { email, name, password, city, joinDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), googleAuth: false };
      users[email] = newUser; saveUsers(users);
      loginUser(newUser);
      showToast('🌱 Welcome to DailyGarden, ' + name + '!');
    }
    function doGoogleAuth() {
      // Redirect to the backend Google OAuth route
      window.location.href = 'http://localhost:5000/auth/google';
    }

    function loginUser(user) {
      currentUser = user;
      saveSession(user);
      loadUserDB();
      document.getElementById('authScreen').classList.add('hidden');
      // Reset page to home
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-home').classList.add('active');
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const navHome = document.getElementById('nav-home'); if (navHome) navHome.classList.add('active');
      updateNavUser();
      updateProfilePage();
      init();
      showToast('👋 Welcome back, ' + (user.name?.split(' ')[0] || 'Gardener') + '!');
    }
    async function doLogout() {
      try { await fetch('http://localhost:5000/api/logout', { credentials: 'include' }); } catch (e) { }
      currentUser = null;
      clearSession();
      tipsRendered = false;
      marketRendered = false;
      location.reload();
    }
    function toggleUserDropdown() {
      if (!currentUser) {
        showAuthScreen();
        return;
      }
      document.getElementById('userDropdown').classList.toggle('open');
    }
    function closeUserDropdown() {
      document.getElementById('userDropdown').classList.remove('open');
    }
    document.addEventListener('click', e => {
      if (!document.querySelector('.nav-user-wrap')?.contains(e.target)) {
        closeUserDropdown();
      }
    });
    function updateNavUser() {
      const nameEl = document.getElementById('navUserName');
      const avatarEl = document.getElementById('navUserAvatar');
      if (!currentUser) {
        if (nameEl) nameEl.textContent = 'Sign In';
        if (avatarEl) avatarEl.textContent = '?';
        return;
      }
      const initials = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G';
      if (avatarEl) avatarEl.textContent = initials;
      if (nameEl) nameEl.textContent = currentUser.name?.split(' ')[0] || 'Gardener';
    }
    function updateProfilePage() {
      if (!currentUser) return;
      const ud = getUserData(currentUser.email);
      // Profile hero
      const initials = currentUser.name?.charAt(0).toUpperCase() || 'G';
      document.getElementById('profileAvatar').textContent = currentUser.googleAuth ? 'G' : initials;
      document.getElementById('profileName').textContent = (currentUser.name || 'Gardener') + "'s Garden";
      document.getElementById('profileMeta').innerHTML = `<span>📧 ${currentUser.email}</span><span>📍 ${currentUser.city || 'India'}</span><span>🗓 Since ${currentUser.joinDate || '2024'}</span>`;
      document.getElementById('profileLocation').textContent = currentUser.city || 'India';
      document.getElementById('profileSince').textContent = currentUser.joinDate || '2024';
      document.getElementById('profileEmail').textContent = currentUser.email;
      const pc = document.getElementById('profilePlantCount'); if (pc) pc.textContent = ud.plants.length;
      // Hero greeting
      const greeting = document.getElementById('heroGreeting');
      if (greeting) {
        const h = new Date().getHours();
        const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        greeting.textContent = `${g}, ${currentUser.name?.split(' ')[0] || 'Gardener'}! Track your plants, get weather tips, and grow smarter.`;
      }
      // Weather city
      const wc = document.getElementById('weatherCity');
      if (wc) wc.textContent = '📍 ' + (currentUser.city || 'Bengaluru');
      // Premium status
      const ps = document.getElementById('premiumStatus');
      if (ps) ps.textContent = ud.premium ? `⭐ Premium (${ud.premiumPlan})` : 'Free Plan';
    }

    // ==================== INIT ====================
    let selectedEmoji = '🍅', selectedStage = '🌰 Seed', cart = [], marketFilter = 'All';
    let tipsRendered = false, marketRendered = false, profileRendered = false;

    function init() {
      if (!currentUser) return;
      const ud = getUserData(currentUser.email);
      renderTaskList(ud);
      renderHomePlants(ud);
      renderTimeline('tlSelector', 'tlEvents');
      renderCommunity();
      renderHarvest('harvestBody');
      renderTipsMarquee();
      updateStats(ud);
      createLeaves();
      setTodayDate();
      initCursorParticles();
    }

    function updateStats(ud) {
      if (!ud) return;
      document.getElementById('statPlants').textContent = ud.plants.length;
      document.getElementById('statWatered').textContent = ud.wateredToday || 0;
      document.getElementById('statHarvest').textContent = (ud.harvest || 0) + 'kg';
      document.getElementById('statAlert').textContent = ud.plants.filter(p => p.progress > 90).length;

      const heroAddBtn = document.getElementById('heroAddBtn');
      if (heroAddBtn) {
        heroAddBtn.innerHTML = ud.plants.length > 0 ? '🌱 Add Plant' : '🌱 Add First Plant';
      }
    }

    // ==================== TASKS ====================
    function renderTaskList(ud) {
      const tl = document.getElementById('taskList'); if (!tl) return;
      tl.innerHTML = '';
      (ud.tasks || defaultTasks).forEach(t => {
        const div = document.createElement('div');
        div.className = 'reminder-item';
        div.style.opacity = t.done ? .4 : 1;
        div.style.textDecoration = t.done ? 'line-through' : '';
        div.innerHTML = `<div class="reminder-dot ${t.dot}"></div><div class="reminder-text">${t.text}</div><div class="reminder-time">${t.time}</div>`;
        div.onclick = () => markTaskDone(t.id, ud, div);
        tl.appendChild(div);
      });
    }
    function markTaskDone(id, ud, el) {
      const t = ud.tasks.find(x => x.id === id);
      if (t && !t.done) {
        t.done = true; ud.wateredToday = (ud.wateredToday || 0) + 1;
        saveUserDB(); el.style.opacity = '.4'; el.style.textDecoration = 'line-through';
        updateStats(ud);
        showToast('✅ Task completed!');
      }
    }

    // ==================== PLANTS ====================
    function lighten(hex) { return '#' + hex.replace(/^#/, '').match(/.{2}/g).map(c => Math.min(255, parseInt(c, 16) + 40).toString(16).padStart(2, '0')).join(''); }

    function renderPlantGrid(cid, arr, max) {
      const g = document.getElementById(cid); if (!g) return;
      g.innerHTML = '';
      const list = max ? arr.slice(0, max) : arr;
      if (!list.length) { g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#8a9e8c;font-style:italic">No plants yet. Add your first plant! 🌱</div>'; return; }
      list.forEach((p, i) => {
        const card = document.createElement('div'); card.className = 'plant-card';
        card.style.animation = `fadeSlideUp .5s ${i * .07}s ease both`;
        card.innerHTML = `
      <div class="plant-img" style="background:linear-gradient(135deg,${p.color},${lighten(p.color)})">
        <span style="position:relative;z-index:1">${p.emoji}</span>
        <div class="plant-stage-badge">${p.stage}</div>
      </div>
      <div class="plant-body">
        <div class="plant-name">${p.name}</div>
        <div class="plant-variety">${p.variety}</div>
        <div class="plant-progress-bar"><div class="plant-progress-fill" style="width:0%" data-w="${p.progress}"></div></div>
        <div class="plant-meta">
          <span class="plant-days">Day ${p.days} · ${p.garden}</span>
          <button class="water-btn" onclick="waterPlant(event,${p.id})">💧 Water</button>
        </div>
      </div>`;
        card.querySelector('.plant-body').addEventListener('click', e => { if (!e.target.classList.contains('water-btn')) openPlantDetail(p.id); });
        card.querySelector('.plant-img').addEventListener('click', () => openPlantDetail(p.id));
        g.appendChild(card);
        setTimeout(() => { const f = card.querySelector('.plant-progress-fill'); if (f) f.style.width = p.progress + '%'; }, 300 + i * 80);
      });
    }

    function renderHomePlants(ud) {
      const d = ud || getUserData(currentUser?.email);
      renderPlantGrid('homePlantsGrid', d.plants, 4);
      updateStats(d);
    }
    function renderPlantsPage() {
      const ud = getUserData(currentUser?.email);
      renderPlantGrid('plantsPageGrid', ud.plants);
      document.getElementById('plantsPageCount').textContent = `(${ud.plants.length})`;
      renderHarvest('harvestBody2');
      renderPlantFilters(ud);
    }
    function renderPlantFilters(ud) {
      const f = document.getElementById('plantFilters'); if (!f) return; f.innerHTML = '';
      ['All', 'Balcony', 'Indoor', 'Outdoor'].forEach(g => {
        const btn = document.createElement('button'); btn.className = 'market-pill' + (g === 'All' ? ' active' : ''); btn.textContent = g;
        btn.onclick = () => { f.querySelectorAll('.market-pill').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderPlantGrid('plantsPageGrid', g === 'All' ? ud.plants : ud.plants.filter(p => p.garden.includes(g))); };
        f.appendChild(btn);
      });
    }
    function waterPlant(e, id) {
      e.stopPropagation();
      const btn = e.target;
      btn.textContent = '✅ Watered!'; btn.style.background = '#7dbd78'; btn.style.color = 'white';
      const ud = getUserData(currentUser?.email);
      ud.wateredToday = (ud.wateredToday || 0) + 1;
      saveUserDB(); updateStats(ud);
      showToast('💧 Plant watered!');
      for (let i = 0; i < 4; i++) { const d = document.createElement('div'); d.className = 'cursor-particle'; d.style.cssText = `left:${e.clientX - 10 + Math.random() * 20}px;top:${e.clientY - 10}px;`; d.textContent = '💧'; document.body.appendChild(d); setTimeout(() => d.remove(), 900); }
      setTimeout(() => { btn.textContent = '💧 Water'; btn.style.background = ''; btn.style.color = ''; }, 2000);
    }

    // ==================== PLANT DETAIL ====================
    function openPlantDetail(id) {
      const ud = getUserData(currentUser?.email);
      const p = ud.plants.find(x => x.id === id); if (!p) return;
      const stages = ['Seed', 'Sprout', 'Vegetative', 'Flowering', 'Harvest'];
      const si = stages.indexOf(p.stage);
      document.getElementById('detailModal').innerHTML = `
    <div class="plant-detail-hero" style="background:linear-gradient(135deg,${p.color},${lighten(p.color)})">${p.emoji}</div>
    <div style="padding:1.4rem 2rem 2rem">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.25rem">
        <h2 style="font-family:'Playfair Display',serif;font-size:1.7rem;color:var(--forest)">${p.name}</h2>
        <span style="font-size:.75rem;background:var(--mist);color:var(--forest);padding:.18rem .75rem;border-radius:50px">${p.stage}</span>
      </div>
      <div style="font-size:.85rem;color:#8a9e8c;font-style:italic;margin-bottom:1.1rem">${p.variety} · ${p.garden} · Day ${p.days}</div>
      <div style="margin-bottom:1.1rem">
        <div style="font-size:.78rem;color:#8a9e8c;margin-bottom:.4rem">Growth Progress — ${p.progress}%</div>
        <div class="plant-progress-bar" style="height:8px"><div class="plant-progress-fill" style="width:0%" data-w="${p.progress}"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:.3rem">
          ${stages.map((s, i) => `<span style="font-size:.68rem;color:${i <= si ? 'var(--forest)' : '#ccc'};font-weight:${i === si ? '600' : '400'}">${s}</span>`).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.7rem;margin-bottom:1.3rem">
        <div class="analytics-card" style="padding:.9rem;text-align:center"><div style="font-size:1.3rem">💧</div><div style="font-size:1.1rem;font-weight:700;color:var(--forest)">Every ${p.water}d</div><div style="font-size:.72rem;color:#8a9e8c">Watering</div></div>
        <div class="analytics-card" style="padding:.9rem;text-align:center"><div style="font-size:1.3rem">🗓</div><div style="font-size:1.1rem;font-weight:700;color:var(--forest)">${p.days}</div><div style="font-size:.72rem;color:#8a9e8c">Days Old</div></div>
        <div class="analytics-card" style="padding:.9rem;text-align:center"><div style="font-size:1.3rem">📈</div><div style="font-size:1.1rem;font-weight:700;color:var(--forest)">${p.progress}%</div><div style="font-size:.72rem;color:#8a9e8c">Progress</div></div>
      </div>
      <div style="margin-bottom:1.3rem"><div style="font-size:.83rem;font-weight:600;margin-bottom:.5rem;color:var(--soil)">📝 Care Notes</div><div class="note-item">📌 ${p.notes}</div></div>
      <div class="modal-btns">
        <button class="btn-cancel" onclick="closeDetail()">Close</button>
        <button class="btn-save" onclick="waterPlantFromDetail(${p.id})">💧 Water Now</button>
      </div>
    </div>`;
      document.getElementById('detailOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { const f = document.querySelector('#detailModal .plant-progress-fill'); if (f) f.style.width = p.progress + '%'; }, 200);
    }
    function waterPlantFromDetail(id) {
      const ud = getUserData(currentUser?.email);
      ud.wateredToday = (ud.wateredToday || 0) + 1; saveUserDB(); updateStats(ud);
      const ud2 = getUserData(currentUser?.email); const p = ud2.plants.find(x => x.id === id);
      showToast('💧 ' + (p?.name || 'Plant') + ' watered!'); closeDetail();
    }
    function closeDetail() { document.getElementById('detailOverlay').classList.remove('open'); document.body.style.overflow = ''; }
    function closeDetailOutside(e) { if (e.target === document.getElementById('detailOverlay')) closeDetail(); }

    // ==================== TIMELINE ====================
    function renderTimeline(selId, evId) {
      const sel = document.getElementById(selId), evEl = document.getElementById(evId);
      if (!sel || !evEl) return; sel.innerHTML = '';
      const keys = Object.keys(timelineData);
      keys.forEach((k, i) => {
        const chip = document.createElement('div'); chip.className = 'tl-chip' + (i === 0 ? ' active' : ''); chip.textContent = k;
        chip.onclick = () => { sel.querySelectorAll('.tl-chip').forEach(c => c.classList.remove('active')); chip.classList.add('active'); showTL(evEl, k); };
        sel.appendChild(chip);
      });
      showTL(evEl, keys[0]);
    }
    function showTL(el, key) {
      el.innerHTML = '';
      (timelineData[key] || []).forEach((e, i) => {
        const d = document.createElement('div'); d.className = 'tl-event' + (e.milestone ? ' milestone' : ''); d.style.animationDelay = `${i * .07}s`;
        d.innerHTML = `<div class="tl-date">${e.date}</div><div class="tl-text">${e.text}</div>`; el.appendChild(d);
      });
    }

    // ==================== COMMUNITY ====================
    function renderCommunity() {
      const feed = document.getElementById('communityFeed'); if (!feed) return;
      feed.innerHTML = '';
      const colors = ['#ffd6cc', '#d6f0cc', '#cce0f0', '#f0d6cc'];
      communityPosts.forEach(p => {
        const div = document.createElement('div'); div.className = 'community-post';
        div.innerHTML = `<div class="avatar" style="background:${colors[Math.floor(Math.random() * 4)]}">${p.avatar}</div><div style="flex:1"><div class="post-author">${p.name}</div><div class="post-text">${p.text}</div><div class="post-meta"><span>${p.time}</span><span class="post-like" onclick="likePost(this)">❤️ ${p.likes}</span></div></div>`;
        feed.appendChild(div);
      });
    }
    function likePost(el) { const n = parseInt(el.textContent.split(' ')[1]) + 1; el.textContent = `❤️ ${n}`; el.style.transform = 'scale(1.5)'; setTimeout(() => el.style.transform = '', 300); }

    // ==================== HARVEST ====================
    function renderHarvest(tbodyId) {
      const tbody = document.getElementById(tbodyId); if (!tbody) return;
      tbody.innerHTML = '';
      const colors = { Ready: '#4a9e5c', 'On Track': '#74b9e8', Harvesting: '#7dbd78', 'Early Stage': '#f0c040' };
      harvestData.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="font-weight:600">${h.plant}</td><td>${h.planted}</td><td>${h.expected}</td><td><span class="qty-badge">${h.qty}</span></td><td><span style="color:${colors[h.status] || '#888'};font-weight:500">${h.status}</span></td>`;
        tbody.appendChild(tr);
      });
    }

    // ==================== TIPS MARQUEE ====================
    function renderTipsMarquee() {
      const track = document.getElementById('tipTrack'); if (!track) return; track.innerHTML = '';
      [...tips, ...tips].forEach(t => { const span = document.createElement('span'); span.className = 'tip-item'; span.innerHTML = `${t}<span style="opacity:.3;margin-left:1rem">•</span>`; track.appendChild(span); });
    }

    // ==================== TIPS PAGE ====================
    function renderTipsPage() {
      const sg = document.getElementById('seasonsGrid');
      seasons.forEach(s => {
        const c = document.createElement('div'); c.className = 'season-card' + (s.active ? ' active-season' : '');
        c.innerHTML = `<div class="season-icon">${s.icon}</div><div class="season-name">${s.name}</div><div class="season-tip">${s.tip}</div>`;
        c.onclick = () => { sg.querySelectorAll('.season-card').forEach(x => x.classList.remove('active-season')); c.classList.add('active-season'); showToast(`${s.icon} ${s.name} tips selected!`); };
        sg.appendChild(c);
      });
      const gg = document.getElementById('guidesGrid');
      guides.forEach((g, i) => {
        const c = document.createElement('div'); c.className = 'guide-card'; c.style.animation = `fadeSlideUp .5s ${i * .06}s ease both`;
        const dots = Array.from({ length: 3 }, (_, j) => `<div class="diff-dot ${j < g.difficulty ? 'filled' : ''}"></div>`).join('');
        c.innerHTML = `<div class="guide-img" style="background:${g.bg}">${g.emoji}</div><div class="guide-body"><div class="guide-tag">${g.tag}</div><div class="guide-title">${g.title}</div><div class="guide-desc">${g.desc}</div><div class="guide-meta"><span>📖 ${g.time}</span><div class="difficulty">${dots}</div></div></div>`;
        c.onclick = () => openGuide(g.id); gg.appendChild(c);
      });
      const fl = document.getElementById('faqList');
      faqs.forEach(f => {
        const item = document.createElement('div'); item.className = 'faq-item';
        item.innerHTML = `<div class="faq-q">${f.q}<span class="faq-arrow">▾</span></div><div class="faq-a">${f.a}</div>`;
        item.querySelector('.faq-q').onclick = () => { const open = item.classList.contains('open'); document.querySelectorAll('.faq-item').forEach(x => x.classList.remove('open')); if (!open) item.classList.add('open'); };
        fl.appendChild(item);
      });
      const ct = document.getElementById('careTipsGrid');
      careTipsData.forEach(t => {
        const c = document.createElement('div'); c.className = 'analytics-card';
        c.innerHTML = `<div class="analytics-icon">${t.icon}</div><div class="analytics-val">${t.val}</div><div class="analytics-lbl">${t.lbl}</div><div class="analytics-trend" style="color:var(--sage)">${t.trend}</div>`;
        ct.appendChild(c);
      });
    }

    // ==================== GUIDE MODAL ====================
    function openGuide(id) {
      const g = guides.find(x => x.id === id); if (!g) return;
      const dots = Array.from({ length: 3 }, (_, j) => `<div class="diff-dot ${j < g.difficulty ? 'filled' : ''}"></div>`).join('');
      document.getElementById('guideModalContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;gap:1rem">
      <div>
        <div style="font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--sage);margin-bottom:.4rem">${g.tag}</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--forest);line-height:1.2">${g.title}</div>
        <div style="display:flex;align-items:center;gap:1rem;margin-top:.5rem;font-size:.8rem;color:#8a9e8c">
          <span>📖 ${g.time}</span><span style="display:flex;align-items:center;gap:4px">Difficulty: <span style="display:inline-flex;gap:2px">${dots}</span></span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:.5rem">
        <div style="width:56px;height:56px;background:${g.bg};border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:2.2rem">${g.emoji}</div>
        <button onclick="closeGuideModal()" style="background:var(--mist);border:none;cursor:pointer;padding:.35rem .9rem;border-radius:50px;font-size:.78rem;color:var(--moss);font-family:'DM Sans',sans-serif">✕ Close</button>
      </div>
    </div>
    <div style="height:1px;background:rgba(122,158,126,.12);margin-bottom:1.4rem"></div>
    <div class="guide-article-body" style="font-size:.9rem;line-height:1.8">${g.content}</div>
    <div style="margin-top:1.8rem;padding:1rem 1.2rem;background:linear-gradient(135deg,#f0faf0,#e8f5e0);border-radius:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.8rem">
      <div><div style="font-weight:600;color:var(--forest);font-size:.9rem">🛒 Shop supplies mentioned in this guide</div><div style="font-size:.78rem;color:#8a9e8c;margin-top:.2rem">Up to 40% off in our marketplace</div></div>
      <button class="btn-primary btn-sm" onclick="closeGuideModal();showPage('market')">Shop Now →</button>
    </div>`;
      document.getElementById('guideModalOverlay').classList.add('open'); document.body.style.overflow = 'hidden';
    }
    function closeGuideModal() { document.getElementById('guideModalOverlay').classList.remove('open'); document.body.style.overflow = ''; }
    function closeGuideModalOutside(e) { if (e.target === document.getElementById('guideModalOverlay')) closeGuideModal(); }

    // ==================== PROFILE PAGE ====================
    function renderProfileAchievements() {
      const ach = document.getElementById('achievements'); if (!ach || ach.children.length) return;
      achievements.forEach(a => {
        const c = document.createElement('div'); c.className = 'achievement' + (a.locked ? ' ach-locked' : '');
        c.innerHTML = `<div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div>`;
        if (!a.locked) c.onclick = () => showToast(`🏆 ${a.name} unlocked!`);
        ach.appendChild(c);
      });
    }

    // ==================== MARKETPLACE ====================
    function renderMarket() {
      const mf = document.getElementById('marketFilters'); if (!mf) return; mf.innerHTML = '';
      ['All', 'Seeds', 'Plants', 'Pots', 'Plant Care'].forEach(cat => {
        const btn = document.createElement('button'); btn.className = 'market-pill' + (cat === 'All' ? ' active' : ''); btn.textContent = cat;
        btn.onclick = () => { mf.querySelectorAll('.market-pill').forEach(b => b.classList.remove('active')); btn.classList.add('active'); marketFilter = cat; renderMarketGrid(); };
        mf.appendChild(btn);
      });
      renderMarketGrid();
      // Top sellers
      const ts = document.getElementById('topSellers'); if (!ts || ts.children.length) return;
      [{ avatar: '🌿', name: 'Ugaoo Official', items: '200+ products', rating: '4.9', sales: '50k+ orders' }, { avatar: '🧑‍🌾', name: 'NatureSeed Co.', items: '47 items', rating: '4.7', sales: '2.3k sales' }, { avatar: '🪴', name: 'GreenEarth Farms', items: '23 items', rating: '4.6', sales: '1.1k sales' }].forEach(s => {
        const row = document.createElement('div'); row.className = 'info-row'; row.style.padding = '.8rem 0';
        row.innerHTML = `<div style="display:flex;align-items:center;gap:.8rem"><div class="avatar" style="background:#d4eed8">${s.avatar}</div><div><div style="font-weight:600">${s.name}</div><div style="font-size:.75rem;color:#8a9e8c">${s.items}</div></div></div><div style="text-align:right"><div style="font-weight:600;color:var(--forest)">★ ${s.rating}</div><div style="font-size:.75rem;color:#8a9e8c">${s.sales}</div></div>`;
        ts.appendChild(row);
      });
    }

    function renderMarketGrid() {
      const mg = document.getElementById('marketGrid'); if (!mg) return; mg.innerHTML = '';
      const filtered = marketFilter === 'All' ? marketItems : marketItems.filter(i => i.category === marketFilter);
      if (!filtered.length) { mg.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#8a9e8c">No products in this category.</div>'; return; }
      filtered.forEach((item, idx) => {
        const inCart = cart.find(c => c.id === item.id);
        const starStr = '⭐'.repeat(Math.round(item.rating)).padEnd(5, '☆').slice(0, 5);
        const card = document.createElement('div'); card.className = 'market-card'; card.style.animation = `fadeSlideUp .5s ${idx * .04}s ease both`;
        card.innerHTML = `
      <div class="market-img" onclick="openProductDetail(${item.id})" style="cursor:pointer">
        <img src="${item.img}" alt="${item.name}" loading="lazy" style="display:block" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="market-img-fallback" style="display:none">🌿</div>
        ${item.discount ? `<div class="discount-badge">-${item.discount}%</div>` : ''}
        <div class="ugaoo-badge">⭐ ${item.seller}</div>
      </div>
      <div class="market-body">
        <div class="market-tags">${(item.tags || []).map(t => `<span class="market-tag">${t}</span>`).join('')}</div>
        <div class="market-name" onclick="openProductDetail(${item.id})" style="cursor:pointer">${item.name}</div>
        <div class="market-seller" style="display:flex;align-items:center;gap:.3rem">
          <span class="market-stars">${'★'.repeat(Math.round(item.rating))}</span>
          <span style="font-size:.72rem;color:#8a9e8c">${item.rating}</span>
        </div>
        <div class="market-price-row">
          <div class="market-price">₹${item.price.toLocaleString('en-IN')}</div>
          ${item.mrp ? `<div class="market-price-mrp">₹${item.mrp}</div>` : ''}
          <div class="market-unit">${item.unit}</div>
        </div>
        <div class="market-actions">
          <button class="market-btn${inCart ? ' in-cart' : ''}" onclick="addToCart(${item.id},this)">${inCart ? '✓ In Cart' : '🛒 Add'}</button>
          <button class="market-btn outline" onclick="openProductDetail(${item.id})">Details</button>
        </div>
      </div>`;
        mg.appendChild(card);
      });
    }

    // ==================== PRODUCT DETAIL MODAL ====================
    let prodQty = 1, prodCurrentId = null;
    function openProductDetail(id) {
      const item = marketItems.find(i => i.id === id); if (!item) return;
      prodQty = 1; prodCurrentId = id;
      const inCart = cart.find(c => c.id === id);
      const starsHtml = '★'.repeat(Math.round(item.rating)) + '☆'.repeat(5 - Math.round(item.rating));
      const specsHTML = item.specs ? `<div class="prod-modal-specs">${Object.entries(item.specs).map(([k, v]) => `<div class="prod-spec"><div class="prod-spec-label">${k}</div><div class="prod-spec-val">${v}</div></div>`).join('')}</div>` : '';
      const highlightsHTML = item.highlights ? `<div class="prod-highlights">${item.highlights.map(h => { const sp = h.indexOf(' '); return `<div class="prod-highlight-item"><span>${h.slice(0, sp)}</span><span>${h.slice(sp + 1)}</span></div>`; }).join('')}</div>` : '';
      document.getElementById('prodModalContent').innerHTML = `
    <div class="prod-modal-left">
      <img src="${item.img}" alt="${item.name}" style="display:block" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="prod-modal-left-fallback" style="display:none;font-size:5rem;background:#e8f5e0">🌿</div>
      ${item.discount ? `<div class="prod-disc-badge">-${item.discount}% OFF</div>` : ''}
      <button class="prod-modal-close" onclick="closeProductDetail()">✕</button>
    </div>
    <div class="prod-modal-right">
      <div class="prod-modal-cat">${item.category} · ${item.seller}</div>
      <div class="prod-modal-name">${item.name}</div>
      <div class="prod-modal-rating"><span class="prod-modal-stars">${starsHtml}</span><span>${item.rating} rating</span></div>
      <div class="prod-modal-price-row">
        <div class="prod-modal-price">₹${item.price.toLocaleString('en-IN')}</div>
        ${item.mrp ? `<div class="prod-modal-mrp">₹${item.mrp.toLocaleString('en-IN')}</div><div class="prod-modal-save">Save ₹${(item.mrp - item.price).toLocaleString('en-IN')}</div>` : ''}
      </div>
      <div class="prod-modal-tags">${(item.tags || []).map(t => `<span class="prod-modal-tag">${t}</span>`).join('')} <span class="prod-modal-tag">${item.unit}</span></div>
      <div class="prod-modal-divider"></div>
      ${item.desc ? `<div class="prod-modal-desc">${item.desc}</div>` : ''}
      ${specsHTML}${highlightsHTML}
      <div class="prod-modal-divider"></div>
      <div class="prod-modal-qty">
        <span style="font-size:.83rem;color:#8a9e8c;margin-right:.4rem">Qty:</span>
        <button class="prod-qty-btn" onclick="changeProdQty(-1)">−</button>
        <span class="prod-qty-val" id="prodQtyVal">1</span>
        <button class="prod-qty-btn" onclick="changeProdQty(1)">+</button>
        <span style="font-size:.82rem;color:#8a9e8c;margin-left:.5rem">Total: <strong id="prodQtyTotal">₹${item.price.toLocaleString('en-IN')}</strong></span>
      </div>
      <div class="prod-modal-actions">
        <button class="prod-add-btn${inCart ? ' added' : ''}" id="prodAddBtn" onclick="addToCartFromModal(${item.id})">${inCart ? '✓ Added to Cart' : '🛒 Add to Cart'}</button>
        <button class="prod-wish-btn" onclick="addToWishlist(${item.id},this)">♡ Wishlist</button>
      </div>
    </div>`;
      document.getElementById('prodModalOverlay').classList.add('open'); document.body.style.overflow = 'hidden';
    }
    function closeProductDetail() { document.getElementById('prodModalOverlay').classList.remove('open'); document.body.style.overflow = ''; }
    function closeProdModalOutside(e) { if (e.target === document.getElementById('prodModalOverlay')) closeProductDetail(); }
    function changeProdQty(delta) {
      prodQty = Math.max(1, prodQty + delta);
      document.getElementById('prodQtyVal').textContent = prodQty;
      const item = marketItems.find(i => i.id === prodCurrentId);
      if (item) document.getElementById('prodQtyTotal').textContent = '₹' + (item.price * prodQty).toLocaleString('en-IN');
    }
    function addToCartFromModal(id) {
      const item = marketItems.find(i => i.id === id); if (!item) return;
      const ex = cart.find(c => c.id === id);
      if (ex) ex.qty += prodQty; else cart.push({ ...item, qty: prodQty });
      updateCartUI(); renderMarketGrid();
      const btn = document.getElementById('prodAddBtn'); if (btn) { btn.textContent = '✓ Added!'; btn.classList.add('added'); }
      showToast(`🛒 ${item.name} × ${prodQty} added to cart!`);
    }
    function addToWishlist(id, btn) {
      const item = marketItems.find(i => i.id === id);
      if (btn) { btn.textContent = '♥ Saved!'; btn.style.color = '#e05252'; }
      showToast('💚 ' + (item ? item.name : 'Item') + ' saved to wishlist!');
    }
    function addToCart(id, btn) {
      const item = marketItems.find(i => i.id === id); if (!item) return;
      const ex = cart.find(c => c.id === id);
      if (ex) ex.qty++; else cart.push({ ...item, qty: 1 });
      if (btn) { btn.textContent = '✓ In Cart'; btn.classList.add('in-cart'); }
      updateCartUI(); showToast(`🛒 ${item.name} added!`);
    }
    function changeQty(id, delta) { const item = cart.find(c => c.id === id); if (!item) return; item.qty += delta; if (item.qty <= 0) removeFromCart(id); else { updateCartUI(); renderCartPanel(); } }
    function removeFromCart(id) { cart = cart.filter(c => c.id !== id); updateCartUI(); renderCartPanel(); renderMarketGrid(); }
    function toggleCart() { document.getElementById('cartPanel').classList.toggle('open'); renderCartPanel(); }
    function updateCartUI() {
      const n = cart.reduce((s, c) => s + c.qty, 0);
      document.getElementById('cartCountBtn').textContent = n;
      const badge = document.getElementById('cartBadge'); badge.textContent = n; badge.style.display = n > 0 ? 'flex' : 'none';
    }
    function renderCartPanel() {
      const body = document.getElementById('cartBody'), footer = document.getElementById('cartFooter');
      body.innerHTML = '';
      if (!cart.length) {
        body.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🌱</div>Your cart is empty.<br>Browse the Marketplace!</div>';
        footer.style.display = 'none'; return;
      }
      footer.style.display = 'block';
      cart.forEach(item => {
        const el = document.createElement('div'); el.className = 'cart-item';
        el.innerHTML = `<img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.display='none'"><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div><div class="cart-item-qty"><button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button><span style="font-size:.85rem;min-width:18px;text-align:center">${item.qty}</span><button class="qty-btn" onclick="changeQty(${item.id},1)">+</button></div></div><button style="background:none;border:none;cursor:pointer;color:#ccc;padding:.3rem" onmouseover="this.style.color='#e07070'" onmouseout="this.style.color='#ccc'" onclick="removeFromCart(${item.id})">✕</button>`;
        body.appendChild(el);
      });
      document.getElementById('cartTotal').textContent = `₹${cart.reduce((s, c) => s + c.price * c.qty, 0).toLocaleString('en-IN')}`;
    }
    function checkoutCart() {
      if (!cart.length) return;
      const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
      toggleCart();
      // Open modal in CART mode
      currentPlan = 'cart';
      // Switch modal header to cart mode
      document.getElementById('payModalTitle').textContent = '🛒 Complete Your Order';
      document.getElementById('payPlanToggle').style.display = 'none';
      document.getElementById('paySavings').style.display = 'none';
      document.getElementById('payAmount').textContent = '₹' + total.toLocaleString('en-IN');
      document.getElementById('payPeriod').textContent = 'one-time purchase';
      // Show cart summary, hide premium perks
      document.getElementById('premiumPerksSection').style.display = 'none';
      document.getElementById('cartSummarySection').style.display = 'block';
      // Render cart items in summary
      const summaryEl = document.getElementById('cartSummaryItems');
      summaryEl.innerHTML = '';
      cart.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid rgba(122,158,126,.08);font-size:.85rem';
        row.innerHTML = `<span style="display:flex;align-items:center;gap:.5rem"><img src="${item.img}" style="width:32px;height:32px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'">${item.name} ×${item.qty}</span><span style="font-weight:600;color:var(--forest)">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>`;
        summaryEl.appendChild(row);
      });
      document.getElementById('cartSummaryTotal').textContent = '₹' + total.toLocaleString('en-IN');
      // Set pay button amounts
      ['payBtnAmountCard', 'payBtnAmountUpi', 'payBtnAmountNet', 'payBtnAmountWallet'].forEach(id => {
        const el = document.getElementById(id); if (el) el.textContent = '₹' + total.toLocaleString('en-IN');
      });
      selectPayMethod(document.querySelector('.pay-method-tab'), 'card');
      document.getElementById('payModalOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    // ==================== PAYMENT MODAL ====================
    let currentPlan = 'monthly', selectedBank = null, selectedWallet = null, upiVerified = false;
    function openPayModal(plan) {
      currentPlan = plan || 'monthly';
      // Restore premium mode UI
      document.getElementById('payModalTitle').textContent = '🌿 DailyGarden Premium';
      document.getElementById('payPlanToggle').style.display = 'flex';
      document.getElementById('premiumPerksSection').style.display = 'block';
      document.getElementById('cartSummarySection').style.display = 'none';
      // Reset body content (in case it was replaced by success screen)
      switchPlan(currentPlan);
      selectPayMethod(document.querySelector('.pay-method-tab'), 'card');
      document.getElementById('payModalOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closePayModal() {
      document.getElementById('payModalOverlay').classList.remove('open');
      document.body.style.overflow = '';
      // Reset modal body back to default payment form (remove success screen if shown)
      const body = document.getElementById('payModalBody');
      if (body && body.querySelector('.pay-success')) {
        // Restore the payment form sections
        location.reload(); // simplest way to fully reset modal state after success
      }
    }
    function closePayModalOutside(e) { if (e.target === document.getElementById('payModalOverlay')) closePayModal(); }
    function switchPlan(plan) {
      currentPlan = plan; const isYearly = plan === 'yearly';
      document.getElementById('payBtnMonthly').classList.toggle('active', !isYearly);
      document.getElementById('payBtnYearly').classList.toggle('active', isYearly);
      document.getElementById('payAmount').textContent = isYearly ? '₹4,999' : '₹499';
      document.getElementById('payPeriod').textContent = isYearly ? 'per year · save ₹989!' : 'per month · cancel anytime';
      document.getElementById('paySavings').style.display = isYearly ? 'block' : 'none';
      document.getElementById('extraPerk').style.display = isYearly ? 'flex' : 'none';
      const amt = isYearly ? '₹4,999/year' : '₹499/month';
      ['payBtnAmountCard', 'payBtnAmountUpi', 'payBtnAmountNet', 'payBtnAmountWallet'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = amt; });
    }
    function selectPayMethod(el, method) {
      document.querySelectorAll('.pay-method-tab').forEach(m => m.classList.remove('active'));
      if (el) el.classList.add('active');
      document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + method); if (panel) panel.classList.add('active');
    }
    function selectBank(el, name) {
      document.querySelectorAll('.netbank-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active'); selectedBank = name; showToast(`🏦 ${name} selected`);
    }
    function selectWallet(el, name) {
      document.querySelectorAll('.wallet-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active'); selectedWallet = name; showToast(`👜 ${name} selected`);
    }
    function selectUpiApp(el, name) {
      document.querySelectorAll('.upi-app-btn').forEach(b => b.style.borderColor = '');
      el.style.borderColor = 'var(--sage)';
      document.getElementById('upiId').value = 'yourname@' + name.toLowerCase();
      showToast(`📱 ${name} selected`);
    }
    function copyUpiId() {
      const btn = document.getElementById('upiCopyBtn');
      navigator.clipboard.writeText('gardenlog@razorpay').catch(() => { });
      btn.textContent = '✓ Copied!'; btn.style.background = 'var(--forest)'; btn.style.color = 'white';
      setTimeout(() => { btn.textContent = 'Copy'; btn.style.background = ''; btn.style.color = ''; }, 2000);
      showToast('📋 UPI ID copied!');
    }
    function verifyUpi() {
      const id = document.getElementById('upiId').value.trim();
      const status = document.getElementById('upiVerifyStatus');
      if (!id || !id.includes('@')) { status.textContent = '❌ Enter a valid UPI ID (e.g. name@upi)'; status.style.color = '#e05252'; return; }
      status.textContent = '⏳ Verifying...'; status.style.color = '#888';
      setTimeout(() => {
        upiVerified = true; status.textContent = '✅ UPI ID verified successfully!'; status.style.color = '#4a9e5c';
      }, 1200);
    }
    function formatCard(el) { let v = el.value.replace(/\D/g, '').slice(0, 16); el.value = v.replace(/(.{4})/g, '$1 ').trim(); }
    function formatExpiry(el) { let v = el.value.replace(/\D/g, ''); if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2, 4); el.value = v; }

    function processPayment(method) {
      let valid = true, msg = '';
      if (method === 'card') {
        const num = document.getElementById('cardNum')?.value.replace(/\s/g, '');
        const exp = document.getElementById('cardExpiry')?.value;
        const cvv = document.getElementById('cardCvv')?.value;
        const name = document.getElementById('cardName')?.value.trim();
        if (!name) { valid = false; msg = 'Please enter cardholder name'; }
        else if (!num || num.length < 16) { valid = false; msg = 'Please enter a valid 16-digit card number'; }
        else if (!exp || exp.length < 7) { valid = false; msg = 'Please enter card expiry (MM / YY)'; }
        else if (!cvv || cvv.length < 3) { valid = false; msg = 'Please enter 3-digit CVV'; }
      } else if (method === 'upi') {
        const id = document.getElementById('upiId')?.value.trim();
        if (!upiVerified && (!id || !id.includes('@'))) { valid = false; msg = 'Please verify your UPI ID first'; }
      } else if (method === 'netbank') {
        if (!selectedBank) { valid = false; msg = 'Please select your bank'; }
      } else if (method === 'wallet') {
        if (!selectedWallet) { valid = false; msg = 'Please select a wallet'; }
      }
      if (!valid) { showToast('⚠️ ' + msg); return; }

      // For cart: validate delivery address
      if (currentPlan === 'cart') {
        const name = document.getElementById('addrName')?.value.trim();
        const phone = document.getElementById('addrPhone')?.value.trim();
        const line1 = document.getElementById('addrLine1')?.value.trim();
        const city = document.getElementById('addrCity')?.value.trim();
        const pin = document.getElementById('addrPin')?.value.trim();
        const state = document.getElementById('addrState')?.value.trim();
        if (!name) { showToast('⚠️ Please enter your full name'); return; }
        if (!phone || phone.length < 10) { showToast('⚠️ Please enter a valid phone number'); return; }
        if (!line1) { showToast('⚠️ Please enter your address'); return; }
        if (!city) { showToast('⚠️ Please enter your city'); return; }
        if (!pin || pin.length < 6) { showToast('⚠️ Please enter a valid 6-digit PIN code'); return; }
        if (!state) { showToast('⚠️ Please enter your state'); return; }
      }

      // Process
      const submitBtns = document.querySelectorAll('.pay-submit');
      submitBtns.forEach(b => { b.textContent = '⏳ Processing securely...'; b.disabled = true; });

      setTimeout(() => {
        submitBtns.forEach(b => { b.disabled = false; });
        if (currentPlan === 'cart') {
          // FIX: capture total & items BEFORE clearing cart
          const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
          const cartItemNames = cart.map(c => c.name + ' ×' + c.qty).join(', ');
          const orderNum = '#GL' + Math.floor(Math.random() * 90000 + 10000);
          const amtStr = '₹' + cartTotal.toLocaleString('en-IN');
          const addrCity = document.getElementById('addrCity')?.value.trim() || '';
          const addrPin = document.getElementById('addrPin')?.value.trim() || '';
          const addrLine1 = document.getElementById('addrLine1')?.value.trim() || '';
          const deliveryAddr = addrLine1 + ', ' + addrCity + ' - ' + addrPin;
          // Save order to history
          saveOrderHistory({ orderNum, amount: amtStr, method: method.toUpperCase(), items: cartItemNames, type: 'Shop Order', date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) });
          cart = []; updateCartUI(); renderMarketGrid();
          document.getElementById('payModalBody').innerHTML = renderPaySuccess('Order Placed! 🎉', 'Your items have been ordered and will arrive in 3–5 business days.', { Order: orderNum, Amount: amtStr, 'Delivery': deliveryAddr, Method: method.toUpperCase(), Status: 'Confirmed ✅' });
        } else {
          const ud = getUserData(currentUser?.email);
          ud.premium = true; ud.premiumPlan = currentPlan === 'yearly' ? 'Annual' : 'Monthly';
          saveUserDB(); updateProfilePage();
          const amount = currentPlan === 'yearly' ? '₹4,999' : '₹499';
          const orderNum = '#PR' + Math.floor(Math.random() * 90000 + 10000);
          const validUntil = currentPlan === 'yearly' ? 'Feb 2027' : 'Mar 2026';
          // Save premium order to history
          saveOrderHistory({ orderNum, amount, method: method.toUpperCase(), items: 'Premium ' + ud.premiumPlan + ' Plan', type: 'Premium', date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) });
          document.getElementById('payModalBody').innerHTML = renderPaySuccess('Premium Activated! ⭐', `Your ${ud.premiumPlan} plan is now active. Enjoy all benefits!`, { Plan: ud.premiumPlan, Amount: amount, Method: method.toUpperCase(), 'Valid Until': validUntil });
          triggerPremiumConfetti();
        }
      }, 2000);
    }
    function renderPaySuccess(title, desc, details) {
      const rows = Object.entries(details).map(([k, v]) => `<div class="pay-success-detail-row"><span style="color:#8a9e8c">${k}</span><span style="font-weight:600">${v}</span></div>`).join('');
      return `<div class="pay-success">
    <div class="pay-success-icon">🎉</div>
    <div class="pay-success-title">${title}</div>
    <div class="pay-success-desc">${desc}</div>
    <div class="pay-success-detail">${rows}</div>
    <button class="auth-btn-primary" onclick="closePayModal()">Continue Gardening 🌱</button>
  </div>`;
    }

    // ==================== ADD PLANT ====================
    function openModal() {
      if (!currentUser) { showAuthScreen(); return; }
      document.getElementById('modalOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); document.body.style.overflow = ''; }
    function closeModalOutside(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); }
    function selectEmoji(el) { document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected')); el.classList.add('selected'); selectedEmoji = el.dataset.emoji; }
    function selectStage(el) { document.querySelectorAll('.stage-chip').forEach(e => e.classList.remove('selected')); el.classList.add('selected'); selectedStage = el.textContent; }
    function setTodayDate() { const d = document.getElementById('plantDate'); if (d) d.value = new Date().toISOString().split('T')[0]; }
    function addPlant() {
      if (!currentUser) return;
      const name = document.getElementById('plantName').value.trim() || 'My Plant';
      const variety = document.getElementById('plantVariety').value.trim() || 'Unknown';
      const garden = document.getElementById('gardenType').value.replace(/[🌿🏡🪴🌱]/g, '').trim();
      const colors = ['#ffe0d6', '#d4eed8', '#d8f0d4', '#e0f0d4', '#f0e8d4'];
      const ud = getUserData(currentUser.email);
      ud.plants.push({ id: Date.now(), emoji: selectedEmoji, name, variety, stage: selectedStage.replace(/^\S+ /, ''), progress: 5, days: 1, water: parseInt(document.getElementById('waterFreq').value) || 2, garden, color: colors[Math.floor(Math.random() * 5)], notes: document.getElementById('plantNotes').value || 'No notes yet.' });
      saveUserDB(); renderHomePlants(ud);
      if (document.getElementById('page-plants').classList.contains('active')) renderPlantsPage();
      closeModal();
      showToast(`🌱 ${name} added to your garden!`);
      ['plantName', 'plantVariety', 'plantNotes'].forEach(id => document.getElementById(id).value = '');
    }

    // ==================== SEARCH ====================
    function globalSearch(q) {
      if (!q || !currentUser) return;
      const lower = q.toLowerCase();
      const ud = getUserData(currentUser.email);
      const match = ud.plants.find(p => p.name.toLowerCase().includes(lower));
      if (match) { showPage('plants'); setTimeout(() => showToast(`🔍 Found: ${match.name}`), 400); }
    }

    // ==================== DISEASE DETECTOR ====================
    function simulateDetect() { document.getElementById('fileInput').click(); }
    function processImage(e) {
      if (!e.target.files[0]) return;
      const area = document.querySelector('.detect-area');
      area.innerHTML = '<div class="detect-icon" style="animation:float 1s ease-in-out infinite">⏳</div><div class="detect-text">Analyzing with AI…</div>';
      setTimeout(() => {
        const result = diseaseResults[Math.floor(Math.random() * diseaseResults.length)];
        area.innerHTML = '<div class="detect-icon">✅</div><div class="detect-text">Analysis complete</div>';
        const resultEl = document.getElementById('detectResult'); resultEl.classList.add('show');
        document.getElementById('resultStatus').className = `result-status ${result.cls}`;
        document.getElementById('resultStatus').textContent = result.status;
        document.getElementById('resultDesc').textContent = result.desc;
        showToast('🔬 AI analysis complete!');
      }, 2000);
    }

    // ==================== PAGE NAV ====================
    function showPage(page) {
      if (['profile', 'market'].includes(page) && !currentUser) { showAuthScreen(() => showPage(page)); return; }
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');
      const nb = document.getElementById('nav-' + page); if (nb) nb.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (page === 'plants') renderPlantsPage();
      if (page === 'profile') { updateProfilePage(); renderProfileAchievements(); renderOrderHistory(); }
      if (page === 'tips' && !tipsRendered) { renderTipsPage(); tipsRendered = true; }
      if (page === 'market' && !marketRendered) { renderMarket(); marketRendered = true; }
    }

    // ==================== MISC ====================
    function triggerPremiumConfetti() {
      const colors = ['#f0c040', '#7dbd78', '#4285f4', '#e05252'];
      for (let i = 0; i < 60; i++) {
        const c = document.createElement('div');
        c.style.cssText = `position:fixed;width:8px;height:12px;background:${colors[Math.floor(Math.random() * colors.length)]};top:-20px;left:${Math.random() * 100}vw;z-index:9999;transform:rotate(${Math.random() * 360}deg);animation:fallConfetti ${1.5 + Math.random() * 2}s linear forwards;`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4000);
      }
      if (!document.getElementById('confettiStyle')) {
        const style = document.createElement('style');
        style.id = 'confettiStyle';
        style.innerHTML = `@keyframes fallConfetti { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`;
        document.head.appendChild(style);
      }
    }

    function openSettingsModal() {
      if (!currentUser) return;
      document.getElementById('settingsName').value = currentUser.name || '';
      document.getElementById('settingsModalOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeSettingsModal() {
      document.getElementById('settingsModalOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }
    function updateSettingsName() {
      const nm = document.getElementById('settingsName').value.trim();
      if (nm && currentUser) {
        currentUser.name = nm;
        const users = getUsers();
        if (users[currentUser.email]) {
          users[currentUser.email].name = nm;
          saveUsers(users);
        }
        updateNavUser();
        updateProfilePage();
        showToast('✅ Name updated successfully!');
      }
    }
    function updateTheme(val) {
      if (val === 'dark') {
        document.documentElement.style.setProperty('--cream', '#121212');
        document.documentElement.style.setProperty('--stone', '#1e1e1e');
        document.documentElement.style.setProperty('--soil', '#ffffff');
        document.documentElement.style.setProperty('--panel', '#1e1e1e');
        document.body.style.background = '#121212';
        document.body.style.color = '#ffffff';
      } else if (val === 'warm') {
        document.documentElement.style.setProperty('--cream', '#fff7e6');
        document.documentElement.style.setProperty('--stone', '#fff0d4');
        document.documentElement.style.setProperty('--soil', '#8b5e3c');
        document.documentElement.style.setProperty('--panel', '#fffdf8');
        document.body.style.background = '#fff7e6';
        document.body.style.color = 'var(--soil)';
      } else {
        document.documentElement.style.setProperty('--cream', '#faf6ee');
        document.documentElement.style.setProperty('--stone', '#f0f0ec');
        document.documentElement.style.setProperty('--soil', '#3d2b1f');
        document.documentElement.style.setProperty('--panel', '#ffffff');
        document.body.style.background = '#faf6ee';
        document.body.style.color = 'var(--soil)';
      }
      showToast('🎨 Theme updated!');
    }

    function copySaleCode(el) {
      navigator.clipboard.writeText('SAVE10').catch(() => { });
      const orig = el.textContent; el.textContent = '✓ Copied!';
      setTimeout(() => el.textContent = orig, 1500); showToast('📋 Coupon SAVE10 copied!');
    }
    function subscribeNewsletter() {
      const email = document.getElementById('nlEmail').value;
      if (!email || !email.includes('@')) { showToast('⚠️ Please enter a valid email'); return; }
      showToast('🌿 Subscribed! Welcome to DailyGarden newsletter.');
      document.getElementById('nlEmail').value = '';
    }
    function showToast(msg) {
      const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2800);
    }
    function createLeaves() {
      const c = document.getElementById('leafContainer');
      ['🍃', '🌿', '🍀', '🌱', '🌾'].forEach(e => {
        for (let i = 0; i < 2; i++) {
          const leaf = document.createElement('div'); leaf.className = 'leaf-float'; leaf.textContent = e;
          leaf.style.left = `${Math.random() * 100}vw`;
          leaf.style.animationDuration = `${15 + Math.random() * 20}s`;
          leaf.style.animationDelay = `${Math.random() * 20}s`;
          c.appendChild(leaf);
        }
      });
    }
    function initCursorParticles() {
      let last = 0;
      document.addEventListener('mousemove', e => {
        if (Date.now() - last < 130) return; last = Date.now();
        const emojis = ['✨', '🌿', '🌱', '💧', '🍃'];
        const p = document.createElement('div'); p.className = 'cursor-particle';
        p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
        p.textContent = emojis[Math.floor(Math.random() * 5)];
        document.body.appendChild(p); setTimeout(() => p.remove(), 900);
      });
    }

    // ==================== STARTUP ====================
    async function checkBackendSession() {
      try {
        const res = await fetch('http://localhost:5000/api/current_user', { credentials: 'include' });
        if (res.ok) {
          const u = await res.json();
          if (u && u.email) {
            const users = getUsers();
            if (!users[u.email]) {
              users[u.email] = {
                ...u,
                city: 'India',
                joinDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                googleAuth: true
              };
              saveUsers(users);
            }
            loginUser(users[u.email]);
          }
        }
      } catch (e) { console.error('Backend session check failed:', e); }
    }

    window.addEventListener('DOMContentLoaded', () => {
      loadUserDB();
      const session = loadSession();
      const urlParams = new URLSearchParams(window.location.search);

      if (session) {
        currentUser = session;
        document.getElementById('authScreen').classList.add('hidden');
        updateNavUser(); updateProfilePage(); init();
      } else if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        document.getElementById('authScreen').classList.add('hidden');
        updateNavUser();
        checkBackendSession();
      } else {
        document.getElementById('authScreen').classList.add('hidden');
        updateNavUser();
        checkBackendSession();
      }
      document.getElementById('loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
      document.getElementById('regEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
      document.getElementById('loginEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
      document.getElementById('regPassword').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
    });
    document.getElementById('regEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
    document.getElementById('loginEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    document.getElementById('regPassword').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeModal(); closeDetail(); closePayModal(); closeProductDetail(); closeGuideModal(); }
    });

    // Safety: close all overlays on load
    document.addEventListener('DOMContentLoaded', function () {
      ['authScreen'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });
      ['modalOverlay', 'payModalOverlay', 'prodModalOverlay', 'detailOverlay', 'guideModalOverlay'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('open');
      });
    });
  