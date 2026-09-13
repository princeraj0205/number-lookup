export default async function handler(req, res) {
    try {

        const { number } = req.query;

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

        const cleanNumber = String(number).replace(/[^0-9]/g, "");

        if (cleanNumber.length < 10) {
            return res.status(400).json({
                status: "error",
                message: "Invalid number"
            });
        }

        /*
         * API request
         * API_KEY browser ko kabhi nahi milegi.
         */
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


        /*
         * Remove unwanted attribution fields
         * before sending response to browser.
         */
        function removePrivateFields(value) {

            if (Array.isArray(value)) {
                return value.map(removePrivateFields);
            }

            if (
                value &&
                typeof value === "object"
            ) {

                const cleaned = {};

                for (const [key, val] of Object.entries(value)) {

                    const lowerKey =
                        key.toLowerCase();

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

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
}
