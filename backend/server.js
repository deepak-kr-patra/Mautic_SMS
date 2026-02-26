import express from "express";
import axios from "axios";
import cors from "cors";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // disable cert check (for expired certs)

const app = express();
app.use(cors());
app.use(express.json());

const mautic = {
    baseUrl: process.env.BASE_URL || "https://jae.autovationpro.com",
    username: process.env.USERNAME || "ravi",
    password: process.env.PASSWORD || "Ravi@1985"
};

// 1️⃣ Get all SMS campaigns
app.get("/api/sms", async (req, res) => {
    try {
        const { data } = await axios.get(`${mautic.baseUrl}/api/smses`, {
            auth: mautic
        });
        res.json(Object.values(data.smses || {}));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2️⃣ Get SMS stats (messages sent to leads)
app.get("/api/sms/:id/stats", async (req, res) => {
    const smsId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const start = (page - 1) * limit;

    try {
        // 1️⃣ Fetch paginated stats for table
        const { data } = await axios.get(
            `${mautic.baseUrl}/api/stats/sms_message_stats`,
            {
                auth: mautic,
                params: {
                    "where[0][col]": "sms_id",
                    "where[0][expr]": "eq",
                    "where[0][val]": smsId,
                    limit,
                    start,
                },
            }
        );

        const stats = data.stats || [];
        const totalRecords = Number(data.total || stats.length);

        // 2️⃣ Calculate total success/failed by fetching all pages
        let totalSuccessful = 0;
        let totalFailed = 0;
        const pageSize = 500; // chunk size
        for (let offset = 0; offset < totalRecords; offset += pageSize) {
            const pageData = await axios.get(
                `${mautic.baseUrl}/api/stats/sms_message_stats`,
                {
                    auth: mautic,
                    params: {
                        "where[0][col]": "sms_id",
                        "where[0][expr]": "eq",
                        "where[0][val]": smsId,
                        limit: pageSize,
                        start: offset,
                    },
                }
            );
            const pageStats = pageData.data.stats || [];
            totalSuccessful += pageStats.filter((s) => s.is_failed === "0").length;
            totalFailed += pageStats.filter((s) => s.is_failed === "1").length;
        }

        // 3️⃣ Fetch SMS campaign name
        const smsData = await axios.get(`${mautic.baseUrl}/api/smses`, { auth: mautic });
        const smses = smsData.data.smses || {};
        const campaignName = smses[smsId.toString()]?.name || "";

        res.json({
            stats,
            totalRecords,
            totalSuccessful,
            totalFailed,
            currentPage: page,
            recordsPerPage: limit,
            campaignName,
        });
    } catch (err) {
        console.error("❌ Error fetching SMS stats:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3️⃣ Get contact activity + basic details
app.get("/api/contact/:id", async (req, res) => {
    const contactId = req.params.id;
    const smsId = req.query.smsId;

    try {
        const [activityRes, contactRes] = await Promise.all([
            axios.get(`${mautic.baseUrl}/api/contacts/${contactId}/activity`, { auth: mautic }),
            axios.get(`${mautic.baseUrl}/api/contacts/${contactId}`, { auth: mautic })
        ]);

        const events = activityRes.data?.events || [];
        const contact = contactRes.data?.contact || {};
        const name =
            `${contact.fields?.core?.firstname?.value || ""} ${contact.fields?.core?.lastname?.value || ""}`.trim();

        // 🔍 Filter SMS messages for this specific campaign SMS
        const filteredEvents = smsId
            ? events.filter(
                (e) =>
                    e.event === "sms.sent" &&
                    e.details?.stat?.sms_id?.toString() === smsId.toString()
            )
            : events;

        // keep replies (sms_reply) unfiltered — user could have replied to this one
        const replies = events.filter((e) => e.event === "sms_reply");

        res.json({
            id: contactId,
            name,
            events: [...filteredEvents, ...replies]
        });
    } catch (err) {
        console.error("❌ Error fetching contact:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));

/**
 * Remove later after testing pop!!!
 */
