# gs2000

Программа выполняет расчет режимов работы генератора-разбавителя ГС-2000 производства [АО "Оптэк"](https://optec.ru).
Программа предназначена для расчета режимов работы генератора ГС-2000 зав. № 58-2-21 (каждый генератор ГС-2000
имеет индивидуальные коэффициенты разбавления, значения которых указаны в паспорте).

## Запуск программы

Запустить программу можно по ссылке [gs2000](https://ave6990.github.io/gs2000/gs2000.html).

## Использование программы

Для выполнения расчета необходимо:
* выбрать целевой компонент (при необходимости пересчета целевой концентрации в единицах мг/м^3);
* выбрать единицу измерения концентрации целевого компонента в исходной газовой смеси (ГС);
* выбрать газ-разбавитель;
* ввести значение концетрации целевого компонента в исходной ГС;
* выбрать единицу измерения концентрации целевого компонента в ГС на выходе генератора;
* ввести требуемое значение концетрации целевого компонента в ГС на выходе генератора;
* нажать кнопку "Расчитать".

Кроме того возможно решение обратной задачи: по заданному положению переключателей клапанов расчитать
концентрацию целевого компонента в ГС на выходе генератора. Для этого нужно выполнить первые 5 пунктов
описанных выше. Затем выставить флажки положения переключателей клапанов в заданное положение. 
При переключении каждого флажка будет производиться пересчет концентрации на выходе генератора в выбранных единицах.

## Версии

* v2.1.0 - Используется новая версия библиотеки gs2000.lib.js.

Исходное множество значений коэффициентов разбавления K отображено в
новое множество вида L = { 1 / (k1 - 1) , 1 / (k2 - 1), ..., 1 / (k10 - 1) }.
За счет чего вычисление коэффициента разбавления для нескольких клапанов
вычисляется как сумма 
l = a1 * l1 + a2 * l2 + ... + a10 * l10
вместо 
k = 1 / (1 / (a1 * k1 - 1) + 1 / (a2 * k2 - 1) + ... + 1 / (a10 * k10 - 1)) + 1,
где ai принадлежит множеству { 0, 1 }.

* v2.0.3 - Отключено ограничение исходной концентрации (только сообщения).
* v2.0.2 - Исправлена таблица стилей.
* v2.0.1 - Исправлен баг с расчетом максимальной и минимальной концентрации на выходе генератора.
Добавлено текстовое поле для логирования расчетов и вывода сообщений об ошибках.
* v2.0.0 - используется новый алгоритм расчета оптимального режима работы генератора.
