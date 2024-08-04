chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "isActiveTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      sendResponse({ isActive: tabs[0].id === sender.tab.id })
    })
    return true // Will respond asynchronously.
  }
})
