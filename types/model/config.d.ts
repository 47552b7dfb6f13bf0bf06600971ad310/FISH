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
    delay: number
    pay: number
    night: {
      start: string
      end: string
    }
    ticket: {
      start: string
      end: string
    }
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
  miss: {
    1: number
    2: number
    3: number
  },
  wheel: {
    price: number
    start: boolean
  }
  telegram: {
    ticket: string
    order: string
    payment: string
    member: string
  }
  charity: {
    start: date
    end: date
    money: number
    ticket: number
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
    create: date | null
    delay: number
    pay: number
    night: {
      start: string
      end: string
    }
    ticket: {
      start: string
      end: string
    }
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
  miss: {
    1: number
    2: number
    3: number
  }
  wheel: {
    price: number
    start: boolean
  }
  charity: {
    start: date
    end: date
    money: number
    ticket: number
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
  isNight: boolean
}