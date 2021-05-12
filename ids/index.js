// storing unique ids(for setInterval), whenever
// a new post requests comes for price

const uniqueIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// returns a id from uniqueIds
exports.generateId = () => {
  const id = uniqueIds.pop();
  return id;
};

// push back the id when priceCheck is done
exports.pushId = (id) => {
  uniqueIds.push(id);
};
