import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']
const PROTECTED_FILE_PATHS = ['/api', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir acceso a rutas públicas
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Proteger archivos sensibles
  if (PROTECTED_FILE_PATHS.some(path => pathname.startsWith(path))) {
    const firebaseToken = request.cookies.get('firebase-token')
    if (!firebaseToken) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // Verificar token de Firebase en las cookies
  const firebaseToken = request.cookies.get('firebase-token')
  
  // Si no hay token, redirigir al login
  if (!firebaseToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
} 