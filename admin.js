document.addEventListener('DOMContentLoaded', function() {
    async function fetchAnalyticsData() {
        const response = await fetch('https://YOUR-WORKER-NAME.YOUR-WORKER-NAME.workers.dev/');  // Cloudflare Worker URL'nizi buraya ekleyin

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        return data.data.viewer.zones[0];
    }

    function processAnalyticsData(zones) {
        const labels = [];
        const trafficData = [];
        let totalRequests = 0;
        let uniqueVisitors = 0;
        let percentCached = 0;
        let totalDataServed = 0;
        let dataCached = 0;

        for (const key in zones) {
            if (key.startsWith('hour_') && zones[key].length > 0) {
                const hourlyData = zones[key][0];
                if (hourlyData && hourlyData.dimensions && hourlyData.sum) {
                    const datetime = hourlyData.dimensions.datetime;
                    const requests = hourlyData.sum.requests;
                    labels.push(new Date(datetime).toISOString());
                    trafficData.push(requests);
                    totalRequests += requests;
                    uniqueVisitors += hourlyData.sum.uniques || 0;
                    percentCached += hourlyData.sum.cached || 0;
                    totalDataServed += hourlyData.sum.bytes || 0;
                    dataCached += hourlyData.sum.cached_bytes || 0;
                }
            }
        }

       

        return { labels, trafficData };
    }
    
    function processUniqData(zones){
        const labelsU = [];
        const trafficDataU = [];
        let totalRequests = 0;
        let uniqueVisitors = 0;
        let percentCached = 0;
        let totalDataServed = 0;
        let dataCached = 0;

        for (const key in zones) {
            if (key.startsWith('hour_') && zones[key].length > 0) {
                const hourlyData = zones[key][0];
                if (hourlyData && hourlyData.dimensions && hourlyData.uniq) {
                    const datetime = hourlyData.dimensions.datetime;
                    const requests = hourlyData.uniq.uniques;
                    labelsU.push(new Date(datetime).toISOString());
                    trafficDataU.push(requests);
                    totalRequests += requests;
                    uniqueVisitors += hourlyData.sum.uniques || 0;
                    percentCached += hourlyData.sum.cached || 0;
                    totalDataServed += hourlyData.sum.bytes || 0;
                    dataCached += hourlyData.sum.cached_bytes || 0;
                }
            }
        }

       

        return { labelsU, trafficDataU };
    }

    async function renderChart() {
        try {
            const data = await fetchAnalyticsData();
            const { labels, trafficData } = processAnalyticsData(data);
            const { labelsU, trafficDataU } = processUniqData(data);
           
            const ctx = document.getElementById('trafficChart').getContext('2d');
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Toplam İstekler',
                        data: trafficData,
                        borderColor: 'rgba(70,129,212,255)',
                        backgroundColor: 'rgba(70,129,212,0.5)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour'
                            },
                            title: {
                                display: true,
                                text: 'Zamanlar'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'İstekler'
                            }
                        }
                    }
                }
            });
            
            const ctxU = document.getElementById('trafficChartUniq').getContext('2d');
            new Chart(ctxU, {
                type: 'line',
                data: {
                    labels: labelsU,
                    datasets: [{
                        label: 'Toplam Ziyaretçiler',
                        data: trafficDataU,
                        borderColor: 'rgba(70,129,212,255)',
                        backgroundColor: 'rgba(70,129,212,0.5)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour'
                            },
                            title: {
                                display: true,
                                text: 'Zamanlar'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Ziyaretçiler'
                            }
                        }
                    }
                }
            });
            
           
        } catch (error) {
            console.error('Error fetching or processing analytics data:', error);
        }
    }

    renderChart();
});
