class BidQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    /**
     * Add a new task to the queue.
     * @param {Function} task - Async function to execute sequentially.
     */
    enqueue(task) {
        if (typeof task !== "function") {
            throw new TypeError("Task must be a function.");
        }
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            // Start processing only if the queue is idle.
            if (!this.processing) {
                this.process().catch((error) => {
                    console.error("Queue processing failed:", error);
                });
            }
        });


    }

    /**
     * Process queued tasks one by one.
     */
    async process() {
        this.processing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();

            try {
                await task();
            } catch (error) {
                console.error("Queue task failed:", error);
            }
        }

        this.processing = false;
    }

    /**
     * Returns the number of pending tasks.
     */
    size() {
        return this.queue.length;
    }

    /**
     * Clears all pending tasks.
     */
    clear() {
        this.queue = [];
    }
}

export default BidQueue