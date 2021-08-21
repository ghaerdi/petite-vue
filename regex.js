const foodList = ["apple", "soap", "banana", "watermelon", "pizza"];

function getFruits(foodList) {
  const fruitRGX = /apple|banana|watermelon/g;
  const fruitList = [];

  for (const food of foodList) {
    if (!fruitRGX.test(food)) continue;

    fruitList.push(food);
  }

  return fruitList;
}

const fruits = getFruits(foodList);
const expect = ["apple", "banana", "watermelon"];

console.log({ fruits, expect });
// output:
// {
// 	fruits: [ "apple", "banana" ],
// 	expect: [ "apple", "banana", "watermelon" ]
// }
