import { Request, Response } from 'express';
import { loginSchema, refreshSchema } from './auth.schemas';
import { AuthService } from './auth.service';

const service = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.login(parsed.data);
    return res.status(200).json(result);
  }

  async refresh(req: Request, res: Response) {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.refresh(parsed.data.refreshToken);
    return res.status(200).json(result);
  }

  async profile(_req: Request, res: Response) {
    const payload = res.locals.user;
    return res.status(200).json(payload);
  }
}
