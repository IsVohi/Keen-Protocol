"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Loader2 } from "lucide-react"

interface KycModalProps {
  open: boolean
  onComplete: () => void
}

export function KycModal({ open, onComplete }: KycModalProps) {
  const [status, setStatus] = useState<"processing" | "done">("processing")

  useEffect(() => {
    if (open) {
      setStatus("processing")
      const timer = setTimeout(() => {
        setStatus("done")
        setTimeout(() => {
          onComplete()
        }, 1000)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [open, onComplete])

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Identity Verification</DialogTitle>
          <DialogDescription>Processing your oracle registration</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          {status === "processing" ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">KYC is happening, please wait...</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-12 w-12 text-success mb-4" />
              <p className="text-sm font-medium">Done</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
