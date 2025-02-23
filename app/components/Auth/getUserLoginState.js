const getUserLoginState = () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getAuthState" }, (response) => {
      if (response.firebase_user_uid) resolve(response.firebase_user_uid)
      else resolve(null)
    })
  })
}

export default getUserLoginState
