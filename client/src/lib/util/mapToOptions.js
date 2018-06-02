export default function (array, labelField, valueField, defaultLabel) {
    let result = [{ value: '', label: defaultLabel ? defaultLabel : 'Select One' }];
    array.forEach(entry => result.push({ value: entry[valueField], label: entry[labelField] }));
    return result;
}