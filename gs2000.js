import { convert } from './lib/converter.js'
import { reCalculate, calculate, minConc, maxConc, components, 
    mapCoefficients, checkInData } from './lib/gs2000.lib.js'
import { passCoefficients } from './lib/coefficients.js'

const coefficients = { 'air': mapCoefficients(passCoefficients.air),
    'n2': mapCoefficients(passCoefficients.n2),
}

/** Массив переключателей клапанов */
let valves = []

for (let i = 1; i <= 10; i++) {
    valves.push(document.getElementById(`v${i}`))
}

/** Обработчик событий на переключатели. */
valves.forEach( (valve) => {
    valve.addEventListener("change", (event) => {
        const inData = Object.assign({}, readData())
        inData.valves = readValvesState()
        const outData = Object.assign({}, inData, reCalculate(inData))
        outData.conc += h2sCorrection(outData)
        outData.concInUnit = convert(outData.conc, 'ppm', outData.targetUnit,
            outData.component, outData.diluent)
        document.getElementById('target_conc').value = resRound(outData.concInUnit)
        displayResults(outData)
    })
})

/** Сбросить положение переключателей. */
const clearValves = () => {
    valves.forEach( (valve) => {
        valve.checked = false
    })
}

/** Прочитать положение переключателей. */
const readValvesState = () => {
    const active_valves = valves.map( (valve, i) => {
        if (valve.checked == true) {
            return i + 1
        }
    })
    return active_valves.filter( (val) => {
        if (val) {
            return val
        }
    } )
}

/** Вывести сообщение в текстовое поле лога. */
const log = (s) => {
    const textarea = document.getElementById('info')
    textarea.value += `\n${s}`
    textarea.scrollTop = textarea.scrollHeight
}

/** Вывод результата. */
const displayResults = (data) => {
    const time = new Date()
    log(`\n\n${time}`)
    log(`${'*'.repeat(16)}Calculate${'*'.repeat(16)}`)

    for (const key of Object.keys(data)) {
        if (key != 'coeff') {
            log(`${key}:${' '.repeat(20 - key.length)} ${data[key]}`)
        }
    }
    
    log(`${'*'.repeat(14)}End calculate${'*'.repeat(14)}`)
    document.getElementById('result_conc').value = `${resRound(data.concInUnit)} ${data.targetUnit}`

    data.valves.forEach( (valve) => {
        valves[valve - 1].checked = true
    } )
}

const warning = (message) => {
    const time = new Date()
    log(`\n${time}`)
    log(`WARNING!!!:\n\t${message}\n`)
}

/** Очистить текстовое поле лога. */
const clearLog = () => {
    document.getElementById('info').value = ''
}

document.getElementById('info').addEventListener('dblclick', clearLog)

document.getElementById('btn_calc').addEventListener('click', (event) => {
    clearValves()
    const inData = readData()
    const outData = Object.assign({}, inData, calculate(inData))
    outData.conc += h2sCorrection(outData)
    outData.concInUnit = convert(outData.conc, 'ppm', outData.targetUnit,
        outData.component, outData.diluent)
    displayResults(outData)
} )

/** Коррекция расчета малых концентраций сероводорода согласно РЭ. */
const h2sCorrection = ({conc, component}) => {
    if (component = 'H2S' && conc >= 0.005 && conc <= 0.01) {
        log(`H2S коррекция:\n\t${conc} + 0.00025`)
        return 0.00025
    }
    return 0
}

/** Наполнение listBox списком компонентов пригодных для разбавления. */
components.forEach( (c) => {
    let option = document.createElement('option')
    option.value = c
    option.text = c
    document.getElementById('component').append(option)
} )

/** Округление результата (~ на 2 порядка точнее погрешности генератора) */
const resRound = (val) => {
    if (val == 0) {
        return 0
    }
    
    let exp = Math.log10(val)
    
    if (exp > 0) {
        exp = Math.ceil(exp)
    } else {
        exp = Math.floor(exp)
    }

    if (exp < 0) {
        exp = exp - 3
    } else {
        exp = exp - 5
    }

    if (exp < 0) {
        return Math.round(val * (10 ** Math.abs(exp))) / (10 ** Math.abs(exp))
    }

    return Math.round(val)
}

/** Чтение исходных данных. */
const readData = () => {
    const data = {}
    data.diluent = document.getElementById('diluent').value
    data.coeff = coefficients[data.diluent]
    data.sourceUnit = document.getElementById('source_unit').value
    data.targetUnit = document.getElementById('target_unit').value
    data.component = document.getElementById('component').value
    data.sourceConcInUnit = parseFloat(document.getElementById('source_conc').value.replace(',', '.'))
    data.sourceConc = convert(data.sourceConcInUnit, data.sourceUnit,
        'ppm', data.component, data.diluent)
    data.targetConcInUnit = parseFloat(document.getElementById('target_conc').value.replace(',', '.'))
    data.targetConc = convert(data.targetConcInUnit, data.targetUnit,
        'ppm', data.component, data.diluent)

    /* Проверка исходных данных */
    try {
        checkInData(data)
    } catch (e) {
        warning(`\n${e.name}\n\t${e.message}\n`)
    }

    return data
}
