import type { Types } from 'mongoose'

export interface IDBConfig {
  _id: Types.ObjectId

  name: string
  description: string
  address: string
  image: {
    logo: string
    banner: string
  }
  contact: {
    owner: string
    phone: string
    email: string
  }
  gate: {
    prefix: string
    name: string
    number: string
    person: string
    secret: string
    qr: string
  }
  social: {
    facebook: string
    messenger: string
    zalo: string
    tiktok: string
  }
  overtime: {
    step: number
    price: number
  }
  lunch: {
    price: number
  }
  time: {
    create: Date
    start: Date
    delay: number
    pay: number
  }
  member: {
    week: {
      price: number
      discount: number
      wheel: number
      free: {
        lunch: number
        time: number
      }
    },
    month: {
      price: number
      discount: number
      wheel: number
      free: {
        lunch: number
        time: number
      }
    }
  }
  reg: {
    voucher: {
      source: Types.ObjectId
      amount: number
    }
  }
}

export interface IDBConfigStore {
  name: string
  description: string
  address: string
  image: {
    logo: string
    banner: string
  }
  contact: {
    owner: string
    phone: string
    email: string
  }
  gate: {
    name: string
    number: string
    person: string
  }
  social: {
    facebook: string
    messenger: string
    zalo: string
    tiktok: string
  }
  overtime: {
    step: number
    price: number
  }
  lunch: {
    price: number
  }
  time: {
    create: Date | null
    start: Date | null
    delay: number
    pay: number
  }
  member: {
    week: {
      price: number
      discount: number
      wheel: number
      free: {
        lunch: number
        time: number
      }
    },
    month: {
      price: number
      discount: number
      wheel: number
      free: {
        lunch: number
        time: number
      }
    }
  }
}

export interface IDBConfigShift {
  _id: Types.ObjectId

  area: Types.ObjectId
  name: string
  key: string
  duration: number
  price: number
  display: boolean
}