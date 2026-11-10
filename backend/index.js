const dotenv = require("dotenv")
dotenv.config();

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dns = require("dns")

const app = express()
const Routes = require("./routes/route.js")

const PORT = process.env.PORT || 5000

// Configure DNS servers for Node.js (c-ares) to resolve MongoDB Atlas SRV records
// on systems where default DNS servers return 127.0.0.1 or fail SRV resolution
const customDns = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map(s => s.trim())
    : ['8.8.8.8', '8.8.4.4', '1.1.1.1'];
try {
    dns.setServers(customDns);
} catch (dnsErr) {
    console.warn("Could not set custom DNS servers:", dnsErr.message);
}

app.use(express.json({ limit: '10mb' }))
app.use(cors())

app.use('/', Routes);

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to MongoDB successfully");
        app.listen(PORT, () => {
            console.log(`Server started at port no. ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message || err);
        process.exit(1);
    });
