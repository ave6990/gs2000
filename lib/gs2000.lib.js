/** Библиотека расчета режимов работы генератора ГС-2000.
* @author: Aleksandr Ermolaev [ave6990]
* @email: ave6990@ya.ru
* @version: 2.0.0
* @license: MIT
*/

/** Коэффициенты разбавления (паспортные значения). */
const passCoefficients = {'air': [1176, 513, 253, 134, 70.4, 46.8, 36.3, 24.3, 14, 10.5],
    'n2': [1196, 522, 267, 136, 71.6, 47.6, 36.9, 24.7, 14.2, 10.7],
}

/** Функция отображения множества паспортных значений коэффициентов K = {k1, k2, .., k10}
* на можество значений вида L = {1/(k1 - 1), 1/(k2 - 1), .., 1/(k10 - 1)
* для упрощения дальнейших вычислений. */
const mapCoefficients = (coeff) => {
    return coeff.map((val) => 1 / (val - 1))
}

/** Отображенное множество коэффициентов разбавления. */
const coefficients = {'air': mapCoefficients(passCoefficients.air),
    'n2': mapCoefficients(passCoefficients.n2),
}

/** Перечень газов подлежащих разбавлению с помощью генератора, согласно РЭ. */
const components = ['NO', 'NO2', 'N2O', 'NH3', 'H2', 'H2S', 'SO2',
    'O2', 'CO', 'CO2', 'CS2', 'CH4', 'C2H6', 'C3H8', 'C4H10',
    'C5H12', 'C6H14', 'CH3OH', 'CH3SH', 'CH3OCH3', 'C2H5OH',
    'C2H4O']

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

    console.log({ conc: res, valves: indexList})

    return {conc: res, valves: indexList, }
}

/** Проверка соответствия значения концентрации исходной ГС требованиям РЭ и описания типа. */
const checkInData = ({coeff, sourceConc, targetConc}) => {
    let message = ''

    if (sourceConc > 20000) {
        message = `${message}\nСодержание целевого компонента в исходной ГС не должно превышать 2 % (20000 ppm)!`
    } else if (sourceConc < 0) {
        messgae = `${message}\nСодержание целевого компонента должно быть выражено положительным числом!`
    }

    const maxConcVal = maxConc({coeff: coeff, sourceConc: sourceConc})
    const minConcVal = minConc({coeff: coeff, sourceConc: sourceConc})

    if (targetConc > maxConcVal) {
        message = `${message}\nКонцентрация ГС на выходе не может быть больше ${maxConcVal} ppm!`
    } else if (targetConc < minConcVal) {
        message = `${message}\nКонцентрация ГС на выходе не может быть меньше ${minConcVal} ppm!`
    }

    throw new GS2000Error(message)
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
    checkInData({sourceConc})

    const kList = valves.map( (val) => {
        return coeff[val - 1]
    } )

    return { conc: sourceConc / (1 / sum(kList) + 1),
        valves: valves,
    }
}

/** Максимальная возможная концентрация на выходе генератора, при данном
 * значении исходой коцентрации. */
const maxConc = ({coeff, sourceConc}) => {
    return reCalculate( {coeff: coeff,
        sourceConc: sourceConc,
        valves: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    } )
}

/** Минимальная возможная концентрация на выходе генератора, при данном
 * значении исходой коцентрации. */
const minConc = ({coeff, sourceConc}) => {
    return reCalculate( {coeff: coeff,
        sourceConc: sourceConc,
        valves: [10],
    } )
}

class GS2000Error {
    constructor(message, cause) {
        this.message = message
        this.cause = cause
        this.name = GS2000Error

        if (this.cause) {
            this.stack = this.cause
        }
    }
}

export { calculate, reCalculate, minConc, maxConc, coefficients, components }
