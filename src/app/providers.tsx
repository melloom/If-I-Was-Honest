'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { FirebaseAuthProvider } from '@/components/FirebaseAuthProvider'
import { PWAInstall } from '@/components/PWAInstall'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  // Developer console message
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Clear console for clean display
    console.clear()

    // Animated gradient background style
    const bgGradient = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 40px; font-size: 20px; font-weight: bold; border-radius: 10px; text-align: center;'
    const bgDark = 'background: #1a1a1a; color: white; padding: 15px 30px; font-size: 14px; border-radius: 8px; line-height: 1.8;'
    const highlight = 'background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;'
    const linkStyle = 'color: #60a5fa; font-weight: bold; text-decoration: underline;'
    const warningBg = 'background: #dc2626; color: white; padding: 10px 20px; font-size: 13px; font-weight: bold; border-radius: 6px;'
    const accentBg = 'background: #2dd4bf; color: #1a1a1a; padding: 8px 16px; font-size: 15px; font-weight: bold; border-radius: 6px; margin: 10px 0;'

    // Big ASCII art header
    console.log(
      '%c' + `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     ██╗███████╗   ██╗   ██╗    ██╗ ██╗  █████╗  ███████╗         ║
║     ██║██╔════╝   ██║   ██║    ██║ ██║ ██╔══██╗ ██╔════╝         ║
║     ██║█████╗     ██║   ██║ █╗ ██║ ███████╔╝███████╗             ║
║     ██║██╔══╝     ██║   ██║███╗██║ ██╔══██╗ ╚════██║             ║
║     ██║██║        ██║   ╚███╔███╔╝ ██║  ██║ ███████║             ║
║     ╚═╝╚═╝        ╚═╝    ╚══╝╚══╝  ╚═╝  ╚═╝ ╚══════╝             ║
║                                                                   ║
║                 ██╗  ██╗  ██████╗  ███╗   ██╗ ███████╗ ███████╗ ████████╗  ║
║                 ██║  ██║ ██╔═══██╗ ████╗  ██║ ██╔════╝ ██╔════╝ ╚══██╔══╝  ║
║                 ███████║ ██║   ██║ ██╔██╗ ██║ █████╗   ███████╗    ██║     ║
║                 ██╔══██║ ██║   ██║ ██║╚██╗██║ ██╔══╝   ╚════██║    ██║     ║
║                 ██║  ██║ ╚██████╔╝ ██║ ╚████║ ███████╗ ███████║    ██║     ║
║                 ╚═╝  ╚═╝  ╚═════╝  ╚═╝  ╚═══╝ ╚══════╝ ╚══════╝    ╚═╝     ║
║                                                                   ║
║              Your honest thoughts deserve a safe space            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
      `,
      'font-family: monospace; color: #60a5fa; font-weight: bold; font-size: 10px; line-height: 1.3;'
    )

    console.log('%c🎉 HEY THERE, CURIOUS DEVELOPER! 🎉', bgGradient)
    console.log('')
    console.log(
      '%c💭 "The things I wish I could say..."',
      'font-size: 18px; color: #a78bfa; font-style: italic; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);'
    )
    console.log('')
    console.log('')

    console.log(
      '%c👋 Thank you for opening the console and taking a peek under the hood!\n\n' +
      'I\'m genuinely excited that you\'re curious enough to explore the code.\n' +
      'Whether you\'re a fellow developer, a learner, or just someone who\n' +
      'loves to tinker—welcome! This project is built with passion, late\n' +
      'nights, and a whole lot of coffee. ☕',
      bgDark
    )
    console.log('')
    console.log('')

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('%c💭  ABOUT THIS PROJECT', accentBg)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('')
    console.log(
      '%cIf I Was Honest is a %cprivate-first journaling platform%c for\n' +
      'authentic self-reflection and mental wellness. It\'s a safe space\n' +
      'for the thoughts you\'d never say out loud—no judgment, no likes,\n' +
      'no performance.\n\n' +
      '✨ Write privately, reflect deeply, share anonymously when ready.\n' +
      '✨ Track your emotional journey with moods and tags.\n' +
      '✨ Browse anonymous posts from others and feel less alone.\n' +
      '✨ Your data is yours—export anytime, delete anytime.',
      'color: white; font-size: 14px; line-height: 1.8;',
      highlight,
      'color: white; font-size: 14px; line-height: 1.8;'
    )
    console.log('')
    console.log('')

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('%c👨‍💻  BUILT BY MELVIN PERALTA', accentBg)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('')
    console.log(
      '%cHey! I\'m Melvin—a developer passionate about mental wellness,\n' +
      'authenticity, and creating meaningful digital spaces. This project\n' +
      'started as a personal journey and grew into something I hope can\n' +
      'help others find their voice.',
      'color: white; font-size: 14px; line-height: 1.8;'
    )
    console.log('')
    console.log('%c🔗 Let\'s Connect:', 'color: #fbbf24; font-weight: bold; font-size: 15px;')
    console.log(
      '   %c▸ GitHub Profile: %chttps://github.com/melloom',
      'color: white;',
      linkStyle
    )
    console.log(
      '   %c▸ Source Code: %chttps://github.com/melloom/If-I-Was-Honest',
      'color: white;',
      linkStyle
    )
    console.log(
      '   %c▸ Open Source & Transparent—built in public!',
      'color: #10b981; font-weight: bold;'
    )
    console.log('')
    console.log('')

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('%c🛠️  TECH STACK & ARCHITECTURE', accentBg)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('')
    console.log('%c   Frontend:', 'color: #fbbf24; font-weight: bold;')
    console.log('   %c• Next.js 15 (App Router) - React framework', 'color: white; font-size: 13px;')
    console.log('   %c• TypeScript - Type safety & developer experience', 'color: white; font-size: 13px;')
    console.log('   %c• Tailwind CSS - Utility-first styling', 'color: white; font-size: 13px;')
    console.log('   %c• React Query - Server state management', 'color: white; font-size: 13px;')
    console.log('')
    console.log('%c   Backend & Auth:', 'color: #fbbf24; font-weight: bold;')
    console.log('   %c• Firebase Authentication - Secure user auth', 'color: white; font-size: 13px;')
    console.log('   %c• Firestore - NoSQL database for scalability', 'color: white; font-size: 13px;')
    console.log('   %c• Next.js API Routes - Serverless functions', 'color: white; font-size: 13px;')
    console.log('')
    console.log('%c   Deployment & Monitoring:', 'color: #fbbf24; font-weight: bold;')
    console.log('   %c• Vercel - Edge network deployment', 'color: white; font-size: 13px;')
    console.log('   %c• PWA Support - Install as mobile app', 'color: white; font-size: 13px;')
    console.log('   %c• SEO Optimized - Schema.org structured data', 'color: white; font-size: 13px;')
    console.log('')
    console.log('')

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('%c💡  WANT TO CONTRIBUTE?', accentBg)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('')
    console.log(
      '%cI\'d love your help making this platform better! Whether you\'re:\n\n' +
      '%c✓%c Fixing bugs and improving performance\n' +
      '%c✓%c Adding new features or refining existing ones\n' +
      '%c✓%c Improving accessibility and UX\n' +
      '%c✓%c Writing documentation or tests\n' +
      '%c✓%c Sharing feedback and ideas\n\n' +
      '%cAll contributions are welcome! Check out the repo and submit a PR.',
      'color: white; font-size: 14px; line-height: 1.8;',
      'color: #10b981; font-size: 16px;', 'color: white;',
      'color: #10b981; font-size: 16px;', 'color: white;',
      'color: #10b981; font-size: 16px;', 'color: white;',
      'color: #10b981; font-size: 16px;', 'color: white;',
      'color: #10b981; font-size: 16px;', 'color: white;',
      'color: #fbbf24; font-weight: bold;'
    )
    console.log('')
    console.log('')

    console.log('%c⚠️  SECURITY WARNING - READ THIS! ⚠️', warningBg)
    console.log('')
    console.log(
      '%c🛡️ This console is for DEVELOPERS ONLY.\n\n' +
      '%c⚠️ DO NOT paste any code here unless you fully understand it!\n\n' +
      'Scammers may try to trick you into running malicious code that\n' +
      'could:\n' +
      '  • Steal your account credentials\n' +
      '  • Access your private data\n' +
      '  • Compromise your security\n\n' +
      'If someone told you to paste something here, it\'s probably a scam.\n' +
      'Stay safe! 🔒',
      'color: #fef3c7; font-weight: bold; font-size: 13px;',
      'color: #dc2626; font-weight: bold; font-size: 14px; background: #fee2e2; padding: 4px 8px; border-radius: 4px;'
    )
    console.log('')
    console.log('')

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log(
      '%c✨ Happy coding, and remember: your thoughts deserve a safe\n' +
      'space. ✨',
      'font-size: 16px; color: #10b981; font-style: italic; font-weight: bold; text-align: center; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;'
    )
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #60a5fa;')
    console.log('')
    console.log(
      '%c💬 Got questions? Found a bug? Want to chat?\n' +
      '   Open an issue on GitHub or reach out directly!',
      'color: #a78bfa; font-size: 13px; font-style: italic;'
    )
    console.log('')
    console.log('')
  }, [])

  return (
    <FirebaseAuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <PWAInstall />
      </QueryClientProvider>
    </FirebaseAuthProvider>
  )
}
