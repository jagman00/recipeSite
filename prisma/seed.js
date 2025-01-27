const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

async function main() {
    //Dropping the tables if exists /*MODIFIED*/
    // await prisma.bookmark.deleteMany();
    // await prisma.comment.deleteMany();
    // await prisma.ingredient.deleteMany();
    // await prisma.like.deleteMany();
    // await prisma.recipe.deleteMany();
    // await prisma.category.deleteMany();
    // await prisma.userFollower.deleteMany();
    // await prisma.user.deleteMany();

  console.log('Seeding the database with random quantities');

  //Hardcoded Admin User /*MODIFIED*/ hashed for bcrypt
  console.log("Seeding Admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin Apple",
      email: "apple@gmail.com",
      password: hashedPassword,
      profileUrl: faker.image.avatar(),
      isAdmin: true,
    },
  });

// Seed Users /*MODIFIED*/ hashed for bcrypt
const users = [];
const userCount = faker.number.int({ min: 100, max: 120 });
console.log(`Seeding ${userCount} users...`);
for (let i = 0; i < userCount; i++) {
  const hashedPassword = await bcrypt.hash(faker.internet.password(), 10);
  users.push(
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        profileUrl: faker.image.avatar(),
        isAdmin: faker.datatype.boolean(),
        userTitle: faker.person.jobTitle(), // Adding userTitle
        bio: faker.lorem.paragraph(),      // Adding bio
        createdAt: faker.date.past({ years: 2 })
      },
    })
  );
}

