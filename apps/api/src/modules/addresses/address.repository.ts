import { prisma } from "../../config/prisma";
import type { CreateAddressInput, UpdateAddressInput } from "./address.schema";

export const addressRepository = {
  findByUser(userId: string) {
    return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },
  findById(id: string) {
    return prisma.address.findUnique({ where: { id } });
  },
  create(userId: string, data: CreateAddressInput) {
    return prisma.address.create({ data: { ...data, userId } });
  },
  update(id: string, data: UpdateAddressInput) {
    return prisma.address.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.address.delete({ where: { id } });
  },
  clearDefault(userId: string) {
    return prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  },
};
