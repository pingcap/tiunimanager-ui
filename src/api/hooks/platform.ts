import { APIS } from '@/api/client'
import { UserLoginRequest } from '@/api/model'

export function doUserLogin(payload: UserLoginRequest) {
  return APIS.Platform.userLoginPost(payload, {
    skipNotifications: true,
  })
}

export function doUserLogout() {
  return APIS.Platform.userLogoutPost({
    skipNotifications: true,
  })
}
