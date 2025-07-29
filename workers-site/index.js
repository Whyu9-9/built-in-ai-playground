import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
    event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
    try {
        // Add caching options
        const options = {
            cacheControl: {
                browserTTL: 60 * 60 * 24, // 24 hours
                edgeTTL: 60 * 60 * 24 * 365, // 365 days
                bypassCache: false,
            },
        }

        return await getAssetFromKV(event, options)
    } catch (e) {
        // Fall back to serving index.html on errors
        if (e instanceof Error) {
            try {
                let notFoundResponse = await getAssetFromKV(event, {
                    mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
                })

                return new Response(notFoundResponse.body, {
                    ...notFoundResponse,
                    status: 200,
                    statusText: 'OK',
                })
            } catch (e) { }
        }
        return new Response('An error occurred', { status: 500 })
    }
} 