// hard coded example steps for recipe seed
const exampleSteps = [
  [
      { stepNumber: 1, instruction: "Preheat the oven to 350°F (175°C)." },
      { stepNumber: 2, instruction: "Chop the vegetables into small pieces." },
      { stepNumber: 3, instruction: "Boil water and cook pasta for 10 minutes." },
      { stepNumber: 4, instruction: "Sauté onions and garlic in a pan until golden brown." },
      { stepNumber: 5, instruction: "Mix all ingredients in a large bowl." },
      { stepNumber: 6, instruction: "Bake in the oven for 25 minutes or until golden." },
      { stepNumber: 7, instruction: "Let the dish cool for 5 minutes before serving." }
  ],
  [
      { stepNumber: 1, instruction: "Wash and rinse the rice thoroughly." },
      { stepNumber: 2, instruction: "Marinate the chicken with spices and let it sit for 30 minutes." },
      { stepNumber: 3, instruction: "Heat oil in a skillet and cook the chicken until browned." },
      { stepNumber: 4, instruction: "Add rice and stir well with the chicken." },
      { stepNumber: 5, instruction: "Pour in chicken broth and bring to a boil." },
      { stepNumber: 6, instruction: "Cover and simmer for 20 minutes." },
      { stepNumber: 7, instruction: "Garnish with fresh cilantro and serve hot." }
  ],
  [
      { stepNumber: 1, instruction: "Whisk together eggs, milk, and a pinch of salt in a bowl." },
      { stepNumber: 2, instruction: "Heat a non-stick pan over medium heat." },
      { stepNumber: 3, instruction: "Pour the egg mixture into the pan." },
      { stepNumber: 4, instruction: "Add diced tomatoes, onions, and spinach on top." },
      { stepNumber: 5, instruction: "Fold the omelet in half and cook for another 2 minutes." },
      { stepNumber: 6, instruction: "Serve with toasted bread and avocado slices." },
      { stepNumber: 7, instruction: "Enjoy your healthy breakfast!" }
  ],
  [
      { stepNumber: 1, instruction: "Season the steak with salt, pepper, and olive oil." },
      { stepNumber: 2, instruction: "Preheat a grill pan over high heat." },
      { stepNumber: 3, instruction: "Grill the steak for 4-5 minutes on each side." },
      { stepNumber: 4, instruction: "Let the steak rest for 5 minutes before slicing." },
      { stepNumber: 5, instruction: "Prepare a side salad with fresh greens and dressing." },
      { stepNumber: 6, instruction: "Serve steak slices on a plate with the salad." },
      { stepNumber: 7, instruction: "Drizzle with balsamic glaze before serving." }
  ],
  [
      { stepNumber: 1, instruction: "Preheat your waffle iron." },
      { stepNumber: 2, instruction: "In a large bowl, mix flour, sugar, baking powder, and salt." },
      { stepNumber: 3, instruction: "Add milk, eggs, and melted butter to the dry mix." },
      { stepNumber: 4, instruction: "Whisk until smooth and lump-free." },
      { stepNumber: 5, instruction: "Pour batter into the preheated waffle iron." },
      { stepNumber: 6, instruction: "Cook waffles until golden brown and crispy." },
      { stepNumber: 7, instruction: "Serve with maple syrup and fresh berries." }
  ]
];

  // Seed Recipes
  const recipes = [];
  const recipeCount = faker.number.int({ min: 150, max: 200 });
  console.log(`Seeding ${recipeCount} recipes...`);
  for (let i = 0; i < recipeCount; i++) {
    const selectedSteps = faker.helpers.arrayElement(exampleSteps).map((step, index) => ({
      stepNumber: index + 1,
      instruction: step.instruction
  }));
    recipes.push(
      await prisma.recipe.create({
        data: {
          title: faker.food.dish(3),
          description: faker.food.description(2),
          servingSize: faker.number.int({ min: 1, max: 10 }),
          recipeUrl: faker.helpers.arrayElement([
            `https://i.ibb.co/3Y3GHPV/burger-with-melted-cheese.webp`,
            `https://i.ibb.co/g60FwWc/images.jpg`,
            `https://i.ibb.co/mTx5xPW/170920150817-chicken-parm.jpg`,
            `https://i.ibb.co/qsRqxxQ/1660928170362.webp`,
            `https://i.ibb.co/2qDcrPz/images-1.jpg`,
            `https://i.ibb.co/25mc2hz/download-3.jpg`,
            `https://i.ibb.co/3sTMf6n/download-4.jpg`,
            `https://i.ibb.co/tmMW5kb/download-5.jpg`,
            `https://i.ibb.co/CbvkzRy/images-2.jpg`,
            `https://i.ibb.co/KLd9fP0/download.jpg`,
            `https://i.ibb.co/rQNWj4z/images.jpg`,
            `https://i.ibb.co/RB3cjwr/istockphoto-1214416414-612x612.jpg`,
            `https://i.ibb.co/DzdttwP/shoyu-ramen-20181227133143.jpg`,
            `https://i.ibb.co/yh6vqjx/images-12.jpg`,
            `https://i.ibb.co/5TXh3JY/images-11.jpg`,
            `https://i.ibb.co/KzmHWG0/images-10.jpg`,
            `https://i.ibb.co/nChn4P0/images-9.jpg`,
            `https://i.ibb.co/f9wZCPd/images-8.jpg`,
            `https://i.ibb.co/XzYWc9s/images-7.jpg`,
            `https://i.ibb.co/TPp4c2y/images-6.jpg`,
            `https://i.ibb.co/1JQ4LCM/images-5.jpg`,
            `https://i.ibb.co/4KNp4LY/images-4.jpg`,
            `https://i.ibb.co/r0PBtdh/images-3.jpg`,
            `https://i.ibb.co/s6hGfxC/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg`,
            `https://i.ibb.co/M87L6DB/images-14.jpg`,
            `https://i.ibb.co/crncG78/images-13.jpg`]),
          steps: selectedSteps,
          userId: faker.helpers.arrayElement(users).userId,
          createdAt: faker.date.past({ years: 1 })
        },
      })
    );
  }

  // Seed Ingredients
  console.log('Seeding ingredients for each recipe...');
  for (const recipe of recipes) {
    const ingredientCount = faker.number.int({ min: 4, max: 6 });
    for (let i = 0; i < ingredientCount; i++) {
      await prisma.ingredient.create({
        data: {
          ingredientName: faker.food.ingredient(),
          quantityAmount: faker.number.float({ min: 0.1, max: 5 }).toFixed(2),
          quantityUnit: faker.helpers.arrayElement(['cup', 'tbsp', 'tsp', 'ml']),
          recipeId: recipe.recipeId,
        },
      });
    }
  }
// Seed Categories
const categories = [
  'Italian Cuisine',
  'French Cuisine',
  'Chinese Cuisine',
  'Japanese Cuisine',
  'Mexican Cuisine',
  'Indian Cuisine',
  'Thai Cuisine',
  'Greek Cuisine',
  'Spanish Cuisine',
  'Mediterranean Cuisine',
  'Middle Eastern Cuisine',
  'Korean Cuisine',
  'Vietnamese Cuisine',
  'American Cuisine',
  'British Cuisine',
  'German Cuisine',
  'Caribbean Cuisine',
  'Brazilian Cuisine',
  'African Cuisine',
  'Turkish Cuisine',
  'Russian Cuisine',
  'Portuguese Cuisine',
  'Filipino Cuisine',
  'Peruvian Cuisine',
  'Moroccan Cuisine'
];

