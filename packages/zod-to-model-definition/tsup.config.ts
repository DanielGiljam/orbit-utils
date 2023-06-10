import { defineConfig } from 'tsup';
import { exec } from 'child_process';

const execAsync = async (command: string): Promise<void> =>
  await new Promise((resolve, reject) => {
    const childProcess = exec(command, (error) => {
      if (error == null) {
        resolve();
      } else {
        reject(error);
      }
    });
    childProcess.stdout!.pipe(process.stdout);
    childProcess.stderr!.pipe(process.stderr);
  });

const outDir = '../../dist/packages/zod-to-model-definitions';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  keepNames: false,
  skipNodeModulesBundle: true,
  outExtension: () => ({ js: '.js' }),
  onSuccess: async () => {
    console.log('onSuccess:');
    await execAsync(
      `pnpm tsc --declaration --emitDeclarationOnly --project tsconfig.lib.json --outFile ${outDir}/index.d.ts`
    );
    console.log('  - Emitted TypeScript declaration files.');
    await execAsync(`cp package.json README.md ${outDir}`);
    console.log('  - Copied package.json and README.md.');
  },
  outDir,
});
