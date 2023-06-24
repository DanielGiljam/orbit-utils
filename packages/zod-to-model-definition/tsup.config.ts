import {defineConfig} from "tsup";
import {exec} from "child_process";
import * as devkit from "@nx/devkit";

const {readJsonFile, writeJsonFile} = (
    devkit as unknown as {default: typeof devkit}
).default;

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

const projectName = "zod-to-model-definition";
const outDir = `../../dist/packages/${projectName}`;

export default defineConfig({
    clean: true,
    dts: true,
    entry: ["src/index.ts"],
    format: "esm",
    onSuccess: async () => {
        console.log("onSuccess:");
        await execAsync(`cp README.md ../../LICENSE ${outDir}`);
        console.log("  - Copied README.md and ../../LICENSE to out directory.");
        const pkg = await readJsonFile("package.json");
        const rootPkg = await readJsonFile("../../package.json");
        pkg.homepage = rootPkg.homepage.replace(
            /#readme$/,
            `/tree/main/packages/${projectName}#readme`,
        );
        pkg.bugs = rootPkg.bugs.concat(`+label%3A${projectName}`);
        pkg.license = rootPkg.license;
        pkg.author = rootPkg.author;
        pkg.repository = {...rootPkg.repository};
        pkg.repository.directory = `packages/${projectName}`;
        await writeJsonFile(`${outDir}/package.json`, pkg);
        console.log(
            "  - Merged package.json and ../../package.json and wrote to out directory.",
        );
        console.log("  - Done.");
    },
    outDir,
    outExtension: () => ({js: ".js"}),
    skipNodeModulesBundle: true,
});
