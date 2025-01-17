"use server";

import { BACKEND_API } from ".";

export async function query(sql: string, values?: Array<unknown>) {
    console.log(sql);

    try {
        console.log(`${BACKEND_API}/api/query`);
        const response = await fetch(`${BACKEND_API}/api/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sql,
                values: values || [],
            }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();
        // console.log("Query executed successfully:", sql);
        console.log({ result });

        return result;
    } catch (err) {
        console.error("Error during query execution:", err);
        throw err;
    }
}
