import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Disc } from "lucide-react"
import { loginWithDiscord } from "./actions"
import { SessionReset } from "@/components/session-reset"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#09090b]">
      <SessionReset />
      <Card className="w-[380px] border-[#27272a] bg-[#09090b] p-[40px] shadow-none rounded-xl">
        <div className="flex flex-col items-center gap-4 mb-8">
           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#27272a]/50">
             <Lock className="h-5 w-5 text-[#a1a1aa]" />
           </div>
           <h1 className="text-[20px] font-bold tracking-tight text-[#fafafa]">Restricted Access</h1>
           <p className="text-center text-sm text-[#a1a1aa]">
             Connectez-vous avec votre compte Discord autorisé uniquement.
           </p>
        </div>
        
        <form action={loginWithDiscord} className="flex flex-col gap-4">
            <Button
                type="submit"
                className="h-10 w-full rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-[14px] font-medium text-white transition-colors flex items-center justify-center gap-2"
            >
                <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.18 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.176 2.419 0 1.334-.966 2.419-2.176 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.175 1.086 2.175 2.419 0 1.334-.966 2.419-2.175 2.419z"/></svg>
                Login with Discord
            </Button>
        </form>
      </Card>
    </div>
  )
}
