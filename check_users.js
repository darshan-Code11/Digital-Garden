const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
});
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const users = await User.find({});
        console.log('Users in DB:', users);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
