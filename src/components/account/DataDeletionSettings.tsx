"use client"

import { User } from "@supabase/supabase-js"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteAllVideos, deleteAllPhotos } from "@/app/actions/data-deletion-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DataDeletionSettingsProps {
  user: User
}

export function DataDeletionSettings({ user }: DataDeletionSettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeletePhotos = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAllPhotos(user.id)
      if (result.error) {
        throw new Error(result.error)
      }
      toast.success("All photos have been deleted successfully")
      router.refresh()
    } catch (error) {
      console.error('Error deleting photos:', error)
      toast.error("Failed to delete photos. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteVideos = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAllVideos(user.id)
      if (result.error) {
        throw new Error(result.error)
      }
      toast.success("All videos have been deleted successfully")
      router.refresh()
    } catch (error) {
      console.error('Error deleting videos:', error)
      toast.error("Failed to delete videos. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Delete All Photos</h3>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all photos associated with your account. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                Delete All Photos
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your photos
                  and remove them from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePhotos} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All Photos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Delete All Videos</h3>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all videos associated with your account. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                Delete All Videos
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your videos
                  and remove them from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteVideos} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All Videos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
} 