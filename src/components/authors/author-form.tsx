import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Author } from "@/types/author"

const authorSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
})

type AuthorFormData = z.infer<typeof authorSchema>

interface AuthorFormProps {
  author?: Author
  onSubmit: (data: AuthorFormData) => void
  isLoading?: boolean
}

export function AuthorForm({ author, onSubmit, isLoading }: AuthorFormProps) {
  const form = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: author || {
      name: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Guardando..." : author ? "Actualizar Autor" : "Crear Autor"}
        </Button>
      </form>
    </Form>
  )
}