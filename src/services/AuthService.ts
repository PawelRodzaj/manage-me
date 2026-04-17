declare global {
  interface Window {
    google?: any
  }
}

export type GoogleProfile = {
  sub: string
  email: string
  given_name?: string
  family_name?: string
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""

export class AuthService {
  static getClientId(): string {
    return GOOGLE_CLIENT_ID
  }

  static initGoogleSignIn(onSuccess: (profile: GoogleProfile) => void): void {
    if (!GOOGLE_CLIENT_ID) {
      return
    }

    const initialize = () => {
      if (!window.google?.accounts?.id) {
        window.setTimeout(initialize, 150)
        return
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          const profile = AuthService.decodeJwtResponse(response.credential)
          onSuccess(profile)
        },
        ux_mode: "popup",
      })

      const buttonContainer = document.querySelector("#google-signin-button")
      if (buttonContainer) {
        buttonContainer.innerHTML = ""
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
        })
      }
    }

    initialize()
  }

  static decodeJwtResponse(token: string): GoogleProfile {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    )
    return JSON.parse(jsonPayload)
  }

  static signOut(): void {
    if (window.google?.accounts?.id?.disableAutoSelect) {
      window.google.accounts.id.disableAutoSelect()
    }
  }
}
