const form = document.getElementById('converter-form');
const input = document.getElementById('temperature');
const fromSelect = document.getElementById('from-unit');
const toSelect = document.getElementById('to-unit');
const swapButton = document.getElementById('swap-units');
const inputUnit = document.getElementById('input-unit');
const inputError = document.getElementById('input-error');
const resultBox = document.getElementById('result');
const resultValue = document.getElementById('result-value');
const resultNote = document.getElementById('result-note');

const UNITS = {
    C: { label: 'Celsius', symbol: '°C', absoluteZero: -273.15 },
    F: { label: 'Fahrenheit', symbol: '°F', absoluteZero: -459.67 },
    K: { label: 'Kelvin', symbol: 'K', absoluteZero: 0 }
};

const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
});

function formatNumber(value) {
    const rounded = Number(value.toFixed(2));
    const safeValue = Object.is(rounded, -0) ? 0 : rounded;
    return numberFormatter.format(safeValue);
}

function toCelsius(value, unit) {
    if (unit === 'F') {
        return (value - 32) * 5 / 9;
    }
    if (unit === 'K') {
        return value - 273.15;
    }
    return value;
}

function fromCelsius(value, unit) {
    if (unit === 'F') {
        return value * 9 / 5 + 32;
    }
    if (unit === 'K') {
        return value + 273.15;
    }
    return value;
}

function syncFromUnit() {
    const unit = UNITS[fromSelect.value];
    inputUnit.textContent = unit.symbol;
    input.min = String(unit.absoluteZero);
}

function clearError() {
    inputError.textContent = '';
    input.removeAttribute('aria-invalid');
}

function resetResult() {
    resultBox.classList.remove('is-success', 'is-error');
    resultValue.textContent = '—';
    resultNote.textContent = 'Enter a temperature and press convert.';
}

function showError(message, note) {
    inputError.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    resultBox.classList.remove('is-success');
    resultBox.classList.add('is-error');
    resultValue.textContent = '—';
    resultNote.textContent = note;
}

function convert() {
    clearError();

    const rawValue = input.value.trim();

    if (rawValue === '') {
        showError('Please enter a temperature.', 'A numeric value is required.');
        input.focus();
        return;
    }

    const value = Number(rawValue);

    if (input.validity.badInput || !Number.isFinite(value)) {
        showError('Please enter a valid number.', 'Only numeric values are supported.');
        input.focus();
        return;
    }

    const fromUnit = fromSelect.value;
    const toUnit = toSelect.value;
    const limit = UNITS[fromUnit].absoluteZero;

    if (value < limit) {
        const limitText = `${formatNumber(limit)} ${UNITS[fromUnit].symbol}`;
        showError(
            `Temperature cannot be below absolute zero (${limitText}).`,
            'That value is below absolute zero and cannot exist.'
        );
        input.focus();
        return;
    }

    const celsius = toCelsius(value, fromUnit);
    const converted = fromCelsius(celsius, toUnit);
    const displayValue = `${formatNumber(converted)} ${UNITS[toUnit].symbol}`;

    resultBox.classList.remove('is-error');
    resultBox.classList.add('is-success');
    resultValue.textContent = displayValue;
    resultNote.textContent = `${formatNumber(value)} ${UNITS[fromUnit].symbol} = ${displayValue}`;
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    convert();
});

input.addEventListener('input', () => {
    clearError();
    resetResult();
});

fromSelect.addEventListener('change', () => {
    syncFromUnit();
    clearError();
    resetResult();
});

toSelect.addEventListener('change', () => {
    clearError();
    resetResult();
});

swapButton.addEventListener('click', () => {
    const fromUnit = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = fromUnit;
    syncFromUnit();
    clearError();
    resetResult();
    input.focus();
});

syncFromUnit();
