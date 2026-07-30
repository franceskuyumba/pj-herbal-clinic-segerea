import { prisma } from "../../config/prisma";
import type { UpdateMeInput, ListUsersQuery } from "./auth.schema";

export const authRepository = {
  findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({ where: { firebaseUid } });
  },

  createFromFirebase(firebaseUid: string, email: string, name?: string) {
    return prisma.user.create({ data: { firebaseUid, email, name } });
  },

  updateProfile(userId: string, data: UpdateMeInput) {
    return prisma.user.update({ where: { id: userId }, data });
  },

  updateRole(userId: string, role: string, permissions?: string[]) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: role as never, ...(permissions ? { permissions } : {}) },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  list(query: ListUsersQuery) {
    const where = query.role ? { role: query.role } : {};
    return Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.user.count({ where }),
    ]);
  },
};
