
class SessionHelper {
  setToken(token: string) {
    if (!token || token.split(".").length !== 3) {
      return;
    }

    localStorage.setItem("token", token);
  }

  getToken() {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("token");
    }
    return "";
  }

  removeToken() {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("token");
    }
  }

  isLoggedIn() {
    const token = getToken();
    if (token) {
      return true;
    } else {
      return false;
    }
  }

  setUserInfo(userInfo: { fullName: string; email: string; profileImg: string; role: string }) {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("fullName", userInfo.fullName || "");
      localStorage.setItem("email", userInfo.email || "");
      localStorage.setItem("profileImg", userInfo.profileImg || "");
      localStorage.setItem("role", userInfo.role || "");
    }
  }

  getUserInfo() {
    if (typeof window !== "undefined" && window.localStorage) {
      return {
        fullName: localStorage.getItem("fullName") || "",
        email: localStorage.getItem("email") || "",
        profileImg: localStorage.getItem("profileImg") || "",
        role: localStorage.getItem("role") || "",
      };
    }
    return { fullName: "", email: "", profileImg: "", role: "" };
  }

  removeUserInfo() {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("profileImg");
      localStorage.removeItem("role");
    }
  }
}

export const {
  setToken,
  getToken,
  removeToken,
  isLoggedIn,
  setUserInfo,
  getUserInfo,
  removeUserInfo,
} = new SessionHelper();
