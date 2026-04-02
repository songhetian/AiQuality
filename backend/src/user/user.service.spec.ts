import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

const prismaMock = {
  user: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns paged user list with total count', async () => {
    const list = [{ id: 'u1', username: 'alice' }];
    prisma.$transaction.mockResolvedValue([list, 18]);

    const result = await service.findAll({
      page: 2,
      pageSize: 10,
      username: 'ali',
      status: 1,
      platformId: undefined,
      deptId: undefined,
      shopId: undefined,
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      list,
      total: 18,
      page: 2,
      pageSize: 10,
    });
  });

  it('hashes password before persisting user', async () => {
    prisma.user.create.mockResolvedValue({ id: 'u1' });

    await service.create({
      username: 'alice',
      password: 'secret123',
      phone: undefined,
      email: undefined,
      status: 1,
      platformId: null,
      deptId: null,
      shopId: null,
      roleIds: [],
    });

    const payload = prisma.user.create.mock.calls[0][0];
    expect(payload.data.username).toBe('alice');
    expect(payload.data.password).not.toBe('secret123');
  });
});
