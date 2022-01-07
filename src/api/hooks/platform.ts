import { APIS } from '@/api/client'
import { UserLoginRequest } from '@/api/model'

export async function doUserLogin(payload: UserLoginRequest) {
  return await APIS.Platform.userLoginPost(payload, {
    skipNotifications: true,
  })
}

export async function doUserLogout() {
  return await APIS.Platform.userLogoutPost({
    skipNotifications: true,
  })
}
