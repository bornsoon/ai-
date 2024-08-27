// Helper function to calculate the start of the current week
function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
}

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
            Fluency: 8.5,
            Grammar: 8.0,
            Vocabulary: 9.0,
            Content: 7.5,
            Vocal: 8.5
        };
    
        const maxScore = 10;
    
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
        vocalScoreElement.textContent = `음성평가: ${dailyScores.Vocal}`;  // Corrected data access

        // Place the vocal score div in the chart container
        dailyChartElement.parentNode.insertBefore(vocalScoreElement, dailyChartElement.nextSibling);

    
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
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],  // 요일 변경
            scores: [
                { fluency: 8, grammar: 8.5, vocabulary: 8.8, content: 7.5, pronunciation: 8.2 },
                { fluency: 7.8, grammar: 8, vocabulary: 8.4, content: 7.7, pronunciation: 8 },
                { fluency: 7.5, grammar: 7.8, vocabulary: 8.5, content: 7.3, pronunciation: 7.8 },
                { fluency: 8.2, grammar: 8.4, vocabulary: 8.7, content: 7.6, pronunciation: 8.5 },
                { fluency: 8.5, grammar: 8.9, vocabulary: 9, content: 8, pronunciation: 8.8 },
                { fluency: 7.9, grammar: 8.2, vocabulary: 8.1, content: 7.4, pronunciation: 7.9 },
                { fluency: 8.1, grammar: 8.3, vocabulary: 8.6, content: 7.9, pronunciation: 8.4 }
            ]
        },
        week2: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],  // 요일 변경
            scores: [
                { fluency: 7.7, grammar: 8, vocabulary: 7.5, content: 7, pronunciation: 7.2 },
                { fluency: 8.2, grammar: 8.5, vocabulary: 8, content: 7.8, pronunciation: 7.9 },
                { fluency: 7.9, grammar: 8.2, vocabulary: 7.8, content: 7.4, pronunciation: 7.7 },
                { fluency: 8.4, grammar: 8.6, vocabulary: 8.5, content: 8.1, pronunciation: 8.4 },
                { fluency: 8.7, grammar: 9, vocabulary: 8.9, content: 8.5, pronunciation: 9 },
                { fluency: 7.5, grammar: 7.7, vocabulary: 7.3, content: 7, pronunciation: 7.4 },
                { fluency: 7.8, grammar: 8.1, vocabulary: 7.9, content: 7.5, pronunciation: 7.8 }
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
