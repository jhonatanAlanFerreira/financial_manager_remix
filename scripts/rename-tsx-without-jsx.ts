import { Project, SyntaxKind } from "ts-morph";
import fs from "fs";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("app/**/*.tsx");

sourceFiles.forEach((file) => {
  const jsxElements = file.getDescendantsOfKind(SyntaxKind.JsxElement);
  const jsxSelfClosing = file.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement
  );

  if (jsxElements.length === 0 && jsxSelfClosing.length === 0) {
    const oldPath = file.getFilePath();
    const newPath = oldPath.replace(/\.tsx$/, ".ts");

    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldPath}`);
  }
});
