import type { Request, Response } from "express";
import { addressService } from "./address.service";
import type { CreateAddressInput, UpdateAddressInput } from "./address.schema";

export const addressController = {
  async list(req: Request, res: Response) {
    const addresses = await addressService.list(req.user!.id);
    res.json({ success: true, addresses });
  },
  async create(req: Request, res: Response) {
    const address = await addressService.create(req.user!.id, req.body as CreateAddressInput);
    res.status(201).json({ success: true, address });
  },
  async update(req: Request, res: Response) {
    const address = await addressService.update(req.user!.id, req.params.id!, req.body as UpdateAddressInput);
    res.json({ success: true, address });
  },
  async remove(req: Request, res: Response) {
    await addressService.delete(req.user!.id, req.params.id!);
    res.status(204).send();
  },
};
