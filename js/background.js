let actionItemsUtils = new ActionItems();

chrome.contextMenus.create({
    "id": "linksitemenu",
    "title": "Link Site For Later",
    "contexts": ["all"]
})
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason == "install") {
        chrome.storage.sync.set({
            actionItems: []
        })
    }
})
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == "linksitemenu") {
        actionItemsUtils.addQuickActionItem('quick-action-2', "Read this Site", tab, () => {
            actionItemsUtils.setprogress();
        })
    }
})