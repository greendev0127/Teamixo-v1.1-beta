export function PinCodeGeneration() {
  var number = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return number;
}
