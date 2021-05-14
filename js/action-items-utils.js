class ActionItems {
    addQuickActionItem = (id, text, tab, callback) => {
        let website = null;
        if (id == "quick-action-2") {
            website = {
                url: tab.url,
                fav_icon: tab.favIconUrl,
                title: tab.title
            }
        }
        this.add(text, website, callback)
    }
    add = (text, website = null, callback) => {
        let actionItems = {
            id: uuidv4(),
            added: new Date().toString(),
            text: text,
            completed: null,
            website: website,
        }
        chrome.storage.sync.get(['actionItems'], (data) => {
            let items = data.actionItems;
            if (!items) {
                items = [actionItems]
            } else {
                items.push(actionItems);
            }
            chrome.storage.sync.set({
                actionItems: items
            }, () => {
                callback(actionItems)
            })
        })
    }
    markUnmarkCompleted = (id, completestatus) => {
        chrome.storage.sync.get(['actionItems'], (data) => {
            let items = data.actionItems;
            let foundItemIndex = items.findIndex((item) => item.id == id)
            if (foundItemIndex >= 0) {
                items[foundItemIndex].completed = completestatus;
                chrome.storage.sync.set({
                    actionItems: items
                })
            }
        })
    }
    setprogress = () => {
        chrome.storage.sync.get(['actionItems'], (data) => {
            let actionItems = data.actionItems;
            let completedItems = actionItems.filter((items) => items.completed).length;
            let totalItems = actionItems.length;
            let progress = 0;
            if(totalItems > 0){
            progress = completedItems / totalItems;
            }
            if (typeof window.circle !== "undefined") circle.animate(progress);
            this.setbrowserbadge(totalItems - completedItems);
        })
    }
    remove = (id, callback) => {
        chrome.storage.sync.get(['actionItems'], (data) => {
            let Items = data.actionItems;
            let idindex = Items.findIndex((item) => item.id == id);
            if (idindex >= 0) {
                Items.splice(idindex, 1);
            }
            chrome.storage.sync.set({
                actionItems: Items
            }, callback)
        })
    }
    savename = (name, callback) => {
        chrome.storage.sync.set({
            name: name
        }, callback)
    }

    setbrowserbadge = (todos) => {
        let text = `${todos}`;
        if (text > 9) {
            text = "9+"
        }
        chrome.browserAction.setBadgeText({
            text: text
        });
    }
}