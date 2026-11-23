import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: Record<string, jest.Mock>;
  let aiService: Record<string, jest.Mock>;

  beforeEach(async () => {
    applicationService = {
      create: jest.fn(),
      createFromText: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    aiService = { parseJobPostingPage: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        { provide: ApplicationService, useValue: applicationService },
        { provide: AiService, useValue: aiService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);
  });

  it('is protected by JwtAuthGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ApplicationController,
    ) as unknown[];
    expect(guards).toContain(JwtAuthGuard);
  });

  it('passes the authenticated user id to createFromText', async () => {
    const body = { text: 'job description', url: 'https://example.com' };
    const created = { id: 'application-id' };
    applicationService.createFromText.mockResolvedValue(created);

    await expect(controller.createFromText('user-123', body)).resolves.toBe(
      created,
    );
    expect(applicationService.createFromText).toHaveBeenCalledWith(
      'user-123',
      body,
    );
  });

  it('passes the authenticated user id to create/update/remove', async () => {
    const id = '0b3c1f9e-5c1a-4f5e-9d6a-2a7f3e1b8c90';
    await controller.create('user-1', { name: 'IKEA' });
    await controller.update('user-1', id, { favorite: true });
    await controller.remove('user-1', id);

    expect(applicationService.create).toHaveBeenCalledWith('user-1', {
      name: 'IKEA',
    });
    expect(applicationService.update).toHaveBeenCalledWith(id, 'user-1', {
      favorite: true,
    });
    expect(applicationService.remove).toHaveBeenCalledWith(id, 'user-1');
  });

  it('parse-page returns the AI result without saving', async () => {
    const fields = { company: 'Picnic', position: 'Engineer' };
    aiService.parseJobPostingPage.mockResolvedValue(fields);
    const body = { url: 'https://x.example/job', text: 'Job text' };

    await expect(controller.parsePage(body)).resolves.toEqual({
      result: fields,
    });
    expect(aiService.parseJobPostingPage).toHaveBeenCalledWith(body);
    expect(applicationService.create).not.toHaveBeenCalled();
  });

  it('maps list query flags', async () => {
    await controller.findAll(
      'user-1',
      { page: 1, limit: 100 },
      'interviews',
      'true',
    );
    expect(applicationService.findAll).toHaveBeenCalledWith(
      'user-1',
      { page: 1, limit: 100 },
      true,
      true,
    );
  });
});
