import { JwtService } from '@nestjs/jwt';
import { EmployeeRole } from '../../../modules/employee/domain/enums/employee-role.enum.js';
import { UserType } from '../../../modules/user/domain/enums/user-type.enum.js';
import { JwtTokenService } from './jwt-token.service.js';
import type { AuthTokenPayload } from './token-service.port.js';

// Usa o jsonwebtoken real (sem subir o Nest) pra validar o que de fato vai no token.
describe('JwtTokenService', () => {
  const service = new JwtTokenService(
    new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '1h' } }),
  );

  const employee: AuthTokenPayload = {
    sub: 'user-2',
    email: 'maria@oficina.com',
    type: UserType.EMPLOYEE,
    employeeId: 'employee-1',
    role: EmployeeRole.ADMIN,
  };

  it('o payload cru do JWT (o que qualquer um lê no jwt.io) só tem os claims + iat/exp', async () => {
    const token = await service.sign(employee);
    const rawPayload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    );

    expect(Object.keys(rawPayload).sort()).toStrictEqual(
      ['email', 'employeeId', 'exp', 'iat', 'role', 'sub', 'type'].sort(),
    );
  });

  it('verify devolve os claims sem iat/exp', async () => {
    const token = await service.sign(employee);
    await expect(service.verify(token)).resolves.toStrictEqual(employee);
  });

  it('verify rejeita token assinado com outro segredo', async () => {
    const forged = await new JwtService({ secret: 'outro' }).signAsync({
      ...employee,
    });
    await expect(service.verify(forged)).rejects.toThrow();
  });
});
