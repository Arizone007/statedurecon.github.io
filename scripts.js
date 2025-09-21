// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isOpen = content.style.display === 'block';
        // Close all
        document.querySelectorAll('.accordion-content').forEach(c => c.style.display = 'none');
        if (!isOpen) {
            content.style.display = 'block';
        }
    });
});

// Statistik sederhana untuk uji mean (one sample t-test)
function oneSampleTTest(data, mu0) {
    const n = data.length;
    const mean = data.reduce((a,b) => a+b, 0) / n;
    const variance = data.reduce((a,b) => a + (b - mean)**2, 0) / (n-1);
    const stdDev = Math.sqrt(variance);
    const t = (mean - mu0) / (stdDev / Math.sqrt(n));
    // Degrees of freedom
    const df = n - 1;
    return {mean, stdDev, t, df};
}

// Korelasi Pearson
function pearsonCorrelation(x, y) {
    const n = x.length;
    const meanX = x.reduce((a,b) => a+b, 0) / n;
    const meanY = y.reduce((a,b) => a+b, 0) / n;
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    for(let i=0; i<n; i++) {
        numerator += (x[i] - meanX)*(y[i] - meanY);
        denomX += (x[i] - meanX)**2;
        denomY += (y[i] - meanY)**2;
    }
    return numerator / Math.sqrt(denomX * denomY);
}

// Regresi linier sederhana
function linearRegression(x, y) {
    const n = x.length;
    const meanX = x.reduce((a,b) => a+b, 0) / n;
    const meanY = y.reduce((a,b) => a+b, 0) / n;
    let numerator = 0;
    let denominator = 0;
    for(let i=0; i<n; i++) {
        numerator += (x[i] - meanX)*(y[i] - meanY);
        denominator += (x[i] - meanX)**2;
    }
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    return {slope, intercept};
}

// Uji validitas (menghitung korelasi item-total)
function validityTest(items) {
    // items: array of arrays, tiap array adalah skor responden untuk item tertentu
    // Menghitung korelasi tiap item dengan total skor
    const nItems = items.length;
    const nRespondents = items[0].length;
    let results = [];
    for(let i=0; i<nItems; i++) {
        let itemScores = items[i];
        let totalScores = [];
        for(let r=0; r<nRespondents; r++) {
            let sum = 0;
            for(let j=0; j<nItems; j++) {
                if(j !== i) sum += items[j][r];
            }
            totalScores.push(sum);
        }
        const r = pearsonCorrelation(itemScores, totalScores);
        results.push({item: i+1, r});
    }
    return results;
}

// Uji reliabilitas (Cronbach's alpha)
function cronbachAlpha(items) {
    const k = items.length;
    const n = items[0].length;
    // Varians tiap item
    let variances = items.map(item => {
        const mean = item.reduce((a,b) => a+b, 0) / n;
        return item.reduce((a,b) => a + (b - mean)**2, 0) / (n-1);
    });
    // Varians total skor
    let totalScores = [];
    for(let r=0; r<n; r++) {
        let sum = 0;
        for(let i=0; i<k; i++) {
            sum += items[i][r];
        }
        totalScores.push(sum);
    }
    const meanTotal = totalScores.reduce((a,b) => a+b, 0) / n;
    const varTotal = totalScores.reduce((a,b) => a + (b - meanTotal)**2, 0) / (n-1);
    const sumVar = variances.reduce((a,b) => a+b, 0);
    const alpha = (k / (k-1)) * (1 - (sumVar / varTotal));
    return alpha;
}

// Render form sesuai pilihan uji statistik
const testSelect = document.getElementById('test-select');
const formContainer = document.getElementById('test-form-container');
const resultContainer = document.getElementById('result-container');

testSelect.addEventListener('change', () => {
    resultContainer.textContent = '';
    formContainer.innerHTML = '';
    const val = testSelect.value;
    if (!val) return;

    if(val === 'mean') {
        formContainer.innerHTML = `
            <h3>Uji Mean (One Sample t-test)</h3>
            <label>Data (pisahkan dengan koma):</label>
            <textarea id="mean-data" rows="3" placeholder="e.g. 5, 7, 8, 6, 9"></textarea>
            <label>Nilai mean hipotesis (μ₀):</label>
            <input type="number" id="mean-mu0" value="0" />
            <button id="mean-run">Hitung</button>
        `;
        document.getElementById('mean-run').addEventListener('click', () => {
            const dataStr = document.getElementById('mean-data').value;
            const mu0 = parseFloat(document.getElementById('mean-mu0').value);
            if(!dataStr) {
                alert('Masukkan data terlebih dahulu!');
                return;
            }
            const data = dataStr.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
            if(data.length < 2) {
                alert('Data harus minimal 2 angka valid!');
                return;
            }
            const res = oneSampleTTest(data, mu0);
            resultContainer.textContent = 
`Hasil Uji One Sample t-test:
Mean sampel = ${res.mean.toFixed(4)}
Standar deviasi = ${res.stdDev.toFixed(4)}
t-statistic = ${res.t.toFixed(4)}
Derajat kebebasan = ${res.df}

Interpretasi:
Jika |t| > t tabel pada df=${res.df}, tolak H0.`;
        });
    }
    else if(val === 'correlation') {
        formContainer.innerHTML = `
            <h3>Uji Korelasi Pearson</h3>
            <label>Data X (pisahkan dengan koma):</label>
            <textarea id="corr-x" rows="3" placeholder="e.g. 1, 2, 3, 4, 5"></textarea>
            <label>Data Y (pisahkan dengan koma):</label>
            <textarea id="corr-y" rows="3" placeholder="e.g. 2, 4, 6, 8, 10"></textarea>
           