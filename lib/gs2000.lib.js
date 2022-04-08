/** Библиотека расчета режимов работы генератора ГС-2000.
* @author Aleksandr Ermolaev [ave6990]
* @email ave6990@ya.ru
* @version 2.0.0
* @license MIT
*/

/** Функция отображения множества паспортных значений коэффициентов K = {k1, k2, .., k10}
* на можество значений вида L = {1/(k1 - 1), 1/(k2 - 1), .., 1/(k10 - 1)
* для упрощения дальнейших вычислений. */
const mapCoefficients = (coeff) => {
    return coeff.map((val) => 1 / (val - 1))
}

/** Перечень газов подлежащих разбавлению с помощью генератора, согласно РЭ. */
const components = ['NO', 'NO2', 'N2O', 'NH3', 'H2', 'H2S', 'SO2',
    'O2', 'CO', 'CO2', 'CS2', 'CH4', 'C2H6', 'C3H8', 'C4H10',
    'C5H12', 'C6H14', 'CH3OH', 'CH3SH', 'CH3OCH3', 'C2H5OH',
    'C2H4O']

/** Значения НКПР согласно ГОСТ Р 52136-2003. */
const lel = { CH4: 44000, C2H6: 25000, C3H8: 17000, C4H10: 14000, C5H12: 14000, 
    C6H14: 10000, H2: 40000, H2S: 40000, CO: 100000, CS2: 600000, NH3: 150000,
    H2: 40000, H2S: 40000, CH3OH: 55000, CH3SH: 41000, C2H5OH: 31000, C2H4O: 40000, }

/** Вычисление суммы значений массива. */
const sum = (vals) => {
    return vals.reduce((a, b) => a + b, 0)
}

/** @description Реализация алгоритма решения задачи о сумме подмножеств.
* @param {float} target целевое значение суммы
* @param {float[]} list массив значений исходного множества
* @return {float[]} массив значений подмножества сумма которых близка к целевой */
const subsetSum = (target, list) => {
    const acc = (vals) => {
        return target - sum(vals) 
    }

    let variants = {}
    let resList = []
    let curList = [...list]

    while (curList.length > 0) {
        const tempTarget = acc([...resList])
        curList = spliceList(tempTarget, curList)
        const current = curList.pop()
        const tempList = [current, ...resList]

        if (Math.abs(acc(tempList)) < 
                Math.abs(acc(resList)) || 
                resList.length == 0) {
            if (acc(tempList) < 0) {
                variants[Math.abs(acc(tempList))] = tempList
            } else {
                resList.push(current)
           }
        }
    }

    if (resList.length > 0) {
        variants[Math.abs(acc(resList))] = [...resList]
    }

    return variants[Math.min(...Object.keys(variants).map(Number))]
}

const calculate = ({ coeff, sourceConc, targetConc }) => {
    const k = targetConc / (sourceConc - targetConc) 
    const kList = subsetSum(k, coeff) 
    const res = sourceConc / (1 / sum(kList) + 1)
    const indexList = kList.map( (val) => {
        return coeff.indexOf(val) + 1
    } )

    return {conc: res, valves: indexList, }
}

/** Проверка соответствия значения концентрации исходной ГС требованиям РЭ и описания типа. */
const checkInData = ({coeff, sourceConc, targetConc, diluent, component}) => {
    let message = ''

    if (sourceConc > 20000) {
        message = `Содержание целевого компонента в исходной ГС не должно превышать 2 % (20000 ppm)!`
        throw new GS2000Error(message)
    } else if (sourceConc < 0) {
        messgae = `Содержание целевого компонента должно быть выражено положительным числом!`
        throw new GS2000Error(message)
    }

    if (sourceConc > lel[component] / 2) {
        message = `Содержание целевого компонента не должно превышать 50% НКПР: ${lel[component] / 20000} % об.` 
        throw new GS2000Error(message)
    }
    const maxVal = maxConc({ coeff: coeff, sourceConc: sourceConc, })
    const minVal = minConc({ coeff: coeff, sourceConc: sourceConc, })

    if (targetConc > maxVal) {
        message = `Концентрация ГС на выходе не может быть больше ${maxVal} ppm!`
        throw new GS2000Error(message)
    } else if (targetConc < minVal) {
        message = `Концентрация ГС на выходе не может быть меньше ${minVal} ppm!`
        throw new GS2000Error(message)
    }
}

/** Функция сравнения чисел по признаку их близости к некоторому заданному значению. */
const sortFunc = (value, reverse = false) => {
    const k = reverse ? -1 : 1

    return (a, b) => {
        if (Math.abs(a - value) > Math.abs(b - value)) {
            return -1 * k
        }
        if (Math.abs(a - value) < Math.abs(b - value)) {
            return 1 * k
        }
        else {
            return 0
        }
    }
}

/** Удаляет из списка значения большие заданного. */
const spliceList = (value, list) => {
    let tempList = [...list]

    const first = tempList.sort(sortFunc(value)).pop()
    const index = list.indexOf(first)

    if (index >= 0) {
        tempList = [...list]
        tempList.splice(index + 1)
    }

    return tempList
}

/** Обратный расчет - концентрация расчитывается по номерам клапанов. */
const reCalculate = ( {coeff, sourceConc, valves} ) => {
    const kList = valves.map( (val) => {
        return coeff[val - 1]
    } )

    if (kList.length < 1) {
        return { conc: 0, valves: [] }
    }

    return { conc: sourceConc / (1 / sum(kList) + 1),
        valves: valves,
    }
}

class GS2000Error {
    constructor(message, cause) {
        this.message = message
        this.cause = cause
        this.name = 'GS2000Error'

        if (this.cause) {
            this.stack = this.cause
        }
    }
}

const minConc = ( { coeff, sourceConc } ) => {
    return sourceConc / (1 / coeff[0] + 1)
}

const maxConc = ( { coeff, sourceConc } ) => {
    return sourceConc / (1 / sum(coeff) + 1)
}

export { mapCoefficients, calculate, reCalculate, 
    components, minConc, maxConc, checkInData }
