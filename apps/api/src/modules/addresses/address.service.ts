import { addressRepository } from "./address.repository";
import { AppError } from "../../utils/AppError";
import type { CreateAddressInput, UpdateAddressInput } from "./address.schema";

export const addressService = {
  list(userId: string) {
    return addressRepository.findByUser(userId);
  },

  async create(userId: string, input: CreateAddressInput) {
    if (input.isDefault) await addressRepository.clearDefault(userId);
    return addressRepository.create(userId, input);
  },

  async update(userId: string, id: string, input: UpdateAddressInput) {
    const existing = await addressRepository.findById(id);
    if (!existing || existing.userId !== userId) throw new AppError("Address not found", 404);
    if (input.isDefault) await addressRepository.clearDefault(userId);
    return addressRepository.update(id, input);
  },

  async delete(userId: string, id: string) {
    const existing = await addressRepository.findById(id);
    if (!existing || existing.userId !== userId) throw new AppError("Address not found", 404);
    return addressRepository.delete(id);
  },
};
