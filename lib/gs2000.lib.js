/** Библиотека расчета режимов работы генератора ГС-2000.
* @author: Aleksandr Ermolaev [ave6990]
* @email: ave6990@ya.ru
* @version: 1.3.2
* @license: MIT
*/

/** Коэффициенты разбавления (паспортные значения). */
const coefficients = {'air': [1176, 513, 253, 134, 70.4, 46.8, 36.3, 24.3, 14, 10.5],
    'n2': [1196, 522, 267, 136, 71.6, 47.6, 36.9, 24.7, 14.2, 10.7],
}

const components = ['NO', 'NO2', 'N2O', 'NH3', 'H2', 'H2S', 'SO2', 
    'O2', 'CO', 'CO2', 'CS2', 'CH4', 'C2H6', 'C3H8', 'C4H10',
    'C5H12', 'C6H14', 'CH3OH', 'CH3SH', 'CH3OCH3', 'C2H5OH',
    'C2H4O']

const calculate = ({ coeff, source_conc, target_conc }) => {
    let temp_coeff = [...coeff]
    let variants = {}
    let res = 0
    let k_list = []

    /** Проверка исходной концентрации смеси. */
    //checkInData({ source_conc })

    while (temp_coeff.length > 0) {
        const target_k = source_conc / (target_conc - res)
        temp_coeff = spliceList(target_k, temp_coeff)

        const k = temp_coeff.pop()
        const temp_res = source_conc / calcCoefficient([k, ...k_list])

        if (sortFunc(target_conc)(res, temp_res) > 0 || res == 0) {
            if (temp_res > target_conc) {
                variants[temp_res] = [k, ...k_list]
            } else {
                k_list.push(k)
                res = temp_res
            }
        }
    }

    if (k_list.length > 0) {
        variants[res] = [...k_list]
    }

    const results = Object.keys(variants).map((val) => parseFloat(val))
    res = results.sort(sortFunc(target_conc))[0]
    k_list = variants[res]

    const index_list = k_list.map( (val) => {
        return coeff.indexOf(val) + 1
    } )

    return {conc: res, valves: index_list, }
}

/** Проверка соответствия значения концентрации исходной ГС требованиям РЭ и описания типа. */
const checkInData = ({source_conc}) => {
    if (source_conc > 20000) {
        throw new GS2000Error('Содержание целевого компонента в исходной ГС не должно превышать 2 % (20000 ppm)!')
    }

    if (source_conc < 0) {
        throw new GS2000Error('Содержание целевого компонента должно быть выражено положительным числом!')
    }
}

/** Расчет коэффициента разбавления, при включении
нескольких клапанов. */
const calcCoefficient = (list) => {
    const divider = list.map( (val) => {
        return 1 / (val -1)
    } )
    .reduce( (a, b) => {
        return a + b
    } )

    return 1 / divider + 1
}

/** Функция сравнения чисел по признаку их близости к некоторому заданному значению. */
const sortFunc = (value) => {
    return (a, b) => {
        if (Math.abs(a - value) > Math.abs(b - value)) {
            return 1
        }
        if (Math.abs(a - value) < Math.abs(b - value)) {
            return -1
        }
        else {
            return 0
        }
    }
}

/** Удаляет из списка значения меньшие заданного. */
const spliceList = (value, list) => {
    let temp_list = [...list]

    const [first, second] = temp_list.sort(sortFunc(value))
    const index = list.indexOf(Math.min(first, second))

    if (index >= 0) {
        temp_list = [...list]
        temp_list.splice(index + 1)
    }

    return temp_list
}

/** Обратный расчет - концентрация расчитывается по номерам клапанов. */
const reCalculate = ( {coeff, source_conc, valves} ) => {
    checkInData({source_conc})

    const k_list = valves.map( (val) => {
        return coeff[val - 1]
    } )

    return { conc: source_conc / calcCoefficient(k_list),
        valves: valves,
    }
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

export { calculate, reCalculate, calcCoefficient, coefficients, components }
