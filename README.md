# SyncSavedWindows

Sync saved windows.

Available for Firefox here: https://addons.mozilla.org/firefox/addon/sync-saved-windows/

This extension provides a toolbar button with a popup of a list of saved and opened windows. List can be synchronised through Firefox/Google account.

Inspired by [TabCloud](https://web.archive.org/web/20181102003417/https://addons.mozilla.org/en-US/firefox/addon/tabcloud/).

The reason for this extension is because TabCloud does not support Firefox Quantum (Firefox 57+).

## Changelog

### 2018 - 04 - 10

Firefox and Chrome extension (v.2.7)

- Use vue.runtime.js to remove `unsafe-eval` from content security policy while retain reactivity of UI

### 2018 - 02 - 02

Fix bug in Firefox extension which prevented logging in to Google account

### 2017 - 12 - 16

Using background.js to sustain the log in session to reduce the loading time when the popup is displayed.
