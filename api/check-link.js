import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                valid: false,
                message: "Token is required"
            });
        }

        const sql = neon(process.env.DATABASE_URL);

        const rows = await sql`
            SELECT token, status, created_at, revoked_at
            FROM share_links
            WHERE token = ${token}
            LIMIT 1
        `;

        if (rows.length === 0) {
            return res.status(404).json({
                valid: false,
                message: "Link not found"
            });
        }

        const link = rows[0];

        if (link.status !== "active") {
            return res.status(403).json({
                valid: false,
                message: "This link has been revoked"
            });
        }

        return res.status(200).json({
            valid: true
        });

    } catch (error) {
        console.error("Check link error:", error);

        return res.status(500).json({
            valid: false,
            message: "Server error"
        });
    }
}
