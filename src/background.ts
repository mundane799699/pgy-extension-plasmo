chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const baseUrl = "https://mundane.ink"
    // const baseUrl = "http://localhost:8088"
    fetch(`${baseUrl}/mail/sendMail/send`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.text()
      })
      .then((data) => {
        console.log("安装通知已发送，服务器返回：", data)
      })
      .catch((err) => {
        console.log("安装通知发送失败", err)
      })
  }
})
