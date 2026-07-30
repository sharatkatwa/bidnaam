class AuctionTimer {
    constructor({ auctionId, endTime, onExpire }) {
        this.auctionId = auctionId;
        this.endTime = new Date(endTime);

        this.onExpire = onExpire;

        this.timeout = null;
        this.running = false;
    }

    start() {
        if (this.running) return;

        const delay = this.getRemainingTime();

        if (delay <= 0) {
            this.expire();
            return;
        }

        this.running = true;

        this.timeout = setTimeout(() => {
            this.expire();
        }, delay);
    }

    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        this.running = false;
    }

    restart(newEndTime) {
        this.stop();

        this.endTime = new Date(newEndTime);

        this.start();
    }

    extend(milliseconds) {
        this.endTime = new Date(this.endTime.getTime() + milliseconds);

        this.restart(this.endTime);
    }

    getRemainingTime() {
        return Math.max(0, this.endTime.getTime() - Date.now());
    }

    isExpired() {
        return this.getRemainingTime() === 0;
    }

    async expire() {
        this.stop();

        if (typeof this.onExpire === "function") {
            await this.onExpire(this.auctionId);
        }
    }
}

export default AuctionTimer;