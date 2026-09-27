import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Marca a rota como aberta. Todo o resto exige JWT (JwtAuthGuard global).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
