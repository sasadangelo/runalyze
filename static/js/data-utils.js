export class DataUtils {
    constructor(data) {
        this.data = data;
    }

    mean() {
        return this.data.reduce((a, b) => a + b, 0) / this.data.length;
    }

    standardDeviation() {
        const avg = this.mean();
        const squareDiffs = this.data.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = new DataUtils(squareDiffs).mean();
        return Math.sqrt(avgSquareDiff);
    }

    movingAverage(windowSize) {
        return this.data.map((val, idx, array) => {
            if (idx < windowSize - 1) return null;
            const window = array.slice(idx - windowSize + 1, idx + 1);
            return Math.round(new DataUtils(window).mean());
        });
    }

    movingStandardDeviation(windowSize) {
        return this.data.map((val, idx, array) => {
            if (idx < windowSize - 1) return null;
            const window = array.slice(idx - windowSize + 1, idx + 1);
            return Math.round(new DataUtils(window).standardDeviation());
        });
    }

    static setDefaultDates(daysBack = 30) {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');

        if (!startDateInput || !endDateInput) {
            console.error('Date input fields not found in DOM');
            return false;
        }

        const endDate = new Date();
        const startDate = new Date();

        if (daysBack > 60) {
            // For longer periods (90 days), use setDate
            startDate.setDate(startDate.getDate() - daysBack);
            startDateInput.value = startDate.toISOString().split('T')[0];
            endDateInput.value = endDate.toISOString().split('T')[0];
        } else {
            // For shorter periods (30 days), use setMonth
            const monthsBack = Math.ceil(daysBack / 30);
            startDate.setMonth(startDate.getMonth() - monthsBack);
            startDateInput.valueAsDate = startDate;
            endDateInput.valueAsDate = endDate;
        }

        return true;
    }
}
