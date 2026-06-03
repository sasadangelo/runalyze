import { DataUtils } from './data-utils.js';
import './data.js';
import './hrv-chart.js';
import { HRVApp } from './hrv-app.js';
import './fcr-chart.js';
import { FCRApp } from './fcr-app.js';

console.log('Health.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Health DOMContentLoaded event fired');

    // Set default dates (30 days back)
    DataUtils.setDefaultDates(30);

    // Initialize all apps (they will load data and process when ready)
    window.hrvApp = new HRVApp();
    window.fcrApp = new FCRApp();
});

// Expose update function globally for the button onclick
window.updateHealthCharts = function () {
    console.log('updateHealthCharts called');
    if (window.hrvApp) window.hrvApp.updateChart();
    if (window.fcrApp) window.fcrApp.updateChart();
};

// Made with Bob
