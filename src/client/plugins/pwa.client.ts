export default defineNuxtPlugin(async (nuxtApp) => {
  const configStore = useConfigStore()

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    configStore.setInstallPrompt(e)
    window.dispatchEvent(new Event('pwa:install-available'))
  })

  window.addEventListener("appinstalled", () => {
    configStore.setInstallPrompt(null)
  })
})