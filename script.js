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
let equivalentCurrent = 0; // эквивалентный ток частиц, А
let gasUsage = 0;       // коэффициент использования газа, %
let particleEnergy = 0; // средняя энергия ионов, эВ
let thrust = 0;         // тяга, мН
let powerHFG = 0;       // мощность ВЧГ, кВт
let selectedGas = "helium"; // выбранный газ

// Функция для расчета всех величин
function calculateAll() {
    // Получаем значения из полей ввода
    selectedGas = document.getElementById('gas_type').value;
    gasFlow = parseFloat(document.getElementById('gas_flow').value) || 0;
    equivalentCurrent = parseFloat(document.getElementById('equivalent_current').value) || 0;
    gasUsage = parseFloat(document.getElementById('gas_usage').value) || 0;
    particleEnergy = parseFloat(document.getElementById('particle_energy').value) || 0;
    thrust = parseFloat(document.getElementById('thrust').value) || 0;
    powerHFG = parseFloat(document.getElementById('power_hfg').value) || 0;
    
    // Получаем свойства выбранного газа
    const gas = GAS_PROPERTIES[selectedGas];
    
    // Выполняем расчеты
    const specificImpulse = calculateSpecificImpulse(thrust, gasFlow);
    const ionCost = calculateIonCost(powerHFG, gasFlow, gasUsage, gas);
    const jetPower = calculateJetPower(thrust, gasFlow);
    const energyFlow = calculateEnergyFlow(jetPower, gasUsage);
    const thrustEfficiency = calculateThrustEfficiency(jetPower, powerHFG);
    const energyEfficiency = calculateEnergyEfficiency(thrustEfficiency, gasUsage);    
    // Расчет параметров частиц
    const ionVelocity = calculateIonVelocity(particleEnergy, gas);
    
    const ionEnergy = particleEnergy;
    const ionMassFlow = gasFlow * gasUsage / 100;
    const neutralMassFlow = gasFlow * (1 - gasUsage / 100);
    const ionCurrent = equivalentCurrent * gasUsage / 100;
    const neutralCurrent = equivalentCurrent * (1 - gasUsage / 100);
    const ionEnergyFlow = calculateIonEnergyFlow(ionCurrent, ionEnergy);
    const neutralEnergy = calculateNeutralEnergy(energyFlow, ionEnergyFlow, neutralCurrent);
const neutralVelocity = calculateNeutralVelocity(neutralEnergy, gas);
    const neutralEnergyFlow = calculateNeutralEnergyFlow(neutralCurrent, neutralEnergy);
    
    // Обновляем результаты в центральной колонке
    document.getElementById('specific_impulse').textContent = specificImpulse.toFixed(2);
    document.getElementById('ion_cost').textContent = ionCost.toFixed(2);
    document.getElementById('energy_flow').textContent = energyFlow.toFixed(4);
    document.getElementById('energy_efficiency').textContent = energyEfficiency.toFixed(2);
    document.getElementById('jet_power').textContent = jetPower.toFixed(4);
    document.getElementById('thrust_efficiency').textContent = thrustEfficiency.toFixed(2);
    
    // Обновляем таблицу параметров частиц
    document.getElementById('ion_velocity').textContent = ionVelocity.toFixed(2);
    document.getElementById('neutral_velocity').textContent = neutralVelocity.toFixed(2);
    document.getElementById('ion_energy').textContent = ionEnergy.toFixed(2);
    document.getElementById('neutral_energy').textContent = neutralEnergy.toFixed(2);
    document.getElementById('ion_mass_flow').textContent = ionMassFlow.toFixed(4);
    document.getElementById('neutral_mass_flow').textContent = neutralMassFlow.toFixed(4);
    document.getElementById('ion_current').textContent = ionCurrent.toFixed(6);
    document.getElementById('neutral_current').textContent = neutralCurrent.toFixed(6);
    document.getElementById('ion_energy_flow').textContent = ionEnergyFlow.toFixed(4);
    document.getElementById('neutral_energy_flow').textContent = neutralEnergyFlow.toFixed(4);
}

