"use strict";

(function main() {
  var markdownlint = globalThis.markdownlint;
  if (!markdownlint || typeof markdownlint.lintSync !== "function") {
    return;
  }

  var markdown = document.getElementById("markdown");
  var violations = document.getElementById("violations");
  var versionNode = document.getElementById("version");
  var fixButton = document.getElementById("fix-all-btn");

  if (versionNode && markdownlint.getVersion) {
    versionNode.textContent = "(v" + markdownlint.getVersion() + ")";
  }

  if (!markdown || !violations) {
    return;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderViolation(result) {
    var ruleName = (result.ruleNames || []).slice(0, 2).join(" / ") || "unknown";
    var description = result.ruleDescription || "";
    var detail = result.errorDetail ?
      " [<span class='detail'>" + escapeHtml(result.errorDetail) + "</span>]" :
      "";
    var context = result.errorContext ?
      " [<span class='detail'>Context: \"" + escapeHtml(result.errorContext) + "\"</span>]" :
      "";
    var severity = result.severity || "warning";

    return (
      "<span>第" + (result.lineNumber || 0) + "行</span> - " +
      "<span>" + escapeHtml(ruleName) + "</span> - " +
      escapeHtml(description) +
      detail +
      context +
      " [<span class='detail'>" + escapeHtml(severity) + "</span>]"
    );
  }

  function getLintResults(content) {
    return (markdownlint.lintSync({
      "strings": {
        "content": content
      },
      "config": {
        "MD013": false
      },
      "handleRuleFailures": true
    }).content || []);
  }

  function runLint() {
    var content = markdown.value || "";
    var results = getLintResults(content);

    if (!results.length) {
      violations.innerHTML = "<em>未发现违规.</em>";
      return;
    }

    violations.innerHTML = results.map(renderViolation).join("<br/>");
  }

  function runFixAll() {
    var content = markdown.value || "";
    var results = getLintResults(content);

    if (!results.length) {
      violations.innerHTML = "<em>未发现需要修复的违规.</em>";
      return;
    }

    if (typeof markdownlint.applyFixes !== "function") {
      violations.innerHTML = "<em>当前 markdownlint 版本不支持自动修复。</em>";
      return;
    }

    var fixed = markdownlint.applyFixes(content, results);
    if (fixed === content) {
      violations.innerHTML = "<em>本次检查中没有可修复的规则项。</em>";
      return;
    }

    markdown.value = fixed;
    violations.innerHTML = "<em>已自动修复，建议再次检查确认。</em>";
    runLint();
  }

  function onFixShortcut(event) {
    var key = event.key ? String(event.key).toLowerCase() : "";
    var isFixShortcut = (event.ctrlKey || event.metaKey) && (event.altKey || event.shiftKey) && key === "f";

    if (!isFixShortcut) {
      return;
    }

    event.preventDefault();
    runFixAll();
  }

  markdown.addEventListener("input", runLint);
  if (fixButton) {
    fixButton.addEventListener("click", runFixAll);
  }
  document.addEventListener("keydown", onFixShortcut);
  runLint();
}());