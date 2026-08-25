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

  return {
    models: {
      User,
    },
  };
});
