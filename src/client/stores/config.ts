import { defineStore } from 'pinia'
import type { IDBConfigStore } from '~~/types'

export const useConfigStore = defineStore('config', () => {
  const config : IDBConfigStore = reactive({
    name: '',
    description: '',
    address: '',
    image: {
      logo: '',
      banner: '',
    },

    contact: {
      owner: '',
      phone: '',
      email: '',
    },

    gate: {
      name: '',
      number: '',
      person: '',
    },

    social: {
      facebook: '',
      messenger: '',
      zalo: '',
      tiktok: ''
    },

    overtime: {
      step: 1,
      price: 0,
    },

    lunch: {
      price: 0
    },

    time: {
      create: null,
      start: null,
      delay: 0,
      pay: 0,
      night: {
        start: '',
        end: ''
      }
    },

    member: {
      week: {
        price: 0,
        discount: 0,
        wheel: 0,
        free: {
          lunch: 0,
          time: 0
        }
      },
      month: {
        price: 0,
        discount: 0,
        wheel: 0,
        free: {
          lunch: 0,
          time: 0
        }
      }
    },

    miss: {
      1: 0,
      2: 0,
      3: 0
    },

    wheel: {
      price: 0,
      start: false
    }
  })

  const installPrompt : Ref<any> = ref()

  const setInstallPrompt = (data : any) => installPrompt.value = data

  const bootConfig = async () => {
    const cfg : IDBConfigStore = await useAPI('config/public/get')
    Object.assign(config, cfg)
  }

  return { 
    config, bootConfig,
    installPrompt, setInstallPrompt
  }
})