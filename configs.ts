var _INDEX = 1
if (process.env.NEXT_PUBLIC_APP_ENV == 'local') {
  _INDEX = 0
}

export const configs = {
  NEO_HOST: ["http://127.0.0.1:3000", "https://api.neoelect.com"][_INDEX],
  LOGIN_PATH: "/auth/login",
  LOGOUT_PATH: "/auth/logout",
  TELEPHONY_CALLS_PATH: "/sparktg/calls",
  PROFILE : "/profile/me",
  PROFILE_PHOTO : "/profile/photo",
};
