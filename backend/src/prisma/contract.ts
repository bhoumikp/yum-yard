import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.uuidv7String(),
      email: field.text().unique(),
      username: field.text().optional(),
      name: field.text().optional(),
      createdAt: field.temporal.createdAt(),
      updatedAt: field.temporal.updatedAt(),
    },
  });

  const Recipe = model('Recipe', {
    fields: {
      id: field.id.uuidv7String(),
      title: field.text(),
      description: field.text().optional(),
      imageUrl: field.text().optional(),
      category: field.text(),
      type: field.text(),
      cuisine: field.text().optional(),
      difficulty: field.text(),
      cookingTimeMinutes: field.int(),
      authorId: field.uuidString(),
      status: field.text(),
      createdAt: field.temporal.createdAt(),
      updatedAt: field.temporal.updatedAt()
    }
  })

  return {
    models: {
      User: User.relations({
        recipes: rel.hasMany(Recipe, { by: "authorId"}),
      }),

      Recipe: Recipe.relations({
        author: rel.belongsTo(User, {from: "authorId", to: "id"}),
      })
    },
  };
});
