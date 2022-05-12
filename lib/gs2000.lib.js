/** Библиотека расчета режимов работы генератора ГС-2000.
* @author Aleksandr Ermolaev [ave6990]
* @email ave6990@ya.ru
* @version 2.2.0
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
* @param {float[]} inList массив значений исходного множества
* @return { float, integer[]} объект содержащий вычисленное значение
* (близкое к заданному) и массив значений индексов */
const subsetSum = (target, inList) => {
    const list = [...inList].sort((a, b) => a < b ? 1 : a > b ? -1 : 0)
    const res = []
    const indexes = []

    const diff = (val) => Math.abs(target - sum(res) - val)

    for (let i = 0; i < list.length; i++) {
        const tRes = target - sum(res)

        if (list[i] <= tRes) {
            res.push(list[i])
            indexes.push(10 - i)
        } else if (i < list.length - 1) {
            if (sum(res) > 0 && diff(list[i+1]) > diff(list[i])) {
                res.push(list[i])
                indexes.push(10 - i)
            }
        } else {
            if (diff(list[i]) < diff(0)) {
                res.push(list[i])
                indexes.push(10 - i)
            }
        }
    }

    return { res: sum(res), indexes: indexes, }
}

const calculate = ({ coeff, sourceConc, targetConc }) => {
    const k = targetConc / (sourceConc - targetConc) 
    const { res, indexes } = subsetSum(k, coeff) 

    return {conc: sourceConc / (1 / res + 1), valves: indexes, }
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

const minConc = ( { coeff, sourceConc } ) => {
    return sourceConc / (1 / coeff[0] + 1)
}

const maxConc = ( { coeff, sourceConc } ) => {
    return sourceConc / (1 / sum(coeff) + 1)
}

export { mapCoefficients, calculate, reCalculate, 
    components, minConc, maxConc, checkInData }
