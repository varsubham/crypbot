// convert unixTime to date and time
exports.convertDateTime = (unixTimeStamp) => {
  let convertedDateTime = "";
  convertedDateTime += new Date(unixTimeStamp).toLocaleDateString("en-IN");
  convertedDateTime += "   ";
  convertedDateTime += new Date(unixTimeStamp).toTimeString().slice(0, 8);
  return convertedDateTime;
};
