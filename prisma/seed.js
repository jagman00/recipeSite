const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

async function main() {
    //Dropping the tables if exists /*MODIFIED*/
    await prisma.bookmark.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.like.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.category.deleteMany();
    await prisma.userFollower.deleteMany();
    await prisma.user.deleteMany();

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
const userCount = faker.number.int({ min: 10, max: 15 });
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
      },
    })
  );
}

  // Seed Recipes
  const recipes = [];
  const recipeCount = faker.number.int({ min: 20, max: 50 });
  console.log(`Seeding ${recipeCount} recipes...`);
  for (let i = 0; i < recipeCount; i++) {
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
            `https://i.ibb.co/CbvkzRy/images-2.jpg`,]),
          steps: faker.lorem.paragraphs(2),
          userId: faker.helpers.arrayElement(users).userId,
        },
      })
    );
  }

  // Seed Ingredients
  console.log('Seeding ingredients for each recipe...');
  for (const recipe of recipes) {
    const ingredientCount = faker.number.int({ min: 1, max: 6 });
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
  const categories = [];
  const categoryCount = faker.number.int({ min: 24, max: 24 });
  console.log(`Seeding ${categoryCount} categories...`);
  for (let i = 0; i < categoryCount; i++) {
    categories.push(
      await prisma.category.create({
        data: {
          categoryName: faker.helpers.arrayElement([
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
])
       }
    })
  );
}

  // Link Recipes and Categories
  console.log('Linking recipes with categories...');
  for (const recipe of recipes) {
    const selectedCategories = faker.helpers.arrayElements(categories, faker.number.int({ min: 1, max: 3 }));
    await prisma.recipe.update({
      where: { recipeId: recipe.recipeId },
      data: {
        categories: {
          connect: selectedCategories.map((category) => ({ id: category.id })),
        },
      },
    });
  }

  // Seed Bookmarks /*MODIFIED*/ avoid duplicate bookmarks
  const bookmarkCount = faker.number.int({ min: 2, max: 10 });
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

  // Seed Comments
  const commentCount = faker.number.int({ min: 10, max: 20 });
  console.log(`Seeding ${commentCount} comments`);
  for (let i = 0; i < commentCount; i++) {
    await prisma.comment.create({
      data: {
        text: faker.food.adjective(),
        userId: faker.helpers.arrayElement(users).userId,
        recipeId: faker.helpers.arrayElement(recipes).recipeId,
      },
    });
  }

  // Seed Likes /*MODIFIED*/ avoid duplicate likes
  const likeCount = faker.number.int({ min: 20, max: 100 });
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
  const followCount = faker.number.int({ min: 5, max: 19 });
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