// Функции расчета параметров двигателя
function calculateSpecificImpulse(thrust, gasFlow) {
    return gasFlow > 0 ? (thrust / (gasFlow * 9.81)) * 1e3 : 0;
}

function calculateIonCost(powerHFG, gasFlow, gasUsage, gas) {
    return (gasFlow * gasUsage * 0.01) > 0 ? 
        (powerHFG * 1000 / (gasFlow * 1e-6 * gasUsage * 0.01 / gas.atomicMass / 1.66 / 1e-27 * 1.6 * 1e-19) - gas.ionizationEnergy) : 0;
}

function calculateEnergyFlow(jetPower, gasUsage) {
    return jetPower / gasUsage * 100;
}

function calculateEnergyEfficiency(thrustEfficiency, gasUsage) {
    return thrustEfficiency > 0 ? (thrustEfficiency / gasUsage) * 100 : 0;
}

function calculateJetPower(thrust, gasFlow) {
    return gasFlow > 0 ? (thrust * thrust) / (2 * gasFlow * 1e-6) * 1e-9 : 0;
}

function calculateThrustEfficiency(jetPower, powerHFG) {
    return powerHFG > 0 ? jetPower / powerHFG * 100 : 0;
}

// Функции расчета параметров частиц
function calculateIonVelocity(particleEnergy, gas) {
    return Math.sqrt(2 * particleEnergy * 1.602e-19 / (gas.atomicMass * 1.6605e-27)) / 1000;
}

function calculateNeutralVelocity(neutralEnergy, gas) {
    return Math.sqrt(2 * neutralEnergy * 1.602e-19 / (gas.atomicMass * 1.6605e-27)) / 1000;

}

function calculateIonEnergyFlow(ionCurrent, ionEnergy) {
    return ionCurrent * ionEnergy / 1000;
}

function calculateNeutralEnergy(energyFlow, ionEnergyFlow, neutralCurrent) {
    return (energyFlow-ionEnergyFlow)/(neutralCurrent)*1000;
}

function calculateNeutralEnergyFlow(neutralCurrent, neutralEnergy) {
    return neutralCurrent * neutralEnergy/1000;
}

// Функция для связи расхода газа и эквивалентного тока
function syncGasFlowAndCurrent() {
    const gas = GAS_PROPERTIES[selectedGas];
    const elementaryCharge = 1.60217662e-19;
    const avogadroNumber = 6.02214076e23;
    
    // Если меняется расход газа, пересчитываем ток
    if (this.id === 'gas_flow') {
        const newGasFlow = parseFloat(this.value) || 0;
        const newCurrent = (newGasFlow * 1e-6) / (gas.atomicMass * 1e-3) * avogadroNumber * elementaryCharge;
        document.getElementById('equivalent_current').value = newCurrent.toFixed(6);
    }
    // Если меняется ток, пересчитываем расход газа
    else if (this.id === 'equivalent_current') {
        const newCurrent = parseFloat(this.value) || 0;
        const newGasFlow = (newCurrent * gas.atomicMass * 1e-3) / (elementaryCharge * avogadroNumber) * 1e6;
        document.getElementById('gas_flow').value = newGasFlow.toFixed(4);
    }
    
    calculateAll();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчики изменений для всех полей ввода
    const inputFields = [
        'gas_type', 'gas_flow', 'equivalent_current', 
        'gas_usage', 'particle_energy', 'thrust', 'power_hfg'
    ];
    
    inputFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', calculateAll);
    });
    
    // Особые обработчики для связи расхода газа и тока
    document.getElementById('gas_flow').addEventListener('input', syncGasFlowAndCurrent);
    document.getElementById('equivalent_current').addEventListener('input', syncGasFlowAndCurrent);
    
    // Выполняем первоначальный расчет
    calculateAll();
});