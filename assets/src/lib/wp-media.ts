const WP_MEDIA_POLL_INTERVAL = 50
const WP_MEDIA_TIMEOUT = 5000

function isWpMediaReady() {
    return (
        typeof window.wp !== 'undefined' &&
        typeof window.wp.media !== 'undefined' &&
        typeof window.wp.Backbone !== 'undefined' &&
        typeof window.wp.Backbone.View !== 'undefined'
    )
}

export function ensureWpMedia(timeout = WP_MEDIA_TIMEOUT): Promise<void> {
    if (isWpMediaReady()) {
        return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
        const startedAt = Date.now()

        const poll = () => {
            if (isWpMediaReady()) {
                resolve()
                return
            }

            if (Date.now() - startedAt >= timeout) {
                reject(new Error('WordPress media library did not finish loading in time.'))
                return
            }

            window.setTimeout(poll, WP_MEDIA_POLL_INTERVAL)
        }

        poll()
    })
}
