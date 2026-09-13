import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        const token = crypto.randomBytes(24).toString("hex");

        await sql`
            INSERT INTO share_links (token, status)
            VALUES (${token}, 'active')
        `;

        return res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        console.error("Generate link error:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to generate link"
        });
    }
}
