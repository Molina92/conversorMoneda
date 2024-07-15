const API_ENDPOINT = 'https://mindicador.cl/api';
const currencySelect = document.getElementById('currency');
const chartCanvas = document.getElementById('chart').getContext('2d');
let currentChart = null;

document.getElementById('convertBtn').addEventListener('click', async function (event) {
    event.preventDefault();

    const amountInput = document.getElementById('amount').value;
    const selectedCurrency = document.getElementById('currency').value;

    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        const currencyData = await response.json();

        let conversionRate;
        switch (selectedCurrency) {
            case 'dolar':
                conversionRate = currencyData.dolar?.valor;
                break;
            case 'euro':
                conversionRate = currencyData.euro?.valor;
                break;
            default:
                conversionRate = null;
        }

        if (conversionRate === null) {
            document.getElementById('conversionResult').textContent = 'No se puede realizar cambio.';
            return;
        }

        const convertedAmount = amountInput / conversionRate;
        document.getElementById('conversionResult').textContent = `El monto convertido es: ${convertedAmount.toFixed(2)}`;
    } catch (error) {
        document.getElementById('conversionResult').textContent = `Error: ${error.message}`;
    }
});

const getCurrencies = async (url) => {
    const response = await fetch(url);
    const currencyData = await response.json();

    const currencies = [
        { codigo: 'dolar', nombre: 'Dólar Americano', valor: currencyData.dolar.valor },
        { codigo: 'euro', nombre: 'Euro', valor: currencyData.euro.valor }
    ];

    displayCurrencies(currencies, currencySelect);
}

const displayCurrencies = (currencies, container) => {
    let options = '<option value="" selected disabled>Selecciona una moneda</option>';

    currencies.forEach(({ codigo, nombre, valor }) => {
        options += `<option data-value="${valor}" value="${codigo}">${nombre}</option>`;
    });

    container.innerHTML = options;
}

const getCurrencyDetail = async (url, currencyCode) => {
    const response = await fetch(`${url}/${currencyCode}`);
    const { serie } = await response.json();

    const dates = [];
    const values = [];
    serie.slice(0, 11).forEach(({ fecha, valor }) => {
        const shortDate = fecha.split('T')[0];
        dates.push(shortDate);
        values.push(valor);
    });

    return {
        labels: dates.reverse(),
        data: values.reverse()
    }
}

const displayChart = (currencyData, container) => {
    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(container, {
        type: 'line',
        data: {
            labels: currencyData.labels,
            datasets: [{
                label: 'Fechas',
                data: currencyData.data,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

document.getElementById('convertBtn').addEventListener('click', async () => {
    const selectedCurrencyCode = currencySelect.value;

    const currencyDetails = await getCurrencyDetail(API_ENDPOINT, selectedCurrencyCode);
    displayChart(currencyDetails, chartCanvas);

    console.log(currentChart);
});

getCurrencies(API_ENDPOINT);
