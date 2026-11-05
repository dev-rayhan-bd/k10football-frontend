/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ChevronDown, Globe, Menu, User, LogOut } from 'lucide-react'
import Image from 'next/image'
import ButtonPrimary from './ButtonPrimary'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks'
import { AuthState, logout } from '@/redux/features/auth'
import {
  getToken,
  getUserInfo,
  getUserRoleFromToken,
  isLoggedIn,
  isTokenExpired,
  getDashboardPathForRole,
  normalizeRole,
  removeToken,
  removeUserInfo,
} from '@/helpers/SessionHelper'
import { useGetMyProfileQuery } from '@/redux/features/user/userApi'
import { SuccessToast } from '@/helpers/ValidationHelper'

export const Navbar = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [userName, setUserName] = useState("")
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard")
  const pathName = usePathname()

  const { user, accessToken } = useAppSelector((state) => state.auth as AuthState)

  // Optionally fetch profile if token is present
  const hasToken = typeof window !== "undefined" && Boolean(getToken())
  const { data: myProfileRes } = useGetMyProfileQuery(undefined, {
    skip: !hasToken,
  })

  useEffect(() => {
    setIsMounted(true)
    const token = getToken()
    const hasValidToken = Boolean(token) && !isTokenExpired(token)
    const loggedIn = Boolean(isLoggedIn() && hasValidToken)

    if (loggedIn) {
      setIsAuth(true)
      const info = getUserInfo()
      const role = normalizeRole(
        info.role ||
        user?.role ||
        getUserRoleFromToken(token) ||
        (typeof window !== "undefined"
          ? localStorage.getItem("role") || localStorage.getItem("userRole")
          : "") ||
        ""
      )

      const name =
        myProfileRes?.data?.fullName ||
        myProfileRes?.data?.name ||
        user?.fullName ||
        user?.name ||
        info.fullName ||
        (role === "super_admin" || role === "admin" ? "Admin" : "Dashboard")
      setUserName(name)

      const path = getDashboardPathForRole(role)
      setDashboardUrl(path)
    } else {
      setIsAuth(false)
      setUserName("")
      setDashboardUrl("/dashboard")
    }
  }, [user, accessToken, myProfileRes])

  const getComputedDashboardPath = () => {
    const token = getToken()
    const role = normalizeRole(
      getUserRoleFromToken(token) ||
      getUserInfo()?.role ||
      user?.role ||
      (typeof window !== "undefined"
        ? localStorage.getItem("role") || localStorage.getItem("userRole")
        : "") ||
      ""
    )
    return getDashboardPathForRole(role)
  }

  const handleLogout = () => {
    removeToken()
    removeUserInfo()
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("role")
      localStorage.removeItem("userRole")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("fullName")
      localStorage.removeItem("email")
      localStorage.removeItem("userEmail")
    }
    dispatch(logout())
    setIsAuth(false)
    setUserName("")
    SuccessToast("Logged out successfully")
    router.replace("/login")
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'CVs', href: '/cvs' },
    { label: 'K10 Plans', href: '/k10plans' },
    { label: 'About', href: '/about' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={"/"} className="flex items-center gap-3">
            <Image src="/logo.png" alt="K10 Football Logo" width={200} height={200} priority />
          </Link>

          {/* Center Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm transition hover:text-green-400 hover:font-medium hover:border-b-2 hover:border-green-400 pb-1 ${
                  link.href === pathName ? "text-green-400 font-medium border-b-2 border-green-400 pb-1" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="hidden lg:flex items-center gap-1 text-gray-300 hover:text-white transition">
              <Globe className="size-4" />
              <span className="text-sm">EN</span>
              <ChevronDown className="size-3" />
            </button>

            {/* When logged in, hide Login & Join Now, and show user's fullName linked to Dashboard + Logout button */}
            {isMounted && isAuth ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardUrl && dashboardUrl !== "/dashboard" ? dashboardUrl : getComputedDashboardPath()}
                  onClick={(e) => {
                    const target = getComputedDashboardPath()
                    if (target && target !== "/dashboard") {
                      e.preventDefault()
                      router.push(target)
                    }
                  }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00ff88]/50 transition-all text-white group cursor-pointer"
                >
                  <div className="size-8 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88] font-bold text-xs uppercase shrink-0">
                    {userName ? userName.charAt(0).toUpperCase() : <User className="size-4" />}
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-[#00ff88] transition-colors truncate max-w-[120px] sm:max-w-[180px]">
                    {userName}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 transition-all text-red-400 hover:text-red-300 text-xs sm:text-sm font-semibold cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="hidden lg:block cursor-pointer hover:shadow-sm shadow-primary text-gray-300 hover:text-white hover:bg-transparent"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <ButtonPrimary text="Join Now" />
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button className="text-gray-300 hover:text-white hover:bg-transparent p-1">
                  <Menu className="size-8" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-[#1a1a1a] border-gray-700">
                <div className="flex flex-col gap-6">
                  <div className="-ml-5 px-6 pt-3">
                    <Logo />
                  </div>
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-4 px-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium transition"
                      >
                        <Button className="w-full bg-gray-800 hover:bg-green-500">
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Language Selector */}
                  <div className="flex items-center gap-2 text-gray-300 hover:text-white transition text-sm px-6">
                    <Button className="mx-auto bg-gray-800">
                      <Globe className="size-4" />
                      <span>EN</span>
                      <ChevronDown className="size-3" />
                    </Button>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-700 px-6">
                    {isMounted && isAuth ? (
                      <div className="flex flex-col gap-3">
                        <Link
                          href={dashboardUrl && dashboardUrl !== "/dashboard" ? dashboardUrl : getComputedDashboardPath()}
                          onClick={() => {
                            setIsOpen(false)
                            const target = getComputedDashboardPath()
                            if (target && target !== "/dashboard") {
                              router.push(target)
                            }
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:border-[#00ff88]/50 transition-all"
                        >
                          <div className="size-10 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88] font-bold text-sm shrink-0">
                            {userName ? userName.charAt(0).toUpperCase() : <User className="size-5" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Dashboard</span>
                            <span className="text-sm font-bold text-white truncate">{userName}</span>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false)
                            handleLogout()
                          }}
                          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold text-sm transition-all cursor-pointer w-full"
                        >
                          <LogOut className="size-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent border-gray-600 hover:bg-green-500 justify-center text-gray-300 hover:text-white"
                          >
                            Login
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          <ButtonPrimary text="Join Now" className="w-full" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <Image src="/logo.png" alt="K10 Football Logo" width={200} height={200} />
    </div>
  )
}
