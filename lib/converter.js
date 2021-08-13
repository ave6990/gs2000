/** Библиотека конвертации единиц измерения.
 * @author: ave6990
 * @email: ave6990@ya.ru
 * @version: 0.1.0
 * @license: MIT
 */

const quantityUnits = {
    pressure: {
        Pa: {
            from: (val) => val,
            to: (val) => val
        },
        atm: {
            from: (val) => val * 101.325,
            to: (val) => val / 101.325
        }
    },
    volume: {
        'm^3': {
            from: (val) => val,
            to: (val) => val
        },
        'dm^3': {
            from: (val) => val / 10 ** 3,
            to: (val) => val * 10 ** 3
        },
        'cm^3': {
            from: (val) => val / 10 ** 6,
            to: (val) => val * 10 ** 6
        },
        'mm^3': {
            from: (val) => val / 10 ** 9,
            to: (val) => val * 10 ** 9
        },
        l: {
            from: (val) => val / 10 ** 3,
            to: (val) => val * 10 ** 3
        },
        ml: {
            from: (val) => val / 10 ** 6,
            to: (val) => val * 10 ** 6
        }
    },
    distance: {
        m: (val) => val,
        dm: (val) => val * 10,
        cm: (val) => val * 100,
        mm: (val) => val * 10 ** 3
    },
    concentration: {
        'ppm': (val) => val * 1,
        '%': (val) => val / (10 ** 4),
        'g/m^3' : (val) => val * 1,
        'mg/m^3': (val) => val * 10 ** 3
    }
}

const molar_mass = {
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

const molar_volume = {
    'air': 24.06,
    'n2': 24.04,
}

const lel = {C3H8: 17000, C3H6: 20000, C4H10: 13000, C5H12: 15000, C6H14: 10000,
    C6H6: 12000, C2H4: 23000, C2H2: 23000, C2H6: 25000, H2: 40000, H2S: 40000}

const isGas = (gas_name) => {
    if (Object.keys(molar_mass).some(x => x.toUpperCase() == gas_name.toUpperCase())) {
        return true
    }
    else {
        return false
    }
}

const coefficient = (gas, temp = 20, press = 101.325) => {
    gas = gas.toUpperCase()

    if (isGas(gas)) {
        return press * molar_mass[gas] / 8.314463 / (temp + 273.15)
    }
    else {
        throw new Error('Unknown gas')
    }
}

const _k = (k) => {
    return (val) => val * k
}

/*
Object.keys(u).filter(q =>
    Object.keys(u[q]).some(u =>
        u == 'm3' ))
*/

export { molar_mass, molar_volume, isGas, coefficient, lel }
