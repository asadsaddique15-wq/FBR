import { Test, TestingModule } from '@nestjs/testing';
import { FbrService } from './fbr.service';

describe('FbrService', () => {
  let service: FbrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FbrService],
    }).compile();

    service = module.get<FbrService>(FbrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
