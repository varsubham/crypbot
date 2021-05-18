module.exports = class Queue {
  constructor(size) {
    this.items = [];
    this.size = size;
  }
  enqueue(element) {
    if (this.items.length >= this.size) {
      this.dequeue();
      this.items.push(element);
    } else {
      this.items.push(element);
    }
  }
  pushKline(element) {
    const lastElement = this.back();
    if (
      lastElement.open_time === element.open_time &&
      lastElement.close_time === element.close_time
    ) {
      this.items[this.items.length - 1] = element;
    } else {
      this.enqueue(element);
    }
  }
  dequeue() {
    if (this.isEmpty()) {
      return "Underflow";
    }
    return this.items.shift();
  }
  front() {
    if (this.isEmpty()) {
      return "No elements in queue";
    }
    return this.items[0];
  }
  back() {
    if (this.isEmpty()) {
      return "No elements in queue";
    }
    return this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length == 0;
  }
  getElement(index) {
    if (index >= this.items.length) {
      return "Enter a valid index";
    }
    return this.items[index];
  }
  printQueue() {
    for (let i = 0; i < this.items.length; i++) {
      console.log(this.items[i] + " ");
    }
  }
};
