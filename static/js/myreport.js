// myreport.js
document.addEventListener('DOMContentLoaded', function () {
    // Daily Chart and Table
    const dailyChartElement = document.getElementById('dailyChart');
    const dailyTableBody = document.querySelector("#dailyTable tbody");

    // 디버깅용 콘솔 로그
    console.log('dailyChartElement:', dailyChartElement);
    console.log('dailyTableBody:', dailyTableBody);

    if (!dailyChartElement || !dailyTableBody) {
        console.error('One or more required elements were not found.');
        return;
    }

    const dailyScores = {
        Fluency: 85,
        Grammar: 80,
        Vocabulary: 90,
        Content: 75,
        Vocal: 85
    };

    const maxScore = 100;

    const dailyData = {
        labels: ["Fluency", "Grammar", "Vocabulary", "Content"],
        datasets: [
            {
                label: 'Fluency',
                data: [dailyScores.Fluency, maxScore - dailyScores.Fluency],
                backgroundColor: ['rgba(255, 206, 86, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                borderWidth: 0,
                cutout: '70%',
                rotation: -90
            },
            {
                label: 'Grammar',
                data: [dailyScores.Grammar, maxScore - dailyScores.Grammar],
                backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                borderWidth: 0,
                cutout: '70%',
                rotation: -90
            },
            {
                label: 'Vocabulary',
                data: [dailyScores.Vocabulary, maxScore - dailyScores.Vocabulary],
                backgroundColor: ['rgba(153, 102, 255, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                borderWidth: 0,
                cutout: '70%',
                rotation: -90
            },
            {
                label: 'Content',
                data: [dailyScores.Content, maxScore - dailyScores.Content],
                backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                borderWidth: 0,
                cutout: '70%',
                rotation: -90
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

    // Center Text 추가
    const vocalScoreElement = document.createElement('div');
    vocalScoreElement.id = 'vocalScore';
    vocalScoreElement.style.position = 'absolute';
    vocalScoreElement.style.top = '50%';
    vocalScoreElement.style.left = '50%';
    vocalScoreElement.style.transform = 'translate(-50%, -50%)';
    vocalScoreElement.style.fontSize = '24px';
    vocalScoreElement.style.color = '#333';
    vocalScoreElement.textContent = `음성평가: ${dailyScores.Vocal}`;
    dailyChartElement.parentNode.appendChild(vocalScoreElement);

    // Populate the daily table
    Object.keys(dailyScores).forEach(key => {
        const row = dailyTableBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = key;
        cell2.textContent = dailyScores[key];
    });

    // Weekly Chart and Table
    const weeklyChartElement = document.getElementById('weeklyChart');
    const weeklyTableBody = document.querySelector("#weeklyTable tbody");
    const dataSelector = document.getElementById('dataSelector');

    if (!weeklyChartElement || !weeklyTableBody || !dataSelector) {
        console.error('One or more required elements were not found.');
        return;
    }

    let weeklyChart;
    const weeklyData = {
        week1: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            scores: [
                { fluency: 80, grammar: 85, vocabulary: 88, content: 75, pronunciation: 82 },
                { fluency: 78, grammar: 80, vocabulary: 84, content: 77, pronunciation: 80 },
                { fluency: 75, grammar: 78, vocabulary: 85, content: 73, pronunciation: 78 },
                { fluency: 82, grammar: 84, vocabulary: 87, content: 76, pronunciation: 85 },
                { fluency: 85, grammar: 89, vocabulary: 90, content: 80, pronunciation: 88 }
            ]
        },
        week2: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            scores: [
                { fluency: 77, grammar: 80, vocabulary: 75, content: 70, pronunciation: 72 },
                { fluency: 82, grammar: 85, vocabulary: 80, content: 78, pronunciation: 79 },
                { fluency: 79, grammar: 82, vocabulary: 78, content: 74, pronunciation: 77 },
                { fluency: 84, grammar: 86, vocabulary: 85, content: 81, pronunciation: 84 },
                { fluency: 87, grammar: 90, vocabulary: 89, content: 85, pronunciation: 90 }
            ]
        }
    };

    function updateWeeklyChartAndTable(week) {
        const weekData = weeklyData[week];

        if (weeklyChart) {
            weeklyChart.destroy();
        }

        weeklyChart = new Chart(weeklyChartElement, {
            type: 'bar',
            data: {
                labels: weekData.labels,
                datasets: [{
                    label: 'Fluency',
                    data: weekData.scores.map(item => item.fluency),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)'
                }, {
                    label: 'Grammar',
                    data: weekData.scores.map(item => item.grammar),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)'
                }, {
                    label: 'Vocabulary',
                    data: weekData.scores.map(item => item.vocabulary),
                    backgroundColor: 'rgba(255, 206, 86, 0.8)'
                }, {
                    label: 'Content',
                    data: weekData.scores.map(item => item.content),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)'
                }, {
                    label: 'Pronunciation',
                    type: 'line',
                    data: weekData.scores.map(item => item.pronunciation),
                    borderColor: 'rgba(153, 102, 255, 0.8)',
                    fill: false
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
        weekData.scores.forEach((item, index) => {
            const row = weeklyTableBody.insertRow();
            row.insertCell(0).textContent = weekData.labels[index];
            row.insertCell(1).textContent = item.fluency;
            row.insertCell(2).textContent = item.grammar;
            row.insertCell(3).textContent = item.vocabulary;
            row.insertCell(4).textContent = item.content;
            row.insertCell(5).textContent = item.pronunciation;
        });
    }

    dataSelector.addEventListener('change', function () {
        updateWeeklyChartAndTable(this.value);
    });

    // Initialize with the first data set
    updateWeeklyChartAndTable(dataSelector.value);
});
