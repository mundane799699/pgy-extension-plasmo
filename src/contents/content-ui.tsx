import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

import { Table } from "~features/table"

export const config: PlasmoCSConfig = {
  matches: ["*://pgy.xiaohongshu.com/solar/pre-trade/blogger-detail/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  return (
    <div className="z-50 flex fixed top-1/2 right-8">
      <Table />
    </div>
  )
}

export default PlasmoOverlay
