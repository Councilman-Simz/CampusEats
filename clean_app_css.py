from pathlib import Path
import shutil
import sys

css_path = Path("frontend/src/App.css")
backup_path = Path("frontend/src/App.css.backup")

if not css_path.exists():
    print(f"ERROR: Could not find {css_path}")
    sys.exit(1)

original = css_path.read_text(encoding="utf-8")

# Create a backup before modifying anything.
shutil.copy2(css_path, backup_path)

marker = "* {\n  box-sizing: border-box;\n}"

first_marker = original.find(marker)
second_marker = original.find(marker, first_marker + len(marker))

if first_marker == -1:
    print("ERROR: Could not recognize the beginning of App.css")
    sys.exit(1)

# Keep only the first complete stylesheet copy.
if second_marker != -1:
    cleaned = original[:second_marker].rstrip()
else:
    cleaned = original.rstrip()

# Remove any broken AI Search section from the first copy.
ai_position = cleaned.find(".ai-search-page")

if ai_position != -1:
    cleaned = cleaned[:ai_position].rstrip()

ai_css = r'''

/* AI Search page */

.ai-search-page {
  max-width: 1450px;
  margin: 0 auto;
}

.ai-search-hero {
  margin-bottom: 34px;
  padding: 32px;
  border-radius: 24px;
  background:
    radial-gradient(
      circle at top right,
      rgba(216, 243, 220, 0.24),
      transparent 35%
    ),
    linear-gradient(135deg, #123c2b, #1b5a40);
  color: white;
  box-shadow: 0 20px 48px rgba(16, 39, 28, 0.18);
}

.ai-search-copy {
  max-width: 760px;
}

.ai-search-copy h2 {
  margin: 16px 0 10px;
  font-size: clamp(32px, 5vw, 52px);
}

.ai-search-copy p {
  margin: 0;
  max-width: 720px;
  color: #d7e9df;
  line-height: 1.65;
}

.ai-search-form {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.ai-search-form input {
  flex: 1;
  min-width: 0;
  padding: 15px 17px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.95);
  color: #17211b;
  outline: none;
}

.ai-search-form input:focus {
  border-color: #65c79b;
  box-shadow: 0 0 0 4px rgba(101, 199, 155, 0.2);
}

.ai-search-form button {
  padding: 15px 24px;
  border: 0;
  border-radius: 13px;
  background: #65c79b;
  color: #10271c;
  font-weight: 800;
  cursor: pointer;
}

.ai-search-form button:hover {
  background: #7bd6ad;
}

.ai-search-form button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.ai-search-hero .suggestion-row {
  margin-top: 18px;
}

.ai-search-hero .suggestion-row span {
  color: #c7ddd1;
}

.ai-search-hero .suggestion-row button {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.ai-search-hero .suggestion-row button:hover {
  background: rgba(255, 255, 255, 0.18);
}

.search-results-heading {
  margin: 0 0 20px;
}

.search-results-heading h2 {
  margin: 6px 0 0;
  font-size: 30px;
}

.ai-search-page .card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.search-result-card {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.search-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.search-image-wrapper .food-photo {
  display: block;
  width: 100%;
  height: 100%;
  max-height: none;
  object-fit: cover;
}

.match-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  color: #1b4332;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.13);
}

.search-result-body {
  padding: 20px;
}

.ai-empty-state {
  margin-top: 26px;
}

.empty-state-icon {
  margin-bottom: 10px;
  font-size: 42px;
}

@media (max-width: 700px) {
  .ai-search-hero {
    padding: 24px 20px;
  }

  .ai-search-form {
    flex-direction: column;
  }

  .ai-search-form button {
    width: 100%;
  }

  .ai-search-page .card-grid {
    grid-template-columns: 1fr;
  }
}
'''

final_css = cleaned + ai_css

# Basic brace check.
open_braces = final_css.count("{")
close_braces = final_css.count("}")

if open_braces != close_braces:
    print(
        f"ERROR: CSS braces are unbalanced: "
        f"{open_braces} opening and {close_braces} closing."
    )
    print(f"Your original file is safe at {backup_path}")
    sys.exit(1)

css_path.write_text(final_css, encoding="utf-8")

print("SUCCESS: App.css has been cleaned.")
print(f"Backup created: {backup_path}")
print(f"Updated file:   {css_path}")
print(f"Opening braces: {open_braces}")
print(f"Closing braces: {close_braces}")