console.log(`Seeding ${categories.length} categories...`);

for (const categoryName of categories) {
  await prisma.category.upsert({
    where: { categoryName }, // Use the unique field
    update: {}, // No updates if it already exists
    create: { categoryName },
  });
}

console.log('All categories have been seeded successfully!');


// Link Recipes with a Single Unique Category
console.log('Linking each recipe with one unique category...');

for (const recipe of recipes) {
  const randomCategory = faker.helpers.arrayElement(categories); // Pick one random category
  
  await prisma.recipe.update({
    where: { recipeId: recipe.recipeId },
    data: {
      categories: {
        set: [{ categoryName: randomCategory }], // Assign a single category
      },
    },
  });
}

console.log('Each recipe has been linked to one unique category!');

  // Seed Bookmarks /*MODIFIED*/ avoid duplicate bookmarks
  const bookmarkCount = faker.number.int({ min: 150, max: 200 });
  console.log(`Seeding ${bookmarkCount} bookmarks...`);
  for (let i = 0; i < bookmarkCount; i++) {
    const randomUserId = faker.helpers.arrayElement(users).userId;
    const randomRecipeId = faker.helpers.arrayElement(recipes).recipeId;
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: randomUserId,
        recipeId: randomRecipeId,
      },
    });
    if (!existingBookmark) {
      await prisma.bookmark.create({
        data: {
          userId: randomUserId,
          recipeId: randomRecipeId,
        },
      });
    } else {
      console.log(
        `Duplicate bookmark skipped for user${randomUserId} and recipe ${randomRecipeId}`
      );
    }
  }

  // ***** Seed Comments

  // const createdAt = faker.date.past({ years: 1 });
  // const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

  const commentCount = faker.number.int({ min: 150, max: 200 });
  console.log(`Seeding ${commentCount} comments`);
  for (let i = 0; i < commentCount; i++) {
    const createdAt = faker.date.past({ years: 1 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    
    await prisma.comment.create({
      data: {
        text: faker.food.adjective(),
        userId: faker.helpers.arrayElement(users).userId,
        recipeId: faker.helpers.arrayElement(recipes).recipeId,
        createdAt: createdAt,
        updatedAt: updatedAt,
      },
    });
  }

  // Seed Likes /*MODIFIED*/ avoid duplicate likes
  const likeCount = faker.number.int({ min: 140, max: 200 });
  console.log(`Seeding ${likeCount} likes`);
  for (let i = 0; i < likeCount; i++) {
    const randomUserId = faker.helpers.arrayElement(users).userId;
    const randomRecipeId = faker.helpers.arrayElement(recipes).recipeId;
    const existingBookmark = await prisma.like.findFirst({
      where: {
        userId: randomUserId,
        recipeId: randomRecipeId,
      },
    });
    if (!existingBookmark) {
      await prisma.like.create({
        data: {
          userId: randomUserId,
          recipeId: randomRecipeId,
        },
      });
    } else {
      console.log(
        `Duplicate like skipped for user${randomUserId} and recipe ${randomRecipeId}`
      );
    }
  }

  // Seed User Followers /*MODIFIED*/ avoid duplicate follow relationships
  const followCount = faker.number.int({ min: 25, max: 50 });
  console.log(`Seeding ${followCount} followers`);
  for (let i = 0; i < followCount; i++) {
    const followFromUser = faker.helpers.arrayElement(users);
    const followToUser = faker.helpers.arrayElement(
      users.filter((user) => user.userId !== followFromUser.userId)
    );
    const existingFollow = await prisma.userFollower.findFirst({
      where: {
        followFromUserId: followFromUser.userId,
        followToUserId: followToUser.userId,
      },
    });

    if (!existingFollow) {
      await prisma.userFollower.create({
        data: {
          followFromUserId: followFromUser.userId,
          followToUserId: followToUser.userId,
        },
      });
    } else {
      console.log(
        `Follow relationship already exists between User ${followFromUser.userId} and User ${followToUser.userId}`
      );
    }
  }
  console.log("Seeding completed with random quantities!");
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
