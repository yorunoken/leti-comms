const cooldownMap = new Map<string, number>();
const COOLDOWN_MS = 60000;

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const lastRequest = cooldownMap.get(ip);
    const now = Date.now();

    if (lastRequest && now - lastRequest < COOLDOWN_MS) {
        const remainingTime = Math.ceil((COOLDOWN_MS - (now - lastRequest)) / 1000);
        return new Response(
            JSON.stringify({
                success: false,
                message: `Please wait ${remainingTime} seconds before trying again.`,
            }),
            { status: 429 },
        );
    }

    cooldownMap.set(ip, now);

    const { commissionType, discord, email, commissionDetails, references } = await request.json();
    const webhookUrl = process.env.WEBHOOK_URL;
    const artistId = process.env.ARTIST_ID;

    if (!webhookUrl || !artistId) {
        return new Response(
            JSON.stringify({
                success: false,
                message: `Stupid me forgot to set WEBHOOK_URL in environment variables`,
            }),
            { status: 500 },
        );
    }

    const body = {
        content: `New commission for <@${artistId}>! Details are listed below.`,
        embeds: [
            {
                description: commissionDetails || "description not provided",
                color: 5814783,
                fields: [
                    {
                        name: "Discord Handle",
                        value: discord || "not provided",
                        inline: true,
                    },
                    {
                        name: "Email",
                        value: email || "not provided",
                        inline: true,
                    },
                    {
                        name: "Commission Type",
                        value: commissionType || "not provided",
                        inline: true,
                    },
                    {
                        name: "References",
                        value: references || "not provided",
                    },
                ],
            },
        ],
        attachments: [],
    };

    try {
        const webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!webhookResponse.ok) {
            throw new Error("Failed to send webhook");
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Error sending webhook:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Failed to send commission request",
            }),
            { status: 500 },
        );
    }
}
