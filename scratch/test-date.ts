const date1 = new Date("2026-09-13T18:30:00Z");
const offsetMinutes = 330;
const zonedTime = new Date(date1.getTime() + offsetMinutes * 60000);
console.log("Input to input field:", zonedTime.toISOString().slice(0, 16));

const inputStr = "2026-09-14T00:00";
const offset = "+05:30";
const isoString = `${inputStr}:00${offset}`;
const backToUtc = new Date(isoString).toISOString();
console.log("Back to DB:", backToUtc);
