document.addEventListener('DOMContentLoaded', function () {
    const dailyChartElement = document.getElementById('dailyChart');
    const dailyTableBody = document.querySelector("#dailyTable tbody");

    let weeklyChart = null;  // Initialize weeklyChart to null

    if (!dailyChartElement || !dailyTableBody) {
        console.error('One or more required elements were not found.');
        return;
    }

    function fetchDailyData() {
        fetch('/api/daily_data')
            .then(response => response.json())
            .then(data => {
                const dailyScores = {
                    Fluency: data.Fluency || 0,
                    Grammar: data.Grammar || 0,
                    Vocabulary: data.Vocabulary || 0,
                    Content: data.Content || 0,
                    Vocal: data.Pronunciation || 0
                };

                updateDailyChartAndTable(dailyScores);
            })
            .catch(error => console.error('Error fetching daily data:', error));
    }

    function updateDailyChartAndTable(dailyScores) {
        const maxScore = 10;
        const dailyData = {
            labels: ["Fluency", "Grammar", "Vocabulary", "Content"],
            datasets: [
                {
                    label: 'Fluency',
                    data: [dailyScores.Fluency || null, maxScore - dailyScores.Fluency],
                    backgroundColor: ['rgba(255, 206, 86, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                    borderWidth: 0,
                    cutout: '70%',
                    rotation: 0
                },
                {
                    label: 'Grammar',
                    data: [dailyScores.Grammar || null, maxScore - dailyScores.Grammar],
                    backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                    borderWidth: 0,
                    cutout: '70%',
                    rotation: 0
                },
                {
                    label: 'Vocabulary',
                    data: [dailyScores.Vocabulary || null, maxScore - dailyScores.Vocabulary],
                    backgroundColor: ['rgba(153, 102, 255, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                    borderWidth: 0,
                    cutout: '70%',
                    rotation: 0
                },
                {
                    label: 'Content',
                    data: [dailyScores.Content || null, maxScore - dailyScores.Content],
                    backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                    borderWidth: 0,
                    cutout: '70%',
                    rotation: 0
                }
            ]
        };

        const dailyOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        };

        const dailyChart = new Chart(dailyChartElement, {
            type: 'doughnut',
            data: dailyData,
            options: dailyOptions
        });

        const vocalScoreElement = document.createElement('div');
        vocalScoreElement.id = 'vocalScore';
        vocalScoreElement.style.position = 'absolute';
        vocalScoreElement.style.top = '50%';
        vocalScoreElement.style.left = '50%';
        vocalScoreElement.style.transform = 'translate(-50%, -50%)';
        vocalScoreElement.style.fontSize = '24px';
        vocalScoreElement.style.color = '#333';
        vocalScoreElement.textContent = `음성평가: ${dailyScores.Vocal !== 0 ? dailyScores.Vocal.toFixed(2) : '-'}`;

        dailyChartElement.parentNode.insertBefore(vocalScoreElement, dailyChartElement.nextSibling);

        dailyTableBody.innerHTML = "";
        Object.keys(dailyScores).forEach(key => {
            const row = dailyTableBody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            cell1.textContent = key;
            cell2.textContent = dailyScores[key] !== 0 ? dailyScores[key].toFixed(2) : '-';
        });
    }

    const weeklyChartElement = document.getElementById('weeklyChart');
    const weeklyTableBody = document.querySelector("#weeklyTable tbody");
    const dateSelector = document.getElementById('dateSelector');

    if (!weeklyChartElement || !weeklyTableBody || !dateSelector) {
        console.error('One or more required elements were not found.');
        return;
    }

    function fetchWeeklyData(startDate) {
        fetch(`/api/week_data?start=${startDate}`)
            .then(response => response.json())
            .then(data => {
                processAndDisplayWeeklyData(data);
            })
            .catch(error => console.error('Error fetching weekly data:', error));
    }

    function processAndDisplayWeeklyData(weekData) {
        if (!weekData || !weekData.labels || !weekData.scores) {
            console.error('Invalid data received for weekly chart/table.');
            return;
        }

        const labels = weekData.labels;
        const scores = weekData.scores;

        updateWeeklyChartAndTable({ labels, scores });
    }

    function updateWeeklyChartAndTable(weekData) {
        // Destroy previous chart instance if it exists
        if (weeklyChart instanceof Chart) {
            weeklyChart.destroy();
        }

        const labels = weekData.labels;
        const scores = weekData.scores;

        weeklyChart = new Chart(weeklyChartElement, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Fluency',
                    data: scores.map(item => item.fluency !== 0 ? parseFloat(item.fluency) : null),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)'
                }, {
                    label: 'Grammar',
                    data: scores.map(item => item.grammar !== 0 ? parseFloat(item.grammar) : null),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)'
                }, {
                    label: 'Vocabulary',
                    data: scores.map(item => item.vocabulary !== 0 ? parseFloat(item.vocabulary) : null),
                    backgroundColor: 'rgba(255, 206, 86, 0.8)'
                }, {
                    label: 'Content',
                    data: scores.map(item => item.content !== 0 ? parseFloat(item.content) : null),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)'
                }, {
                    label: 'Pronunciation',
                    data: scores.map(item => item.pronunciation !== 0 ? parseFloat(item.pronunciation) : null),
                    backgroundColor: 'rgba(153, 102, 255, 0.8)'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });

        weeklyTableBody.innerHTML = "";
        scores.forEach((item, index) => {
            const row = weeklyTableBody.insertRow();
            row.insertCell(0).textContent = labels[index];
            row.insertCell(1).textContent = item.fluency !== 0 ? item.fluency.toFixed(2) : '-';
            row.insertCell(2).textContent = item.grammar !== 0 ? item.grammar.toFixed(2) : '-';
            row.insertCell(3).textContent = item.vocabulary !== 0 ? item.vocabulary.toFixed(2) : '-';
            row.insertCell(4).textContent = item.content !== 0 ? item.content.toFixed(2) : '-';
            row.insertCell(5).textContent = item.pronunciation !== 0 ? item.pronunciation.toFixed(2) : '-';
        });
    }

    dateSelector.addEventListener('change', function () {
        const selectedDate = this.value;
        fetchWeeklyData(selectedDate);
    });

    const today = new Date().toISOString().split('T')[0];
    dateSelector.value = today;
    fetchWeeklyData(today);
    fetchDailyData();
});
