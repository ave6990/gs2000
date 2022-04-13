/** Пересчет данных состава газовой смеси. (ГОСТ Р 8.974-2019).
 * @author Aleksandr Ermolaev [ave6990]
 * @email ave6990@ya.ru
 * @version 0.1.0
 * @license MIT
 */

const molarMass = {
    N2: 28.016, NH3: 17.031, Ar: 39.944, C2H2: 26.04,
    C3H6O: 58.08, C4H10: 58.12, C4H9OH: 74.12, H2O: 18.016,
    H2: 2.0156, air: 28.96, C6H14: 86.17, He: 4.003,
    C7H16: 100.19, CO2: 44.01, C10H22: 142.30, C12H10: 154.08,
    C12H10O: 168.8, CH2Cl2: 84.94, C4H10O: 74.12, N2O: 44.016,
    HJ: 127.93, O2: 32, Kr: 83.7, Xe: 131.3, CH4: 16.04,
    CH5N: 31.06, CH3OH: 32.04, Ne: 20.183, NOCl: 65.465,
    O3: 48.00, NO: 30.008, CO: 28.01, C8H18: 114.22,
    C5H12: 72.14, C3H8: 44.09, C3H6: 42.08, H2Se: 80.968,
    SO2: 64.06, SO3: 80.06, H2S: 34.08, PH3: 34.04,
    CF3Cl: 137.40, CF2Cl2: 120.92, CFCl3: 114.47, F2: 38,
    SiF4: 104.06, CH3F: 34.03, Cl2: 70.914, HCl: 36.465,
    CH3Cl: 50.49, CHCl3: 119.39, C2N2: 52.04, HCN: 27.026,
    C2H6: 30.07, C2H7N: 45.08, C2H4: 28.05, C2H5OH: 46.069,
    C2H5Cl: 64.52, CH3SH: 48.11, CS2: 76.1407, CH3OCH3: 46.069,
    C2H4O: 44.053, NO2: 46.0055,
}

const molarVolume = {
    'air': 24.06,
    'n2': 24.04,
}

/** Проверяет содержится ли строка в списке. */
const _inList = (val, list) => {
    return list.some(x => x.toUpperCase() == val.toUpperCase())
}

const isGas = (gasName) => {
    return _inList(gasName, Object.keys(molarMass))
}

/** Конвертация единиц величин, согласно п. 5.9 РЭ. */
const convert = (conc, sourceUnit, targetUnit, component, diluent, temp = 20, press = 101.3) => {
    [sourceUnit, targetUnit] = [sourceUnit, targetUnit].map( val => {
        return val.toUpperCase()
    } )

    const k = {'PPM': 1,
        'MG/M^3': molarVolume[diluent] * 101.3 * (273 + temp) / 293 / 101.3 / molarMass[component],
        '%': 10000,
    }
    
    return conc * k[sourceUnit] / k[targetUnit]
}


class ConverterError {
    constructor(name, message) {
        this.name = name
        this.message = message
    }
}

class GasNameError extends ConverterError {
    constructor() {
        super('GasNameError', 'Ошибка! Неизвестный газ.')
    }
}

class UnitsNameError extends ConverterError{
    constructor() {
        super('UnitsNameError', 'Ошибка! Неверные единицы измерения.')
    }
}

export { molarMass, molarVolume, isGas, convert }
