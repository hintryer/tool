"use strict";

(function main() {
  var markdownlint = globalThis.markdownlint;
  if (!markdownlint || typeof markdownlint.lintSync !== "function") {
    return;
  }

  var markdown = document.getElementById("markdown");
  var violations = document.getElementById("violations");
  var versionNode = document.getElementById("version");

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
    var ruleLink = result.ruleInformation || "#";
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

  function runLint() {
    var content = markdown.value || "";
    var results = markdownlint.lintSync({
      "strings": {
        "content": content
      },
      "config": {
        "MD013": false
      },
      "handleRuleFailures": true
    }).content || [];

    if (!results.length) {
      violations.innerHTML = "<em>No markdownlint violations found.</em>";
      return;
    }

    violations.innerHTML = results.map(renderViolation).join("<br/>");
  }

  markdown.addEventListener("input", runLint);
  runLint();
}());