// Константы и данные о газах
const GAS_PROPERTIES = {
    helium: {
        name: "Гелий",
        atomicMass: 4, // г/моль
        ionizationEnergy: 24.587 // эВ
    },
    neon: {
        name: "Неон",
        atomicMass: 20, // г/моль
        ionizationEnergy: 21.564 // эВ
    },
    argon: {
        name: "Аргон",
        atomicMass: 40, // г/моль
        ionizationEnergy: 15.759 // эВ
    }
};

// Глобальные переменные для хранения значений
let gasFlow = 0;        // расход газа, мг/с
let powerHFG = 0;       // мощность ВЧГ, кВт
let gasUsage = 0;       // коэффициент использования газа, %
let thrust = 0;         // тяга, мН
let selectedGas = "helium"; // выбранный газ

// Функция для расчета всех величин
function calculateAll() {
    // Получаем значения из полей ввода
    gasFlow = parseFloat(document.getElementById('gas_flow').value) || 0;
    powerHFG = parseFloat(document.getElementById('power_hfg').value) || 0;
    gasUsage = parseFloat(document.getElementById('gas_usage').value) || 0;
    thrust = parseFloat(document.getElementById('thrust').value) || 0;
    selectedGas = document.getElementById('gas_type').value;
    
    // Получаем свойства выбранного газа
    const gas = GAS_PROPERTIES[selectedGas];
    
    // Выполняем расчеты
    const powerFlow = calculatePowerFlow(thrust, gasFlow, gasUsage);
    const particleEnergy = calculateParticleEnergy(thrust, gasFlow, gasUsage, gas);
    const particleVelocity = calculateParticleVelocity(thrust, gasFlow, gasUsage, gas);
    const efficiency = calculateEfficiency(powerFlow, powerHFG);
    const specificImpulse = calculateSpecificImpulse(thrust, gasFlow);
    const ionCost = calculateIonCost(powerHFG, gasFlow, gasUsage, gas);
    const equivalentCurrent = calculateEquivalentCurrent(gasFlow, gas);
    const totalCurrent = calculateTotalCurrent(equivalentCurrent, gasUsage);
    
    // Обновляем результаты на странице
    document.getElementById('power_flow').textContent = powerFlow.toFixed(4);
    document.getElementById('particle_energy').textContent = particleEnergy.toFixed(2);
    document.getElementById('particle_velocity').textContent = particleVelocity.toFixed(2);
    document.getElementById('efficiency').textContent = efficiency.toFixed(2);
    document.getElementById('specific_impulse').textContent = specificImpulse.toFixed(2);
    document.getElementById('ion_cost').textContent = ionCost.toFixed(2);
    document.getElementById('equivalent_current').textContent = equivalentCurrent.toFixed(6);
    document.getElementById('total_current').textContent = totalCurrent.toFixed(6);
}

// Функции расчета
function calculatePowerFlow(thrust, gasFlow, gasUsage) {
    return thrust * thrust / (gasFlow ) / 1e3 / 2;
}

function calculateParticleEnergy(thrust, gasFlow, gasUsage, gas) {
    return gas.atomicMass * 1.66 * 1e-27 * 1e6 * (thrust / (gasFlow * gasUsage * 0.01)) * (thrust / (gasFlow * gasUsage * 0.01)) / 2 / 1.6 / 1e-19;
}

function calculateParticleVelocity(thrust, gasFlow, gasUsage, gas) {
    return (thrust / (gasFlow * gasUsage * 0.01));
}

function calculateEfficiency(powerFlow, powerHFG) {
    return powerHFG > 0 ? (powerFlow / powerHFG) * 100 : 0;
}

function calculateSpecificImpulse(thrust, gasFlow) {
    return (thrust / (gasFlow * 9.81)) * 1e3;
}

function calculateIonCost(powerHFG, gasFlow, gasUsage, gas) {
    return (gasFlow * gasUsage * 0.01) > 0 ? (powerHFG * 1000 / (gasFlow * 1e-6 * gasUsage * 0.01 / gas.atomicMass / 1.66 / 1e-27 * 1.6 * 1e-19) - gas.ionizationEnergy) : 0;
}

// Новые функции для расчета токов
function calculateEquivalentCurrent(gasFlow, gas) {
    // Эквивалентный ток частиц = (расход газа * коэффициент использования) / (атомная масса * элементарный заряд)  
    // Вычисляем эквивалентный ток
    return gasFlow * 1e-6 / gas.atomicMass / 1.66 / 1e-27 * 1.6 * 1e-19;
}

function calculateTotalCurrent(equivalentCurrent, gasUsage) {
    // Полный ток заряженных частиц (упрощенная формула)
    return equivalentCurrent * gasUsage * 0.01;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчики изменений для автоматического расчета
    document.getElementById('gas_type').addEventListener('change', calculateAll);
    document.getElementById('gas_flow').addEventListener('input', calculateAll);
    document.getElementById('power_hfg').addEventListener('input', calculateAll);
    document.getElementById('gas_usage').addEventListener('input', calculateAll);
    document.getElementById('thrust').addEventListener('input', calculateAll);
    
    // Выполняем первоначальный расчет
    calculateAll();
});
