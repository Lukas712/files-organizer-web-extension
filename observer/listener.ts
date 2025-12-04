
export interface Listener{
    onNotify(file: chrome.downloads.DownloadItem): chrome.downloads.FilenameSuggestion | void;
}