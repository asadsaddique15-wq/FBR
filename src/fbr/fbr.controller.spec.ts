import { Test, TestingModule } from '@nestjs/testing';
import { FbrController } from './fbr.controller';

describe('FbrController', () => {
  let controller: FbrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FbrController],
    }).compile();

    controller = module.get<FbrController>(FbrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
