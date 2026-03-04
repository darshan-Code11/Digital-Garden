const mongoose = require('mongoose');
require('dotenv').config();

const plantSchema = new mongoose.Schema({
    name: String, reminderTime: String, waterFrequencyDays: Number,
    lastWatered: Date, email: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const userSchema = new mongoose.Schema({ name: String, email: String, phoneNumber: String });
const Plant = mongoose.model('Plant', plantSchema);
const User = mongoose.model('User', userSchema);

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const plants = await Plant.find().populate('userId');
    const now = new Date();
    console.log('\n=== PLANT REMINDER DIAGNOSIS ===');
    for (const p of plants) {
        const lastWatered = p.lastWatered || p._id.getTimestamp();
        const diffDays = Math.ceil(Math.abs(now - lastWatered) / (1000 * 60 * 60 * 24));

        let phone = p.userId?.phoneNumber || null;
        if (!phone && p.email) {
            const u = await User.findOne({ email: { $regex: new RegExp('^' + p.email + '$', 'i') } });
            phone = u?.phoneNumber || null;
        }

        console.log(`\nPlant: ${p.name}`);
        console.log(`  ⏰ Reminder Time: ${p.reminderTime || '09:00'}`);
        console.log(`  💧 Water every: ${p.waterFrequencyDays} days`);
        console.log(`  📅 Last watered: ${lastWatered.toISOString()}`);
        console.log(`  📊 Days since water: ${diffDays} (need >= ${p.waterFrequencyDays})`);
        console.log(`  📱 Phone found: ${phone || 'NONE'}`);
        console.log(`  ✅ Will SMS fire? ${phone && diffDays >= p.waterFrequencyDays ? 'YES ✅' : 'NO ❌ — ' + (!phone ? 'no phone' : `only ${diffDays} days, need ${p.waterFrequencyDays}`)}`);
    }
    process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
