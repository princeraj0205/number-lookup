import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    if (req.method !== "POST") {
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
        const { token } = req.body || {};

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is required"
            });
        }

        const sql = neon(process.env.DATABASE_URL);

        const result = await sql`
            UPDATE share_links
            SET
                status = 'revoked',
                revoked_at = NOW()
            WHERE token = ${token}
              AND status = 'active'
            RETURNING token
        `;

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active link not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Link revoked successfully"
        });

    } catch (error) {
        console.error("Revoke link error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
