import { zodToModelDefinitions } from './ZodToModelDefinitions';

describe('zodToModelDefinitions', () => {
  it('should work', () => {
    expect(zodToModelDefinitions()).toEqual('zod-to-model-definitions');
  });
});
