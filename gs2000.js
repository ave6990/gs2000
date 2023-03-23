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
        outData.h2sCorrection = h2sCorrection(outData)
        outData.conc += outData.h2sCorrection
        outData.concInUnit = convert(outData.conc, 'ppm', outData.targetUnit,
            outData.component, outData.diluent)
        outData.targetConc = outData.conc
        outData.targetConcInUnit = outData.concInUnit
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

const zeroFill = (val) => {
    if (parseInt(val) < 10) {
        return `0${val}`
    }
    return `${val}`
}

/** Вывод результата. */
const displayResults = (data) => {
    const time = new Date()
    const resultConc = document.getElementById('result_conc')
    let msg = ''

    msg = `${zeroFill(time.getDate())}.${zeroFill(time.getMonth())}.${time.getFullYear()}`
    msg = `${msg} ${zeroFill(time.getHours())}:${zeroFill(time.getMinutes())}:${zeroFill(time.getSeconds())}`
    msg = `${msg} ${data.component}+${data.diluent} (${data.sourceConcInUnit} ${data.sourceUnit} -> `
    msg = `${msg}${data.targetConcInUnit} ${data.targetUnit}`
    msg = `${msg} = ${data.concInUnit} ${data.targetUnit}`
    msg = `${msg}${data.h2sCorrection ? ' + H2S correction' : ''}`
    msg = `${msg}) [${data.valves.sort((a, b) => {
        if (a < b) {
            return -1
        }
        if (a > b) {
            return 1
        }
        return 0
    })}] ${data.error ? `{${data.error}}`: ''}`

    log(msg)
 
    if (data.error) {
        resultConc.classList.add('error')
        resultConc.value = `${resRound(data.concInUnit)} ${data.targetUnit} {${data.error}}`
        clearValves()
        console.log('clear')
    } else {
        resultConc.classList.remove('error')
        resultConc.value = `${resRound(data.concInUnit)} ${data.targetUnit}`
    }

    data.valves.forEach( (valve) => {
        valves[valve - 1].checked = true
    } )
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
    outData.h2sCorrection = h2sCorrection(outData)
    outData.conc += outData.h2sCorrection
    outData.concInUnit = convert(outData.conc, 'ppm', outData.targetUnit,
        outData.component, outData.diluent)
    displayResults(outData)
    console.log(outData)
} )

/** Коррекция расчета малых концентраций сероводорода согласно РЭ. */
const h2sCorrection = ({conc, component}) => {
    if (component.toUpperCase() == 'H2S' && conc >= 0.005 && conc <= 0.01) {
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
    data.sourceConcInUnit = parseFloat(document.getElementById('source_conc').value.replace(',', '.').replace(' ', ''))
    data.sourceConc = convert(data.sourceConcInUnit, data.sourceUnit,
        'ppm', data.component, data.diluent)
    data.targetConcInUnit = parseFloat(document.getElementById('target_conc').value.replace(',', '.').replace(' ', ''))
    data.targetConc = convert(data.targetConcInUnit, data.targetUnit,
        'ppm', data.component, data.diluent)
    data.error = ''

    /* Проверка исходных данных */
    try {
        checkInData(data)
    } catch (e) {
        const msg = `${e.name}: ${e.message}`
        data.error = msg
    }

    return data
}
