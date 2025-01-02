const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database with random quantities');

      //Hardcoded Admin User
  console.log('Seeding Admin user...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'securepassword123!', 
      profileUrl: faker.image.avatar(),
      isAdmin: true,
    },
  });


  // Seed Users
  const users = [];
  const userCount = faker.number.int({ min: 10, max: 15
   });
  console.log(`Seeding ${userCount} users...`);
  for (let i = 0; i < userCount; i++) {
    users.push(
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          profileUrl: faker.image.avatar(),
          isAdmin: faker.datatype.boolean(),
        },
      })
    );
  }

  // Seed Recipes
  const recipes = [];
  const recipeCount = faker.number.int({ min: 10, max: 30 });
  console.log(`Seeding ${recipeCount} recipes...`);
  for (let i = 0; i < recipeCount; i++) {
    recipes.push(
      await prisma.recipe.create({
        data: {
          title: faker.food.dish(3),
          description: faker.food.description(2),
          servingSize: faker.number.int({ min: 1, max: 10 }),
          recipeUrl: faker.internet.url(),
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
  const categoryCount = faker.number.int({ min: 3, max: 15 });
  console.log(`Seeding ${categoryCount} categories...`);
  for (let i = 0; i < categoryCount; i++) {
    categories.push(
      await prisma.category.create({
        data: {
          categoryName: faker.food.ethnicCategory(),
        },
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

  // Seed Bookmarks
  const bookmarkCount = faker.number.int({ min: 2, max: 7});
  console.log(`Seeding ${bookmarkCount} bookmarks...`);
  for (let i = 0; i < bookmarkCount; i++) {
    await prisma.bookmark.create({
      data: {
        userId: faker.helpers.arrayElement(users).userId,
        recipeId: faker.helpers.arrayElement(recipes).recipeId,
      },
    });
  }

  // Seed Comments
  const commentCount = faker.number.int({ min: 10, max: 20 });
  console.log(`Seeding ${commentCount} comments`);
  for (let i = 0; i < commentCount; i++) {
    await prisma.comment.create({
      data: {
        text: faker.lorem.sentence(),
        userId: faker.helpers.arrayElement(users).userId,
        recipeId: faker.helpers.arrayElement(recipes).recipeId,
      },
    });
  }

  // Seed Likes
  const likeCount = faker.number.int({ min: 20, max: 100 });
  console.log(`Seeding ${likeCount} likes`);
  for (let i = 0; i < likeCount; i++) {
    await prisma.like.create({
      data: {
        userId: faker.helpers.arrayElement(users).userId,
        recipeId: faker.helpers.arrayElement(recipes).recipeId,
      },
    });
  }

  // Seed User Followers
  const followCount = faker.number.int({ min: 5, max: 19 });
  console.log(`Seeding ${followCount} followers`);
  for (let i = 0; i < followCount; i++) {
    const followFromUser = faker.helpers.arrayElement(users);
    const followToUser = faker.helpers.arrayElement(users.filter(user => user.userId !== followFromUser.userId));

    await prisma.userFollower.create({
      data: {
        followFromUserId: followFromUser.userId,
        followToUserId: followToUser.userId,
      },
    });
  }

  console.log('Seeding completed with random quantities!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
