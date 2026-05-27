# Claude – Mythos Selector

A Tampermonkey userscript that injects a **Mythos (preview)** entry into Claude's model selector. Selecting it activates Opus 4.7 under the hood — so a Claude subscription that includes Opus is required.

## Features

- Injects a styled "Mythos (preview)" option into the model dropdown
- Shows a tooltip on hover
- Displays a checkmark when selected and updates the selector button label
- Resets correctly when switching back to any native model
- Uses a MutationObserver to survive Claude's dynamic re-renders

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Open Tampermonkey → **Create a new script**
3. Paste the contents of `claude-mythos-selector.user.js`
4. Save and reload `claude.ai`

## Requirements

- A Claude subscription that includes Opus 4.7 (Pro / Max)
- Tampermonkey (Chrome, Firefox, Edge, or Safari)
