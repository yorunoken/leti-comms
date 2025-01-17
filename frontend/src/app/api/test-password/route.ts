import { verify } from "argon2";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

export async function POST(request: Request) {
    const { password } = await request.json();
    // console.log(ADMIN_PASSWORD);
    // const isCorrect = await verify(ADMIN_PASSWORD, password);
    console.log(ADMIN_PASSWORD);
    console.log(password);
    const isCorrect = ADMIN_PASSWORD === password;

    if (isCorrect) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ success: false, message: "Incorrect password" }), { status: 200 });
    }
}
