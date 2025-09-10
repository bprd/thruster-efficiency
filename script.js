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
    
    // Выполняем расчеты (здесь должны быть ваши реальные формулы)
    const powerFlow = calculatePowerFlow(thrust, gasFlow, gasUsage);
    const particleEnergy = calculateParticleEnergy(thrust, gasFlow, gasUsage, gas);
    const particleVelocity = calculateParticleVelocity(thrust, gasFlow, gasUsage, gas);
    const efficiency = calculateEfficiency(powerFlow, powerHFG);
    const specificImpulse = calculateSpecificImpulse(thrust, gasFlow);
    const ionCost = calculateIonCost(powerHFG, gasFlow, gasUsage, gas);
    
    // Обновляем результаты на странице
    document.getElementById('power_flow').textContent = powerFlow.toFixed(4);
    document.getElementById('particle_energy').textContent = particleEnergy.toFixed(2);
    document.getElementById('particle_velocity').textContent = particleVelocity.toFixed(2);
    document.getElementById('efficiency').textContent = efficiency.toFixed(2);
    document.getElementById('specific_impulse').textContent = specificImpulse.toFixed(2);
    document.getElementById('ion_cost').textContent = ionCost.toFixed(2);
}

// Функции расчета (замените на ваши реальные формулы)
function calculatePowerFlow(thrust, gasFlow, gasUsage) {
    // Пример расчета: мощность потока = расход газа * коэффициент использования * константа
    return thrust * thrust / (gasFlow * gasUsage * 0.01) / 1e3 / 2;
}

function calculateParticleEnergy(thrust, gasFlow, gasUsage, gas) {
    // Пример расчета: энергия частиц = мощность / (расход газа * атомная масса)
    return gas.atomicMass * 1.66 * 1e-27 * 1e6 * (thrust / (gasFlow * gasUsage * 0.01)) * (thrust / (gasFlow * gasUsage * 0.01)) / 2 / 1.6 / 1e-19;
}

function calculateParticleVelocity(thrust, gasFlow, gasUsage, gas) {
    // Пример расчета: скорость = sqrt(2 * энергия / масса)
    return (thrust / (gasFlow * gasUsage * 0.01));

}

function calculateEfficiency(powerFlow, powerHFG) {
    // Пример расчета: КПД = (мощность потока / мощность ВЧГ) * 100
    return powerHFG > 0 ? (powerFlow / powerHFG) * 100 : 0;
}

function calculateSpecificImpulse(thrust, gasFlow) {
    // Пример расчета: удельный импульс = тяга / (расход газа * g)
    return (thrust / (gasFlow * 9.81)) * 1e3;
}

function calculateIonCost(powerHFG, gasFlow, gasUsage, gas) {
    // Пример расчета: цена иона = мощность ВЧГ / (расход газа * коэффициент использования)
    return (gasFlow * gasUsage * 0.01) > 0 ? (powerHFG * 1000 / (gasFlow * 1e-6 * gasUsage * 0.01 / gas.atomicMass / 1.66 / 1e-27 * 1.6 * 1e-19) - gas.ionizationEnergy) : 0;
}

// Функции для перетаскивания элементов
function initDragAndDrop() {
    const inputContainer = document.querySelector('.input-section');
    const outputContainer = document.querySelector('.output-section');
    
    // Делаем все группы перетаскиваемыми
    const draggableElements = document.querySelectorAll('.input-group, .result-group');
    
    draggableElements.forEach(element => {
        element.setAttribute('draggable', 'true');
        
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', element.id);
            element.classList.add('dragging');
        });
        
        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });
    });
    
    // Настраиваем зоны, куда можно перетаскивать
    const dropZones = [inputContainer, outputContainer];
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const id = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(id);
            
            if (draggedElement) {
                zone.appendChild(draggedElement);
                saveLayout();
            }
        });
    });
}

// Сохранение расположения элементов в localStorage
function saveLayout() {
    const inputSection = document.querySelector('.input-section');
    const outputSection = document.querySelector('.output-section');
    
    const inputOrder = Array.from(inputSection.children)
        .filter(el => el.classList.contains('input-group') || el.classList.contains('result-group'))
        .map(el => el.id);
    
    const outputOrder = Array.from(outputSection.children)
        .filter(el => el.classList.contains('input-group') || el.classList.contains('result-group'))
        .map(el => el.id);
    
    localStorage.setItem('inputOrder', JSON.stringify(inputOrder));
    localStorage.setItem('outputOrder', JSON.stringify(outputOrder));
}

// Восстановление расположения элементов из localStorage
function loadLayout() {
    const inputOrder = JSON.parse(localStorage.getItem('inputOrder') || '[]');
    const outputOrder = JSON.parse(localStorage.getItem('outputOrder') || '[]');
    
    const inputSection = document.querySelector('.input-section');
    const outputSection = document.querySelector('.output-section');
    
    // Восстанавливаем порядок во входной секции
    inputOrder.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            inputSection.appendChild(element);
        }
    });
    
    // Восстанавливаем порядок в выходной секции
    outputOrder.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            outputSection.appendChild(element);
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохраненное расположение элементов
    loadLayout();
    
    // Инициализируем перетаскивание
    initDragAndDrop();
    
    // Добавляем обработчики изменений для автоматического расчета
    document.getElementById('gas_type').addEventListener('change', calculateAll);
    document.getElementById('gas_flow').addEventListener('input', calculateAll);
    document.getElementById('power_hfg').addEventListener('input', calculateAll);
    document.getElementById('gas_usage').addEventListener('input', calculateAll);
    document.getElementById('thrust').addEventListener('input', calculateAll);
    
    // Выполняем первоначальный расчет
    calculateAll();
});