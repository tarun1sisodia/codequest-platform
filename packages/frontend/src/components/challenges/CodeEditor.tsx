import React from "react";
import { javascript } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import AIAssistant from "../ai/AIAssistant";
import { Challenge } from "../../types";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: "javascript" | "typescript" | "php" | "go";
  challenge?: Challenge;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language = "typescript",
  challenge,
}) => {
  // Handler for applying AI suggestions directly to editor
  const handleApplySuggestion = (newCode: string) => {
    onChange(newCode);
  };

  // Determine the correct language extension to use
  const getLanguageExtension = () => {
    switch (language) {
      case "php":
        return php();
      case "go":
        // Use JavaScript syntax highlighting for Go (closest match available)
        return javascript();
      case "javascript":
      case "typescript":
      default:
        return javascript({ typescript: language === "typescript" });
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
      <CodeMirror
        value={code}
        height="100vh"
        theme={vscodeDark}
        extensions={[getLanguageExtension()]}
        onChange={onChange}
        className="overflow-hidden"
      />

      {/* Add AI Assistant if challenge is provided */}
      {challenge && (
        <AIAssistant
          code={code}
          challenge={challenge}
          onSuggestionApply={handleApplySuggestion}
        />
      )}
    </div>
  );
};

export default CodeEditor;
