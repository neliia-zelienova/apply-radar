import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: { createFromText: jest.Mock };
  let jwtService: { verifyAsync: jest.Mock };

  beforeEach(async () => {
    applicationService = {
      createFromText: jest.fn(),
    };
    jwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uses the authenticated user id for createFromText', async () => {
    const body = { text: 'job description', url: 'https://example.com' };
    const request = {
      headers: {
        authorization: ['Bearer', 'token-value'].join(' '),
      },
    } as any;
    const created = { id: 'application-id' };

    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-123' });
    applicationService.createFromText.mockResolvedValue(created);

    await expect(controller.createFromText(request, body)).resolves.toBe(created);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token-value');
    expect(applicationService.createFromText).toHaveBeenCalledWith(
      'user-123',
      body,
    );
  });

  it('rejects createFromText when the access token is missing', async () => {
    await expect(
      controller.createFromText(
        { headers: {} } as any,
        { text: 'job description' },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
