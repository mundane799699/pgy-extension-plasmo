import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://pgy.xiaohongshu.com/solar/pre-trade/blogger-detail/*"],
  run_at: "document_start",
  world: "MAIN"
}

const originOpen = XMLHttpRequest.prototype.open
function interceptAjax() {
  console.log("interceptAjax")
  XMLHttpRequest.prototype.open = function (_, url) {
    const xhr = this
    this.addEventListener("readystatechange", function (event) {
      if (xhr.readyState === 4) {
        if (isNotesDetailUrl(url)) {
          sendResponseBack("NOTES_DETAIL", event)
        } else if (isBloggerInfoUrl(url)) {
          sendResponseBack("BLOGGER_INFO", event)
        }
      }
    })
    return originOpen.apply(this, arguments)
  }
}

function isBloggerInfoUrl(url: string) {
  return url.startsWith("/api/solar/cooperator/user/blogger")
}

function isNotesDetailUrl(url: string) {
  return url.includes("/api/solar/kol/dataV2/notesDetail")
}

function sendResponseBack(type, event) {
  window.dispatchEvent(
    new CustomEvent("FROM_INJECTED", {
      detail: { type, responseText: event.target.responseText }
    })
  )
}

interceptAjax()
