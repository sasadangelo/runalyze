export class Data {
    constructor(data) {
        this.data = data;
    }

    filterByDateRange(startDate, endDate) {
        return this.data.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });
    }
}
