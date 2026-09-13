import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    try {
        const { number, token } = req.query;

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Valid access link required"
            });
        }

        // Personal permanent token
        const isPersonalToken =
            token === process.env.PERSONAL_ACCESS_TOKEN;

        // Temporary share link
        if (!isPersonalToken) {
            const sql = neon(process.env.DATABASE_URL);

            const link = await sql`
                SELECT token
                FROM share_links
                WHERE token = ${token}
                  AND status = 'active'
                LIMIT 1
            `;

            if (link.length === 0) {
                return res.status(403).json({
                    status: "error",
                    message: "This access link is invalid or revoked"
                });
            }
        }

        if (!number) {
            return res.status(400).json({
                status: "error",
                message: "Number is required"
            });
        }

        const API_KEY = process.env.API_KEY;
        const BASE_URL = process.env.API_URL;

        if (!API_KEY || !BASE_URL) {
            return res.status(500).json({
                status: "error",
                message: "Server configuration missing"
            });
        }

        const cleanNumber =
            String(number).replace(/[^0-9]/g, "");

        if (cleanNumber.length !== 10) {
            return res.status(400).json({
                status: "error",
                message: "Invalid number"
            });
        }

        const url =
            BASE_URL +
            API_KEY +
            "?Astha=" +
            encodeURIComponent(cleanNumber);

        const response = await fetch(url);

        let data;

        try {
            data = await response.json();
        } catch {
            return res.status(response.status).json({
                status: "error",
                message: "Invalid response from upstream service"
            });
        }

        // Remove private fields from API response
        function removePrivateFields(value) {
            if (Array.isArray(value)) {
                return value.map(removePrivateFields);
            }

            if (value && typeof value === "object") {
                const cleaned = {};

                for (const [key, val] of Object.entries(value)) {
                    const lowerKey = key.toLowerCase();

                    if (
                        lowerKey === "username" ||
                        lowerKey === "credit"
                    ) {
                        continue;
                    }

                    cleaned[key] =
                        removePrivateFields(val);
                }

                return cleaned;
            }

            return value;
        }

        const cleanedData =
            removePrivateFields(data);

        return res
            .status(response.status)
            .json(cleanedData);

    } catch (error) {
        console.error("Lookup error:", error);

        return res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
}
