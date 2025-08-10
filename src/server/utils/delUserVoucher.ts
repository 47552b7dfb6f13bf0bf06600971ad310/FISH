import { Types } from "mongoose"
import type { IDBUser } from "~~/types"

export default async (user : IDBUser, voucher: Types.ObjectId) => {
  try {
    const voucherId = new Types.ObjectId(voucher)

    const index = user.vouchers.findIndex(v =>
      v instanceof Types.ObjectId ? v.equals(voucherId) : v._id.equals(voucherId)
    )

    if (index !== -1) {
      user.vouchers.splice(index, 1)
      await user.save()
    }
  }
  catch (e:any) {
  }
}