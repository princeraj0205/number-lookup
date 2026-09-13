import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const adminPassword = req.headers["x-admin-password"];

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        const links = await sql`
            SELECT
                token,
                status,
                created_at,
                revoked_at
            FROM share_links
            ORDER BY created_at DESC
        `;

        return res.status(200).json({
            success: true,
            links
        });

    } catch (error) {
        console.error("List links error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
