const fs = require('fs');

const map = {
  'exp-stroller-01': '/images/items/baby-stroller.jpg',
  'exp-baby-carrier-02': '/images/items/baby-carrier.jpg',
  'exp-konkur-exp-03': '/images/items/konkur-books.jpg',
  'exp-konkur-math-04': '/images/items/study-notes.jpg',
  'exp-konkur-humanities-05': '/images/items/humanities-books.jpg',
  'exp-kids-clothes-bundle-06': '/images/items/baby-clothes-app.jpg',
  'exp-kids-jacket-07': '/images/items/kids-jacket.jpg',
  'exp-kids-highchair-08': '/images/items/kids-highchair.jpg',
  'exp-kids-carseat-09': '/images/items/kids-carseat.jpg',
  'exp-lego-blocks-10': '/images/items/lego-blocks.jpg',
  'exp-plush-toys-11': '/images/items/plush-toys.jpg',
  'exp-kids-scooter-12': '/images/items/kids-scooter.jpg',
  'exp-pingpong-rackets-13': '/images/items/pingpong-rackets.jpg',
  'exp-pullup-bar-14': '/images/items/pullup-bar.jpg',
  'exp-dumbbells-15': '/images/items/dumbbells.jpg',
  'exp-yoga-mat-16': '/images/items/yoga-mat.jpg',
  'exp-running-shoes-17': '/images/items/running-shoes.jpg',
  'exp-classic-novels-18': '/images/items/classic-novels.jpg',
  'exp-psychology-books-19': '/images/items/psychology-books.jpg',
  'exp-kids-encyclopedia-20': '/images/items/kids-encyclopedia.jpg',
  'exp-arcopal-set-21': '/images/items/arcopal-set.jpg',
  'exp-cast-iron-pot-22': '/images/items/cast-iron-pot.jpg',
  'exp-electric-kettle-23': '/images/items/electric-kettle.jpg',
  'exp-wooden-desk-24': '/images/items/wooden-desk.jpg',
  'exp-office-chair-25': '/images/items/office-chair.jpg',
  'exp-desk-lamp-26': '/images/items/desk-lamp.jpg',
  'exp-acoustic-guitar-27': '/images/items/acoustic-guitar.jpg',
  'exp-sansevieria-plant-28': '/images/items/sansevieria-plant.jpg',
  'exp-pothos-plant-29': '/images/items/pothos-plant.jpg',
  'exp-toolbox-set-30': '/images/items/toolbox-set.jpg'
};

let content = fs.readFileSync('./src/data/exploreData.ts', 'utf8');

for (const [id, newUrl] of Object.entries(map)) {
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?imageUrl:\\s*)'[^']+'`);
  if (!regex.test(content)) {
    console.error('Pattern not found for:', id);
  } else {
    content = content.replace(regex, `$1'${newUrl}'`);
  }
}

fs.writeFileSync('./src/data/exploreData.ts', content, 'utf8');
console.log('Updated exploreData.ts successfully!');
