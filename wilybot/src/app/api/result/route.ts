import {NextResponse} from "next/server";
import db from "@/lib/db";
import {Result} from "@/app/page";

interface PlaywrightResult {
    id: string;
    test: string
    title: string;
    browser: string;
    platform: string;
    file: string;
    status: string;
    batch: string;
    created_at: string;
}

export async function GET(request: Request) {

    try {
        const {searchParams} = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        let batchId = queryParams.batchId;
        let batch = await db("playwright_batches").select(["id", "hash", "meta", "created_at"]).where("id", batchId).first();

        console.log(batch);
        if (!batch) {
            throw new Error("Batch don't exist")
        }

        let currentResult: PlaywrightResult[] = await db("playwright_results")
            .select("*")
            .where("batch", batch["hash"])


        let previousBatch = await db("playwright_batches").select("*")
            .where("created_at", "<", batch["created_at"])
            .orderBy("created_at", "desc")
            .first();

        let averageResolutionRate = 0;
        let previousErrorCount = 0;
        let resolvedPreviousErrorCount = 0;

        if (previousBatch) {
            let previousResult = await db("playwright_results")
                .where("batch", previousBatch["hash"])
                .select("*");

            for (let result of previousResult) {
                if ("failed" === result["status"]) {
                    previousErrorCount = previousErrorCount + 1;
                    //check if current passed
                    let current = currentResult.filter(item => item.test === result.test && item.browser === result.browser && item.platform === result.platform);
                    if (current.length > 0 && current[0].status === "passed") {
                        resolvedPreviousErrorCount = resolvedPreviousErrorCount + 1
                    }
                }
            }
            averageResolutionRate = previousErrorCount > 0 ?  ( resolvedPreviousErrorCount / previousErrorCount ) * 100 : 0;
        }

        let stats = batch["meta"];

        return NextResponse.json({
            stats: {
                ...stats?.stats,
                average_resolution: averageResolutionRate,
                previousBatch: previousBatch,
                previousErrorCount: previousErrorCount,
                resolvedPreviousErrorCount: resolvedPreviousErrorCount
            },
            created_at: batch["created_at"],
        });

    } catch (error: any) {
        return NextResponse.json({message: error?.message}, {status: 500});
    }


}