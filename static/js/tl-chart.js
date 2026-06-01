export class TLChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(dates, tlValues) {
        const colors = tlValues.map(tl => {
            if (tl < 0.8) return 'rgba(200, 200, 200, 0.7)';
            if (tl <= 1.3) return 'rgba(128, 193, 191, 0.7)';
            if (tl <= 1.75) return 'rgba(246, 222, 130, 0.7)';
            return 'rgba(220, 103, 101, 0.7)';
        });

        const data = {
            labels: dates,
            datasets: [
                {
                    label: 'Injury Risk',
                    data: tlValues,
                    backgroundColor: colors
                }
            ]
        };

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'ACWR (ATL/CTL)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Injury Risk (ACWR)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                const value = context.parsed.y.toFixed(2);
                                let risk = '';
                                if (value < 0.8) risk = 'Underload';
                                else if (value <= 1.3) risk = 'Optimal';
                                else if (value <= 1.75) risk = 'Caution';
                                else risk = 'High Risk';
                                return `ACWR: ${value} (${risk})`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }
}
