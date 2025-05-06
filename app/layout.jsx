import "./globals.css"
import "./styles/animations.css"
import "./styles/text-generator.css"

export const metadata = {
  title: "Gemini Text Generator",
  description: "AI-powered text generation with Google's Gemini models",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add Tailwind CSS CDN as a temporary solution */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    background: 'hsl(var(--background))',
                    foreground: 'hsl(var(--foreground))',
                    border: 'hsl(var(--border))',
                    input: 'hsl(var(--input))',
                    ring: 'hsl(var(--ring))',
                    primary: {
                      DEFAULT: 'hsl(var(--primary))',
                      foreground: 'hsl(var(--primary-foreground))',
                    },
                    secondary: {
                      DEFAULT: 'hsl(var(--secondary))',
                      foreground: 'hsl(var(--secondary-foreground))',
                    },
                    destructive: {
                      DEFAULT: 'hsl(var(--destructive))',
                      foreground: 'hsl(var(--destructive-foreground))',
                    },
                    muted: {
                      DEFAULT: 'hsl(var(--muted))',
                      foreground: 'hsl(var(--muted-foreground))',
                    },
                    accent: {
                      DEFAULT: 'hsl(var(--accent))',
                      foreground: 'hsl(var(--accent-foreground))',
                    },
                    popover: {
                      DEFAULT: 'hsl(var(--popover))',
                      foreground: 'hsl(var(--popover-foreground))',
                    },
                    card: {
                      DEFAULT: 'hsl(var(--card))',
                      foreground: 'hsl(var(--card-foreground))',
                    },
                  },
                  borderRadius: {
                    lg: 'var(--radius)',
                    md: 'calc(var(--radius) - 2px)',
                    sm: 'calc(var(--radius) - 4px)',
                  },
                }
              }
            }
          `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

