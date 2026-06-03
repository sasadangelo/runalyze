import { DataUtils } from './data-utils.js';
import './data.js';
import './hrv-chart.js';
import { HRVApp } from './hrv-app.js';
import './fcr-chart.js';
import { FCRApp } from './fcr-app.js';
import './tss-chart.js';
import { TSSApp } from './tss-app.js';

console.log('Overview.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');

    // Set default dates (30 days back)
    console.log('Setting default dates...');
    const datesSet = DataUtils.setDefaultDates(30);
    console.log('Dates set:', datesSet);

    // Initialize all apps (they will load data and process when ready)
    console.log('Initializing apps...');
    window.hrvApp = new HRVApp();
    console.log('HRVApp initialized');
    window.fcrApp = new FCRApp();
    console.log('FCRApp initialized');
    window.tssApp = new TSSApp();
    console.log('TSSApp initialized');
});

// Expose update function globally for the button onclick
window.updateOverviewCharts = function () {
    console.log('updateOverviewCharts called');
    if (window.hrvApp) window.hrvApp.updateChart();
    if (window.fcrApp) window.fcrApp.updateChart();
    if (window.tssApp) window.tssApp.updateChart();
};
